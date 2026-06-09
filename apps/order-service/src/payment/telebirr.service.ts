import { Injectable, Logger } from '@nestjs/common';
import {
  constants,
  createVerify,
  randomBytes,
  sign as cryptoSign,
  timingSafeEqual,
} from 'node:crypto';
import { readFileSync } from 'node:fs';
import { request as httpsRequest } from 'node:https';
import type {
  FabricTokenResponse,
  TelebirrCheckoutResult,
  TelebirrNotifyPayload,
  TelebirrPreOrderResponse,
  TelebirrQueryOrderResponse,
  TelebirrSignedRequest,
} from './telebirr.types';

const DEFAULT_API_BASE =
  'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway';
const DEFAULT_WEB_BASE =
  'https://developerportal.ethiotelebirr.et:38443/payment/web/paygate?';
const SIGN_EXCLUDED_FIELDS = new Set([
  'sign',
  'sign_type',
  'header',
  'refund_info',
  'openType',
  'raw_request',
  'biz_content',
]);

type TelebirrConfig = {
  apiBase: string;
  webBaseUrl: string;
  fabricAppId: string;
  appSecret: string;
  merchantAppId: string;
  merchantCode: string;
  privateKeyPem: string;
  publicKeyPem: string;
  notifyUrl: string;
  returnUrl: string;
  timeoutExpress: string;
  caCertPath: string;
  allowInvalidTlsCert: boolean;
  debugRequests: boolean;
};

type TelebirrHttpResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

@Injectable()
export class TelebirrService {
  private readonly logger = new Logger(TelebirrService.name);
  private fabricToken?: { value: string; expiresAtMs: number };

  isConfigured(): boolean {
    const c = this.config();
    return Boolean(
      c.apiBase &&
      c.webBaseUrl &&
      c.fabricAppId &&
      c.appSecret &&
      c.merchantAppId &&
      c.merchantCode &&
      c.privateKeyPem &&
      c.notifyUrl,
    );
  }

  private config(): TelebirrConfig {
    const apiBase =
      process.env.TELEBIRR_BASE_URL ??
      process.env.TELEBIRR_API_BASE ??
      DEFAULT_API_BASE;
    return {
      apiBase: apiBase.replace(/\/$/, ''),
      webBaseUrl: process.env.TELEBIRR_WEB_BASE_URL ?? DEFAULT_WEB_BASE,
      fabricAppId:
        process.env.TELEBIRR_FABRIC_APP_ID?.trim() ??
        process.env.TELEBIRR_APP_ID?.trim() ??
        '',
      appSecret:
        process.env.TELEBIRR_APP_SECRET?.trim() ??
        process.env.TELEBIRR_APP_KEY?.trim() ??
        '',
      merchantAppId:
        process.env.TELEBIRR_MERCHANT_APP_ID?.trim() ??
        process.env.TELEBIRR_APP_ID?.trim() ??
        '',
      merchantCode:
        process.env.TELEBIRR_MERCHANT_CODE?.trim() ??
        process.env.TELEBIRR_SHORT_CODE?.trim() ??
        '',
      privateKeyPem: this.normalizePem(
        process.env.TELEBIRR_PRIVATE_KEY,
        'PRIVATE KEY',
      ),
      publicKeyPem: this.normalizePem(
        process.env.TELEBIRR_PUBLIC_KEY,
        'PUBLIC KEY',
      ),
      notifyUrl: process.env.TELEBIRR_NOTIFY_URL?.trim() ?? '',
      returnUrl:
        process.env.TELEBIRR_RETURN_URL?.trim() ??
        process.env.TELEBIRR_NOTIFY_URL?.trim() ??
        '',
      timeoutExpress: process.env.TELEBIRR_ORDER_TIMEOUT ?? '120m',
      caCertPath: process.env.TELEBIRR_CA_CERT_PATH?.trim() ?? '',
      allowInvalidTlsCert:
        process.env.NODE_ENV !== 'production' &&
        process.env.TELEBIRR_TLS_ALLOW_INVALID_CERT === 'true',
      debugRequests:
        process.env.NODE_ENV !== 'production' &&
        process.env.TELEBIRR_DEBUG_REQUESTS === 'true',
    };
  }

  async applyFabricToken(): Promise<string> {
    const cached = this.fabricToken;
    if (cached && cached.expiresAtMs > Date.now() + 30_000) {
      return cached.value;
    }

    const c = this.config();
    const res = await this.fetchTelebirr(`${c.apiBase}/payment/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-APP-Key': c.fabricAppId,
      },
      body: JSON.stringify({ appSecret: c.appSecret }),
    });
    const text = await res.text();
    const json = this.parseJson<FabricTokenResponse>(
      text,
      'Fabric token response is not JSON',
    );
    if (!res.ok) {
      throw new Error(
        `Fabric token HTTP ${res.status}: ${json.msg ?? json.errorMsg ?? text}`,
      );
    }

    const token =
      json.token ?? json.access_token ?? json.result?.token ?? json.data?.token;
    if (!token) {
      throw new Error('Fabric token missing in response');
    }

    this.fabricToken = {
      value: token,
      expiresAtMs: this.resolveExpirationMs(json),
    };
    return token;
  }

  async createH5Order(
    orderId: string,
    totalAmountMinor: number,
  ): Promise<TelebirrCheckoutResult> {
    if (!this.isConfigured()) {
      throw new Error('Telebirr is not fully configured (check env)');
    }
    const c = this.config();
    const fabricToken = await this.applyFabricToken();
    const title = this.sanitizeTelebirrText(`EJoy Order ${orderId}`);
    const totalAmount = (totalAmountMinor / 100).toFixed(2);
    const bizContent: Record<string, string> = {
      notify_url: c.notifyUrl,
      appid: c.merchantAppId,
      merch_code: c.merchantCode,
      merch_order_id: orderId,
      trade_type: 'Checkout',
      title,
      total_amount: totalAmount,
      trans_currency: 'ETB',
      timeout_express: c.timeoutExpress,
    };
    const request = this.buildSignedRequest('payment.preorder', bizContent);
    this.logPreOrderDebug(c, orderId, title, totalAmount);
    const res = await this.fetchTelebirr(
      `${c.apiBase}/payment/v1/merchant/preOrder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': c.fabricAppId,
          Authorization: fabricToken,
        },
        body: JSON.stringify(request),
      },
    );
    const text = await res.text();
    const json = this.parseJson<TelebirrPreOrderResponse>(
      text,
      'Telebirr preOrder response is not JSON',
    );
    if (!res.ok || (json.result && json.result !== 'SUCCESS')) {
      throw new Error(
        `Telebirr preOrder failed: ${json.msg ?? json.code ?? text}`,
      );
    }
    const prepayId = json.biz_content?.prepay_id;
    if (!prepayId) {
      throw new Error('Telebirr preOrder: prepay_id missing');
    }
    const rawRequest = this.createRawCheckoutRequest(prepayId);
    return {
      prepayId,
      merchOrderId: orderId,
      rawRequest,
      toPayUrl: `${c.webBaseUrl}${rawRequest}&version=1.0&trade_type=Checkout`,
    };
  }

  async queryOrder(orderId: string): Promise<TelebirrQueryOrderResponse> {
    const c = this.config();
    const fabricToken = await this.applyFabricToken();
    const request = this.buildSignedRequest('payment.queryorder', {
      appid: c.merchantAppId,
      merch_code: c.merchantCode,
      merch_order_id: orderId,
    });
    const res = await this.fetchTelebirr(
      `${c.apiBase}/payment/v1/merchant/queryOrder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': c.fabricAppId,
          Authorization: fabricToken,
        },
        body: JSON.stringify(request),
      },
    );
    const text = await res.text();
    const json = this.parseJson<TelebirrQueryOrderResponse>(
      text,
      'Telebirr queryOrder response is not JSON',
    );
    if (!res.ok || (json.result && json.result !== 'SUCCESS')) {
      throw new Error(
        `Telebirr queryOrder failed: ${json.msg ?? json.code ?? text}`,
      );
    }
    return json;
  }

  buildSignedRequest(
    method: string,
    bizContent: Record<string, string>,
  ): TelebirrSignedRequest {
    const request: TelebirrSignedRequest = {
      timestamp: this.createTimestamp(),
      nonce_str: this.createNonceStr(),
      method,
      version: '1.0',
      sign_type: 'SHA256WithRSA',
      sign: '',
      biz_content: bizContent,
    };
    request.sign = this.signRequestObject(request);
    return request;
  }

  createRawCheckoutRequest(prepayId: string): string {
    const c = this.config();
    const map: Record<string, string> = {
      appid: c.merchantAppId,
      merch_code: c.merchantCode,
      nonce_str: this.createNonceStr(),
      prepay_id: prepayId,
      timestamp: this.createTimestamp(),
    };
    const checkoutSign = this.signRequestObject(map);
    return [
      `appid=${map.appid}`,
      `merch_code=${map.merch_code}`,
      `nonce_str=${map.nonce_str}`,
      `prepay_id=${map.prepay_id}`,
      `timestamp=${map.timestamp}`,
      `sign=${checkoutSign}`,
      'sign_type=SHA256WithRSA',
    ].join('&');
  }

  signRequestObject(requestObject: Record<string, unknown>): string {
    const origin = this.buildSignatureBaseString(requestObject);
    const privateKey = this.config().privateKeyPem;
    if (!privateKey) {
      throw new Error('TELEBIRR_PRIVATE_KEY is not set');
    }
    return cryptoSign('sha256', Buffer.from(origin), {
      key: privateKey,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
    }).toString('base64');
  }

  buildSignatureBaseString(requestObject: Record<string, unknown>): string {
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(requestObject)) {
      if (
        SIGN_EXCLUDED_FIELDS.has(key) ||
        value === undefined ||
        value === null
      ) {
        continue;
      }
      const signValue = toSignableString(value);
      if (signValue !== undefined) {
        fields[key] = signValue;
      }
    }
    const bizContent = requestObject.biz_content;
    if (bizContent && typeof bizContent === 'object') {
      for (const [key, value] of Object.entries(
        bizContent as Record<string, unknown>,
      )) {
        if (
          SIGN_EXCLUDED_FIELDS.has(key) ||
          value === undefined ||
          value === null
        ) {
          continue;
        }
        const signValue = toSignableString(value);
        if (signValue !== undefined) {
          fields[key] = signValue;
        }
      }
    }
    return Object.keys(fields)
      .sort()
      .map((key) => `${key}=${fields[key]}`)
      .join('&');
  }

  parseAndVerifyNotifyPayload(body: unknown): TelebirrNotifyPayload {
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid Telebirr notify body');
    }
    const payload = body as Partial<TelebirrNotifyPayload>;
    if (
      !payload.merch_order_id ||
      !payload.payment_order_id ||
      !payload.trade_status ||
      !payload.sign ||
      !payload.sign_type
    ) {
      throw new Error('Telebirr notify payload is missing required fields');
    }
    if (!this.verifySignedPayload(payload as Record<string, unknown>)) {
      throw new Error('Invalid Telebirr notify signature');
    }
    return {
      ...payload,
      merch_order_id: String(payload.merch_order_id),
      payment_order_id: String(payload.payment_order_id),
      trade_status: String(payload.trade_status),
      sign: String(payload.sign),
      sign_type: String(payload.sign_type),
    };
  }

  verifySignedPayload(payload: Record<string, unknown>): boolean {
    const publicKey = this.config().publicKeyPem;
    const allowUnsigned =
      process.env.NODE_ENV !== 'production' &&
      process.env.TELEBIRR_WEBHOOK_ALLOW_UNSIGNED === 'true';
    if (!publicKey) {
      return allowUnsigned;
    }
    const signature = toSignableString(payload.sign) ?? '';
    if (!signature) {
      return false;
    }
    const origin = this.buildSignatureBaseString(payload);
    try {
      const verifier = createVerify('sha256');
      verifier.update(origin);
      verifier.end();
      return verifier.verify(
        {
          key: publicKey,
          padding: constants.RSA_PKCS1_PSS_PADDING,
          saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
        },
        signature,
        'base64',
      );
    } catch (err) {
      this.logger.warn(
        `Telebirr signature verification failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return false;
    }
  }

  mapTradeStatusToPaymentStatus(
    status: string,
  ): 'SUCCESS' | 'FAILED' | 'PENDING' {
    const normalized = status.trim().toUpperCase();
    if (
      normalized === 'COMPLETED' ||
      normalized === 'SUCCESS' ||
      normalized === 'PAY_SUCCESS'
    ) {
      return 'SUCCESS';
    }
    if (
      normalized === 'FAILURE' ||
      normalized === 'FAILED' ||
      normalized === 'EXPIRED' ||
      normalized === 'PAY_FAILED'
    ) {
      return 'FAILED';
    }
    return 'PENDING';
  }

  private createTimestamp(): string {
    return Math.round(Date.now() / 1000).toString();
  }

  private createNonceStr(): string {
    return randomBytes(24)
      .toString('base64url')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 32)
      .padEnd(32, '0');
  }

  sanitizeTelebirrText(value: string): string {
    return value.replace(/[~`!#$%^*()\\\-+=|/<>?;:"[\]{}\\\\&]/g, '').trim();
  }

  private logPreOrderDebug(
    config: TelebirrConfig,
    orderId: string,
    title: string,
    totalAmount: string,
  ): void {
    if (!config.debugRequests) {
      return;
    }
    this.logger.log(
      `Telebirr preOrder debug: ${JSON.stringify({
        apiBase: config.apiBase,
        fabricAppId: this.maskMiddle(config.fabricAppId),
        merchantAppId: this.maskMiddle(config.merchantAppId),
        merchantCode: config.merchantCode,
        merchOrderId: orderId,
        title,
        totalAmount,
        notifyUrlSet: Boolean(config.notifyUrl),
        tokenAuthHeaderExpected: 'token-as-returned',
      })}`,
    );
  }

  private maskMiddle(value: string): string {
    if (value.length <= 8) {
      return value ? '***' : '';
    }
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  private parseJson<T>(text: string, message: string): T {
    try {
      return JSON.parse(text) as T;
    } catch {
      this.logger.warn(`${message}: ${text.slice(0, 300)}`);
      throw new Error(message);
    }
  }

  private async fetchTelebirr(
    url: string,
    init: RequestInit,
  ): Promise<TelebirrHttpResponse> {
    try {
      const c = this.config();
      if (c.caCertPath || c.allowInvalidTlsCert) {
        return await this.fetchTelebirrWithNodeHttps(url, init, c);
      }
      return await fetch(url, init);
    } catch (error) {
      const cause = (error as { cause?: { code?: string; message?: string } })
        .cause;
      const reason =
        cause?.code && cause?.message
          ? `${cause.code}: ${cause.message}`
          : error instanceof Error
            ? error.message
            : String(error);
      throw new Error(`Telebirr network request failed (${url}): ${reason}`);
    }
  }

  private fetchTelebirrWithNodeHttps(
    url: string,
    init: RequestInit,
    config: TelebirrConfig,
  ): Promise<TelebirrHttpResponse> {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error(`Telebirr URL must use https (${url})`);
    }
    const body = typeof init.body === 'string' ? init.body : undefined;
    const headers = this.normalizeRequestHeaders(init.headers);
    const ca = config.caCertPath
      ? readFileSync(config.caCertPath, 'utf8')
      : undefined;

    if (config.allowInvalidTlsCert) {
      this.logger.warn(
        'TELEBIRR_TLS_ALLOW_INVALID_CERT=true is enabled. Use only for local/testbed debugging.',
      );
    }

    return new Promise((resolve, reject) => {
      const req = httpsRequest(
        {
          hostname: parsed.hostname,
          port: parsed.port ? Number(parsed.port) : 443,
          path: `${parsed.pathname}${parsed.search}`,
          method: init.method ?? 'GET',
          headers,
          ca,
          rejectUnauthorized: !config.allowInvalidTlsCert,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          res.on('end', () => {
            const status = res.statusCode ?? 0;
            const text = Buffer.concat(chunks).toString('utf8');
            resolve({
              ok: status >= 200 && status < 300,
              status,
              text: async () => text,
            });
          });
        },
      );

      req.setTimeout(15_000, () => {
        req.destroy(new Error('Telebirr request timed out after 15000ms'));
      });
      req.on('error', reject);
      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  private normalizeRequestHeaders(
    headers: RequestInit['headers'],
  ): Record<string, string> {
    if (!headers) {
      return {};
    }
    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }
    if (Array.isArray(headers)) {
      return Object.fromEntries(
        headers.map(([key, value]) => [key, String(value)]),
      );
    }
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, String(value)]),
    );
  }

  private normalizePem(
    value: string | undefined,
    label: 'PRIVATE KEY' | 'PUBLIC KEY',
  ): string {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.startsWith('<')) {
      return '';
    }
    const expanded = trimmed.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    if (expanded.includes('-----BEGIN ')) {
      return expanded;
    }
    const compact = expanded.replace(/\s+/g, '');
    const lines = compact.match(/.{1,64}/g)?.join('\n') ?? compact;
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  }

  private resolveExpirationMs(json: FabricTokenResponse): number {
    const raw =
      json.expirationDate ??
      json.result?.expirationDate ??
      json.data?.expirationDate;
    if (!raw) {
      return Date.now() + 10 * 60 * 1000;
    }
    const parsed = this.parseTelebirrDate(raw);
    return parsed ?? Date.now() + 10 * 60 * 1000;
  }

  private parseTelebirrDate(value: string): number | null {
    if (!/^\d{14}$/.test(value)) {
      return null;
    }
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(8, 10));
    const minute = Number(value.slice(10, 12));
    const second = Number(value.slice(12, 14));
    const utc = Date.UTC(year, month, day, hour, minute, second);
    return Number.isFinite(utc) ? utc : null;
  }

  timingSafeSignatureEqual(a: string, b: string): boolean {
    try {
      const left = Buffer.from(a, 'base64');
      const right = Buffer.from(b, 'base64');
      return left.length === right.length && timingSafeEqual(left, right);
    } catch {
      return false;
    }
  }
}

function toSignableString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return undefined;
}
