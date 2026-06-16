import { SmsProviderError } from './sms-provider.error';
import { SmsProviderFactory } from './sms-provider.factory';
import { AfroMessageSmsProvider } from './afromessage-sms.provider';
import { NoopSmsProvider } from './noop-sms.provider';
import { SmsEthiopiaSmsProvider } from './sms-ethiopia-sms.provider';

describe('SMS providers', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'test' };
    global.fetch = originalFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('selects noop in development when no SMS_PROVIDER is configured', () => {
    delete process.env.SMS_PROVIDER;
    process.env.NODE_ENV = 'development';
    const factory = buildFactory();

    expect(factory.create().name).toBe('noop');
  });

  it('selects AfroMessage when configured as primary', () => {
    process.env.SMS_PROVIDER = 'afromessage';
    process.env.AFROMESSAGE_TOKEN = 'token_123';
    const factory = buildFactory();

    expect(factory.create().name).toBe('afromessage');
  });

  it('selects SMS Ethiopia when configured as primary', () => {
    process.env.SMS_PROVIDER = 'sms_ethiopia';
    process.env.SMS_ETHIOPIA_API_KEY = 'sms_et_key';
    const factory = buildFactory();

    expect(factory.create().name).toBe('sms_ethiopia');
  });

  it('throws in production when default SMS Ethiopia config is missing', () => {
    delete process.env.SMS_PROVIDER;
    delete process.env.SMS_ETHIOPIA_API_KEY;
    process.env.NODE_ENV = 'production';
    const factory = buildFactory();

    expect(() => factory.create()).toThrow(SmsProviderError);
  });

  it('sends AfroMessage OTP with bearer token and query params', async () => {
    process.env.AFROMESSAGE_TOKEN = 'token_123';
    process.env.AFROMESSAGE_IDENTIFIER_ID = 'identifier_123';
    process.env.AFROMESSAGE_SENDER_NAME = 'EJoy';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest
        .fn()
        .mockResolvedValue(
          '{"acknowledge":"success","response":{"message_id":"msg_1"}}',
        ),
    }) as never;
    const provider = new AfroMessageSmsProvider();

    await expect(
      provider.sendOtp({
        phone: '+251900000000',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        provider: 'afromessage',
        providerMessageId: 'msg_1',
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token_123',
        }),
      }),
    );
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [URL, unknown];
    expect(url.href).toContain('https://api.afromessage.com/api/send?');
    expect(url.searchParams.get('from')).toBe('identifier_123');
    expect(url.searchParams.get('sender')).toBe('EJoy');
    expect(url.searchParams.get('to')).toBe('+251900000000');
    expect(url.searchParams.get('message')).toBe('Your code is 123456');
  });

  it('treats AfroMessage non-success responses as provider failures', async () => {
    process.env.AFROMESSAGE_TOKEN = 'token_123';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest
        .fn()
        .mockResolvedValue('{"acknowledge":"error","message":"No balance"}'),
    }) as never;
    const provider = new AfroMessageSmsProvider();

    await expect(
      provider.sendOtp({
        phone: '+251900000000',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).rejects.toThrow(SmsProviderError);
  });

  it('sends SMS Ethiopia OTP with KEY header and JSON body', async () => {
    process.env.SMS_ETHIOPIA_API_KEY = 'sms_et_key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest
        .fn()
        .mockResolvedValue(
          '{"status":"success","message":"SMS sent successfully"}',
        ),
    }) as never;
    const provider = new SmsEthiopiaSmsProvider();

    expect(provider.providerPhone('+251912345678')).toBe('251912345678');
    expect(provider.providerPhone('0912345678')).toBe('251912345678');
    await expect(
      provider.sendOtp({
        phone: '+251912345678',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        provider: 'sms_ethiopia',
        status: 'success',
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          KEY: 'sms_et_key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          msisdn: '251912345678',
          text: 'Your code is 123456',
        }),
      }),
    );
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [URL, unknown];
    expect(url.href).toBe('https://smsethiopia.et/api/sms/send');
  });

  it('accepts SMS Ethiopia delivered responses with success message only', async () => {
    process.env.SMS_ETHIOPIA_API_KEY = 'sms_et_key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue('{"message":"SMS sent successfully"}'),
    }) as never;
    const provider = new SmsEthiopiaSmsProvider();

    await expect(
      provider.sendOtp({
        phone: '+251912345678',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        provider: 'sms_ethiopia',
        status: 'sent',
      }),
    );
  });

  it('accepts SMS Ethiopia delivered responses with sent status values', async () => {
    process.env.SMS_ETHIOPIA_API_KEY = 'sms_et_key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue('{"status":"SENT","message":"Queued"}'),
    }) as never;
    const provider = new SmsEthiopiaSmsProvider();

    await expect(
      provider.sendOtp({
        phone: '+251912345678',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        provider: 'sms_ethiopia',
        status: 'SENT',
      }),
    );
  });

  it('treats SMS Ethiopia non-success responses as provider failures', async () => {
    process.env.SMS_ETHIOPIA_API_KEY = 'sms_et_key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest
        .fn()
        .mockResolvedValue('{"status":"error","message":"Invalid API key"}'),
    }) as never;
    const provider = new SmsEthiopiaSmsProvider();

    await expect(
      provider.sendOtp({
        phone: '+251912345678',
        code: '123456',
        message: 'Your code is 123456',
        purpose: 'signup',
      }),
    ).rejects.toThrow(SmsProviderError);
  });
});

function buildFactory(): SmsProviderFactory {
  return new SmsProviderFactory(
    new AfroMessageSmsProvider(),
    new SmsEthiopiaSmsProvider(),
    new NoopSmsProvider({ warn: jest.fn() } as never),
  );
}
