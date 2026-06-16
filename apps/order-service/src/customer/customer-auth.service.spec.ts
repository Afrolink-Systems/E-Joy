import { UnauthorizedException } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import type { SmsProvider } from '../sms/sms-provider.interface';

function buildService(smsProvider?: SmsProvider) {
  const user = {
    id: 'user_1',
    phone: '+251900000000',
    name: null,
    phoneVerifiedAt: null,
    status: 'ACTIVE',
  };
  const otpRows: Array<Record<string, unknown>> = [];
  const prisma = {
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ ...user, phoneVerifiedAt: new Date() }),
      upsert: jest.fn().mockResolvedValue(user),
      update: jest
        .fn()
        .mockResolvedValue({ ...user, phoneVerifiedAt: new Date() }),
    },
    customerPasskeyCredential: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    customerAuthChallenge: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    customerOtpCode: {
      create: jest
        .fn()
        .mockImplementation(
          async ({ data }: { data: Record<string, unknown> }) => {
            const row = {
              id: `otp_${otpRows.length + 1}`,
              attempts: 0,
              createdAt: new Date(),
              ...data,
            };
            otpRows.push(row);
            return row;
          },
        ),
      findFirst: jest
        .fn()
        .mockImplementation(
          async (args?: { where?: { createdAt?: { gte?: Date } } }) => {
            const createdAfter = args?.where?.createdAt?.gte;
            if (createdAfter) {
              for (let index = otpRows.length - 1; index >= 0; index -= 1) {
                const row = otpRows[index];
                if (
                  row.createdAt instanceof Date &&
                  row.createdAt >= createdAfter
                ) {
                  return row;
                }
              }
              return null;
            }
            return otpRows.at(-1) ?? null;
          },
        ),
      update: jest
        .fn()
        .mockImplementation(
          async ({
            where,
            data,
          }: {
            where: { id: string };
            data: Record<string, unknown>;
          }) => {
            const row = otpRows.find((item) => item.id === where.id);
            if (row) Object.assign(row, data);
            return row;
          },
        ),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  const rateLimit = {
    consume: jest.fn(),
    getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  };
  const sms =
    smsProvider ??
    ({
      name: 'noop',
      sendOtp: jest.fn().mockResolvedValue({
        provider: 'noop',
        status: 'skipped',
      }),
    } as SmsProvider);
  const service = new CustomerAuthService(
    prisma as never,
    {
      createSession: jest.fn(),
    } as never,
    {
      signAccessToken: jest.fn(),
    } as never,
    rateLimit as never,
    {
      info: jest.fn(),
      warn: jest.fn(),
    } as never,
    sms,
  );
  return { service, prisma, otpRows, sms };
}

describe('CustomerAuthService OTP and claiming', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('normalizes Ethiopian local mobile numbers', () => {
    const { service } = buildService();

    expect(service.normalizePhone('0912345678')).toBe('+251912345678');
    expect(service.normalizePhone('912345678')).toBe('+251912345678');
    expect(service.normalizePhone('+251912345678')).toBe('+251912345678');
  });

  it('issues and consumes a customer OTP once', async () => {
    const { service, prisma } = buildService();

    const requested = await service.requestOtp({
      phone: '+251 900 000 000',
      purpose: 'signup',
      ip: '127.0.0.1',
    });

    expect(requested.devCode).toMatch(/^\d{6}$/);
    const user = await service.verifyOtp({
      phone: '+251900000000',
      purpose: 'signup',
      code: requested.devCode ?? '',
      ip: '127.0.0.1',
    });

    expect(user.id).toBe('user_1');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { phone: '+251900000000' },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
    expect(prisma.customerOtpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ consumedAt: expect.any(Date) }),
      }),
    );
  });

  it('sends OTP through the configured SMS provider', async () => {
    const sendOtp = jest.fn().mockResolvedValue({
      provider: 'noop',
      status: 'skipped',
    });
    const sms = {
      name: 'noop',
      sendOtp,
    } as SmsProvider;
    const { service } = buildService(sms);

    const requested = await service.requestOtp({
      phone: '+251900000000',
      purpose: 'signup',
      ip: '127.0.0.1',
    });

    expect(sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '+251900000000',
        code: requested.devCode,
        purpose: 'signup',
        message: expect.stringContaining(requested.devCode ?? ''),
      }),
    );
  });

  it('rejects incorrect OTP codes and increments attempts', async () => {
    const { service, prisma } = buildService();
    await service.requestOtp({
      phone: '+251900000000',
      purpose: 'login',
      ip: '127.0.0.1',
    });

    await expect(
      service.verifyOtp({
        phone: '+251900000000',
        purpose: 'login',
        code: '000000',
        ip: '127.0.0.1',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prisma.customerOtpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { attempts: { increment: 1 } },
      }),
    );
  });

  it('claims only remembered guest orders for the customer', async () => {
    const { service, prisma } = buildService();

    await expect(
      service.claimCustomerOrders('user_1', [
        ' order_1 ',
        'order_1',
        'order_2',
      ]),
    ).resolves.toBe(2);
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['order_1', 'order_2'] },
        userId: { startsWith: 'guest' },
      },
      data: { userId: 'user_1' },
    });
  });
});
