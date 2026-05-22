import { generateKeyPairSync, verify, constants } from 'node:crypto';
import { TelebirrService } from './telebirr.service';

describe('TelebirrService H5 C2B', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
  const originalEnv = process.env;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = {
      ...originalEnv,
      TELEBIRR_BASE_URL: 'https://telebirr.test/apiaccess/payment/gateway',
      TELEBIRR_WEB_BASE_URL: 'https://telebirr.test/payment/web/paygate?',
      TELEBIRR_FABRIC_APP_ID: 'fabric-app',
      TELEBIRR_APP_SECRET: 'fabric-secret',
      TELEBIRR_MERCHANT_APP_ID: 'merchant-app',
      TELEBIRR_MERCHANT_CODE: 'merchant-code',
      TELEBIRR_PRIVATE_KEY: String(privatePem),
      TELEBIRR_PUBLIC_KEY: String(publicPem),
      TELEBIRR_NOTIFY_URL: 'https://example.test/payment/telebirr/webhook',
      TELEBIRR_ORDER_TIMEOUT: '120m',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('builds the signature base string by flattening biz_content and excluding signature fields', () => {
    const service = new TelebirrService();
    const origin = service.buildSignatureBaseString({
      timestamp: '1759388913',
      nonce_str: 'abc',
      method: 'payment.preorder',
      version: '1.0',
      sign: 'ignore',
      sign_type: 'SHA256WithRSA',
      biz_content: {
        merch_order_id: 'order1',
        appid: 'merchant-app',
        sign: 'ignore-inner',
      },
    });

    expect(origin).toBe(
      'appid=merchant-app&merch_order_id=order1&method=payment.preorder&nonce_str=abc&timestamp=1759388913&version=1.0',
    );
  });

  it('signs request objects with RSA-PSS SHA256 signatures', () => {
    const service = new TelebirrService();
    const request = {
      timestamp: '1759388913',
      nonce_str: 'abc',
      method: 'payment.queryorder',
      version: '1.0',
      biz_content: {
        appid: 'merchant-app',
        merch_code: 'merchant-code',
        merch_order_id: 'order1',
      },
    };
    const origin = service.buildSignatureBaseString(request);
    const signature = service.signRequestObject(request);

    expect(
      verify(
        'sha256',
        Buffer.from(origin),
        {
          key: String(publicPem),
          padding: constants.RSA_PKCS1_PSS_PADDING,
          saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        },
        Buffer.from(signature, 'base64'),
      ),
    ).toBe(true);
  });

  it('creates checkout URLs from preOrder prepay_id', async () => {
    const service = new TelebirrService();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            token: 'Bearer fabric-token',
            expirationDate: '20991231235959',
          }),
        ),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            result: 'SUCCESS',
            code: '0',
            biz_content: { prepay_id: 'prepay-123' },
          }),
        ),
      });
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock as never);

    const result = await service.createH5Order('order1', 150);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://telebirr.test/apiaccess/payment/gateway/payment/v1/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-APP-Key': 'fabric-app' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://telebirr.test/apiaccess/payment/gateway/payment/v1/merchant/preOrder',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-APP-Key': 'fabric-app',
          Authorization: 'Bearer fabric-token',
        }),
      }),
    );
    expect(result.rawRequest).toContain('prepay_id=prepay-123');
    expect(result.toPayUrl).toContain(
      'https://telebirr.test/payment/web/paygate?',
    );
    expect(result.toPayUrl).toContain('&version=1.0&trade_type=Checkout');
  });

  it('maps Telebirr trade statuses', () => {
    const service = new TelebirrService();

    expect(service.mapTradeStatusToPaymentStatus('Completed')).toBe('SUCCESS');
    expect(service.mapTradeStatusToPaymentStatus('Paying')).toBe('PENDING');
    expect(service.mapTradeStatusToPaymentStatus('Pending')).toBe('PENDING');
    expect(service.mapTradeStatusToPaymentStatus('Failure')).toBe('FAILED');
    expect(service.mapTradeStatusToPaymentStatus('Expired')).toBe('FAILED');
  });
});
