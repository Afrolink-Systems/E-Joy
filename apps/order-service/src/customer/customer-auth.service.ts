import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { createHash, randomInt } from 'node:crypto';
import {
  AuthSessionService,
  type SessionActor,
} from '../auth/auth-session.service';
import { AuthTokenService } from '../auth/auth-token.service';
import { RateLimitService } from '../auth/rate-limit.service';
import { AppLoggerService } from '../ops/app-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import type { OrderHistoryOrderModel } from '../order/order.types';
import { SMS_PROVIDER, type SmsProvider } from '../sms/sms-provider.interface';
import { SmsProviderError } from '../sms/sms-provider.error';
import type {
  CustomerExpenseSummaryModel,
  CustomerMeModel,
} from './customer-auth.types';

type UserRow = {
  id: string;
  phone: string;
  name: string | null;
  phoneVerifiedAt: Date | null;
  status: string;
};

type PasskeyRow = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: bigint | number;
  deviceType: string | null;
  backedUp: boolean;
  transports: string[];
};

type ChallengeRow = {
  id: string;
  challenge: string;
  expiresAt: Date;
  userId: string | null;
  phone: string | null;
};

type OtpRow = {
  id: string;
  userId: string | null;
  phone: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt: Date;
};

type CustomerDb = PrismaService & {
  user: {
    findUnique(args: unknown): Promise<UserRow | null>;
    upsert(args: unknown): Promise<UserRow>;
    update(args: unknown): Promise<UserRow>;
  };
  customerPasskeyCredential: {
    count(args: unknown): Promise<number>;
    create(args: unknown): Promise<PasskeyRow>;
    findMany(args: unknown): Promise<PasskeyRow[]>;
    findUnique(args: unknown): Promise<PasskeyRow | null>;
    update(args: unknown): Promise<PasskeyRow>;
  };
  customerAuthChallenge: {
    create(args: unknown): Promise<ChallengeRow>;
    findFirst(args: unknown): Promise<ChallengeRow | null>;
    update(args: unknown): Promise<ChallengeRow>;
  };
  customerOtpCode: {
    create(args: unknown): Promise<OtpRow>;
    findFirst(args: unknown): Promise<OtpRow | null>;
    update(args: unknown): Promise<OtpRow>;
  };
  order: {
    findMany(args: unknown): Promise<
      Array<{
        id: string;
        userId: string;
        shopId: string;
        totalAmount: number;
        state: string;
        createdAt: Date;
        shop?: { name: string };
        items?: Array<{
          quantity: number;
          unitPriceSnapshot: number;
          productNameSnapshot: string;
          product?: { name: string; imageUrl: string | null } | null;
        }>;
      }>
    >;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
};

const CUSTOMER_SCOPE = ['customer:read', 'customer:write', 'order:read'];

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authSessions: AuthSessionService,
    private readonly authTokens: AuthTokenService,
    private readonly rateLimit: RateLimitService,
    private readonly appLogger: AppLoggerService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
  ) {}

  private db(): CustomerDb {
    return this.prisma as unknown as CustomerDb;
  }

  normalizePhone(phone: string): string {
    const compact = phone.trim().replace(/[\s()-]/g, '');
    const normalized = compact.startsWith('09')
      ? `+251${compact.slice(1)}`
      : compact.startsWith('9') && compact.length === 9
        ? `+251${compact}`
        : compact;
    if (!/^\+?[0-9]{7,15}$/.test(normalized)) {
      throw new BadRequestException('Enter a valid phone number');
    }
    return normalized;
  }

  customerActor(userId: string): SessionActor {
    return {
      id: userId,
      subjectType: 'CUSTOMER',
      role: 'customer',
      scope: CUSTOMER_SCOPE,
    };
  }

  async activeCustomer(userId: string): Promise<CustomerMeModel | null> {
    const user = await this.db().user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') return null;
    const passkeyCount = await this.db().customerPasskeyCredential.count({
      where: { userId },
    });
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      phoneVerified: Boolean(user.phoneVerifiedAt),
      passkeyCount,
    };
  }

  async requestOtp(input: {
    phone: string;
    purpose: string;
    ip: string;
  }): Promise<{
    expiresAt: string;
    devCode?: string;
  }> {
    const phone = this.normalizePhone(input.phone);
    const purpose = this.normalizePurpose(input.purpose);
    this.rateLimit.consume({
      key: `${input.ip}:${phone}:${purpose}`,
      label: 'customer_otp_request',
      limit: 3,
      windowMs: 10 * 60_000,
    });
    const user = await this.ensureCustomer(phone);
    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60_000);
    await this.db().customerOtpCode.create({
      data: {
        userId: user.id,
        phone,
        purpose,
        codeHash: this.hashOtp(phone, purpose, code),
        expiresAt,
      },
    });
    await this.sendOtpSms(phone, code, purpose);
    this.appLogger.info('customer.otp.requested', { phone, purpose });
    return {
      expiresAt: expiresAt.toISOString(),
      devCode: this.shouldExposeOtp() ? code : undefined,
    };
  }

  async verifyOtp(input: {
    phone: string;
    purpose: string;
    code: string;
    ip: string;
  }): Promise<UserRow> {
    const phone = this.normalizePhone(input.phone);
    const purpose = this.normalizePurpose(input.purpose);
    this.rateLimit.consume({
      key: `${input.ip}:${phone}:${purpose}`,
      label: 'customer_otp_verify',
      limit: 6,
      windowMs: 10 * 60_000,
    });
    const otp = await this.db().customerOtpCode.findFirst({
      where: {
        phone,
        purpose,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    if (otp.attempts >= 5) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    const code = input.code.trim();
    const ok = this.hashOtp(phone, purpose, code) === otp.codeHash;
    if (!ok) {
      await this.db().customerOtpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid or expired code');
    }
    await this.db().customerOtpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    const user = await this.db().user.update({
      where: { phone },
      data: { phoneVerifiedAt: new Date(), status: 'ACTIVE' },
    });
    this.appLogger.info('customer.otp.verified', { userId: user.id, purpose });
    return user;
  }

  async beginPasskeyRegistration(phoneInput: string): Promise<string> {
    const phone = this.normalizePhone(phoneInput);
    const user = await this.ensureVerifiedCustomer(phone);
    const credentials = await this.db().customerPasskeyCredential.findMany({
      where: { userId: user.id },
    });
    const options = await generateRegistrationOptions({
      rpName: this.rpName(),
      rpID: this.rpId(),
      userName: phone,
      userID: Buffer.from(user.id),
      userDisplayName: user.name ?? phone,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      excludeCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
        transports: credential.transports as never,
      })),
    });
    await this.db().customerAuthChallenge.create({
      data: {
        userId: user.id,
        phone,
        purpose: 'passkey_registration',
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    return JSON.stringify(options);
  }

  async finishPasskeyRegistration(input: {
    phone: string;
    responseJson: string;
  }): Promise<UserRow> {
    const phone = this.normalizePhone(input.phone);
    const user = await this.ensureVerifiedCustomer(phone);
    const challenge = await this.requireChallenge({
      userId: user.id,
      phone,
      purpose: 'passkey_registration',
    });
    const response = JSON.parse(input.responseJson) as RegistrationResponseJSON;
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin(),
      expectedRPID: this.rpId(),
      requireUserVerification: false,
    });
    if (!verification.verified || !verification.registrationInfo) {
      throw new UnauthorizedException('Passkey registration failed');
    }
    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;
    await this.db().customerPasskeyCredential.create({
      data: {
        userId: user.id,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: response.response.transports ?? [],
      },
    });
    await this.consumeChallenge(challenge.id);
    this.appLogger.info('customer.passkey.registered', { userId: user.id });
    return user;
  }

  async beginPasskeyLogin(phoneInput: string): Promise<string> {
    const phone = this.normalizePhone(phoneInput);
    const user = await this.ensureVerifiedCustomer(phone);
    const credentials = await this.db().customerPasskeyCredential.findMany({
      where: { userId: user.id },
    });
    if (credentials.length === 0) {
      throw new BadRequestException(
        'No passkey is registered for this account',
      );
    }
    const options = await generateAuthenticationOptions({
      rpID: this.rpId(),
      allowCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
        transports: credential.transports as never,
      })),
      userVerification: 'preferred',
    });
    await this.db().customerAuthChallenge.create({
      data: {
        userId: user.id,
        phone,
        purpose: 'passkey_login',
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    return JSON.stringify(options);
  }

  async finishPasskeyLogin(input: {
    phone: string;
    responseJson: string;
  }): Promise<UserRow> {
    const phone = this.normalizePhone(input.phone);
    const user = await this.ensureVerifiedCustomer(phone);
    const response = JSON.parse(
      input.responseJson,
    ) as AuthenticationResponseJSON;
    const credential = await this.db().customerPasskeyCredential.findUnique({
      where: { credentialId: response.id },
    });
    if (!credential || credential.userId !== user.id) {
      throw new UnauthorizedException('Passkey login failed');
    }
    const challenge = await this.requireChallenge({
      userId: user.id,
      phone,
      purpose: 'passkey_login',
    });
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin(),
      expectedRPID: this.rpId(),
      credential: {
        id: credential.credentialId,
        publicKey: credential.publicKey,
        counter: Number(credential.counter),
        transports: credential.transports as never,
      },
      requireUserVerification: false,
    });
    if (!verification.verified) {
      throw new UnauthorizedException('Passkey login failed');
    }
    await this.db().customerPasskeyCredential.update({
      where: { id: credential.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter) },
    });
    await this.consumeChallenge(challenge.id);
    this.appLogger.info('customer.passkey.login', { userId: user.id });
    return user;
  }

  clientIp(req?: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
  }): string {
    return this.rateLimit.getClientIp(req);
  }

  async issueCustomerAuth(user: { id: string }): Promise<{
    accessToken: string;
    expiresAt: string;
    refreshToken: string;
  }> {
    const session = await this.authSessions.createSession({
      subjectType: 'CUSTOMER',
      subjectId: user.id,
    });
    const signed = this.authTokens.signAccessToken(
      this.customerActor(user.id),
      session.sessionId,
    );
    return { ...signed, refreshToken: session.refreshToken };
  }

  async claimCustomerOrders(
    userId: string,
    orderIds: string[],
  ): Promise<number> {
    const ids = Array.from(
      new Set(orderIds.map((id) => id.trim()).filter(Boolean)),
    ).slice(0, 50);
    if (ids.length === 0) return 0;
    const result = await this.db().order.updateMany({
      where: {
        id: { in: ids },
        userId: { startsWith: 'guest' },
      },
      data: { userId },
    });
    return result.count;
  }

  async customerOrders(userId: string): Promise<OrderHistoryOrderModel[]> {
    const rows = await this.db().order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return rows.map((order) => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.state,
      createdAt: order.createdAt.toISOString(),
      items:
        order.items?.map((item) => ({
          quantity: item.quantity,
          priceAtTime: item.unitPriceSnapshot,
          product: {
            name: item.product?.name ?? item.productNameSnapshot,
            imageUrl: item.product?.imageUrl ?? null,
          },
        })) ?? [],
    }));
  }

  async expenseSummary(
    userId: string,
    range?: { from?: string; to?: string },
  ): Promise<CustomerExpenseSummaryModel> {
    const createdAt = this.dateRange(range);
    const rows = await this.db().order.findMany({
      where: {
        userId,
        ...(createdAt ? { createdAt } : {}),
      },
      include: { shop: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const byShop = new Map<
      string,
      {
        shopId: string;
        shopName: string;
        orderCount: number;
        totalAmount: number;
      }
    >();
    let totalAmount = 0;
    for (const order of rows) {
      totalAmount += order.totalAmount;
      const current = byShop.get(order.shopId) ?? {
        shopId: order.shopId,
        shopName: order.shop?.name ?? 'Restaurant',
        orderCount: 0,
        totalAmount: 0,
      };
      current.orderCount += 1;
      current.totalAmount += order.totalAmount;
      byShop.set(order.shopId, current);
    }
    return {
      orderCount: rows.length,
      totalAmount,
      byRestaurant: Array.from(byShop.values()),
    };
  }

  private async ensureCustomer(phone: string): Promise<UserRow> {
    return this.db().user.upsert({
      where: { phone },
      update: { status: 'ACTIVE' },
      create: { phone, status: 'ACTIVE' },
    });
  }

  private async ensureVerifiedCustomer(phone: string): Promise<UserRow> {
    const user = await this.ensureCustomer(phone);
    if (!user.phoneVerifiedAt) {
      throw new BadRequestException('Verify phone before continuing');
    }
    return user;
  }

  private normalizePurpose(purpose: string): string {
    const value = purpose.trim().toLowerCase();
    if (!['signup', 'login', 'recovery'].includes(value)) {
      throw new BadRequestException('Unsupported OTP purpose');
    }
    return value;
  }

  private hashOtp(phone: string, purpose: string, code: string): string {
    return createHash('sha256')
      .update(
        `${phone}:${purpose}:${code}:${process.env.JWT_ACCESS_SECRET ?? 'dev'}`,
      )
      .digest('hex');
  }

  private shouldExposeOtp(): boolean {
    return (
      process.env.CUSTOMER_OTP_EXPOSE_CODE === 'true' ||
      process.env.NODE_ENV !== 'production'
    );
  }

  private async sendOtpSms(
    phone: string,
    code: string,
    purpose: string,
  ): Promise<void> {
    try {
      const result = await this.smsProvider.sendOtp({
        phone,
        code,
        purpose,
        message: this.otpMessage(code),
      });
      this.appLogger.info('customer.otp.sms_sent', {
        phone,
        purpose,
        provider: result.provider,
        providerMessageId: result.providerMessageId,
        status: result.status,
      });
    } catch (error) {
      this.appLogger.warn('customer.otp.sms_failed', {
        provider:
          error instanceof SmsProviderError
            ? (error.provider ?? this.smsProvider.name)
            : this.smsProvider.name,
        metadata:
          error instanceof SmsProviderError ? error.metadata : undefined,
        reason: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    }
  }

  private otpMessage(code: string): string {
    return `Your E-Joy verification code is ${code}. It expires in 10 minutes.`;
  }

  private rpName(): string {
    return process.env.CUSTOMER_PASSKEY_RP_NAME?.trim() || 'E-Joy';
  }

  private rpId(): string {
    return (
      process.env.CUSTOMER_PASSKEY_RP_ID?.trim() ||
      new URL(this.origin()).hostname
    );
  }

  private origin(): string {
    return (
      process.env.CUSTOMER_WEB_ORIGIN?.replace(/\/$/, '') ||
      process.env.VITE_CUSTOMER_WEB_URL?.replace(/\/$/, '') ||
      'http://localhost:9601'
    );
  }

  private async requireChallenge(input: {
    userId: string;
    phone: string;
    purpose: string;
  }): Promise<ChallengeRow> {
    const challenge = await this.db().customerAuthChallenge.findFirst({
      where: {
        userId: input.userId,
        phone: input.phone,
        purpose: input.purpose,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || challenge.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Passkey challenge expired');
    }
    return challenge;
  }

  private async consumeChallenge(id: string): Promise<void> {
    await this.db().customerAuthChallenge.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  private dateRange(range?: { from?: string; to?: string }) {
    if (!range?.from && !range?.to) return undefined;
    return {
      ...(range.from ? { gte: new Date(range.from) } : {}),
      ...(range.to ? { lte: new Date(range.to) } : {}),
    };
  }
}
