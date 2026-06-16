import { Injectable } from '@nestjs/common';
import type {
  SmsOtpInput,
  SmsProvider,
  SmsSendResult,
} from './sms-provider.interface';
import { SmsProviderError } from './sms-provider.error';
import {
  normalizeEthiopianSmsPhone,
  providerErrorMessage,
} from './sms-provider.utils';

@Injectable()
export class SmsEthiopiaSmsProvider implements SmsProvider {
  readonly name = 'sms_ethiopia' as const;

  isConfigured(): boolean {
    return Boolean(this.apiKey());
  }

  providerPhone(phone: string): string {
    return normalizeEthiopianSmsPhone(phone);
  }

  async sendOtp(input: SmsOtpInput): Promise<SmsSendResult> {
    const apiKey = this.apiKey();
    if (!apiKey) {
      throw new SmsProviderError('SMS provider is not configured', this.name, {
        reason: 'missing_sms_ethiopia_api_key',
      });
    }
    try {
      const response = await fetch(new URL('/api/sms/send', this.baseUrl()), {
        method: 'POST',
        headers: {
          KEY: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msisdn: this.providerPhone(input.phone),
          text: input.message,
        }),
      });
      const bodyText = await response.text();
      this.debugResponse(response, bodyText);
      const body = this.parseBody(bodyText);
      if (!response.ok || this.isFailureResponse(body, bodyText)) {
        throw new SmsProviderError('Could not send OTP SMS', this.name, {
          status: response.status,
          providerStatus: this.providerStatus(body) ?? 'unknown',
          message: providerErrorMessage(body, bodyText),
        });
      }
      return {
        provider: this.name,
        status: this.successStatus(body, bodyText),
        raw: body,
      };
    } catch (error) {
      if (error instanceof SmsProviderError) throw error;
      throw new SmsProviderError('Could not send OTP SMS', this.name, {
        reason: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  private parseBody(bodyText: string): {
    status?: unknown;
    message?: string;
    response?: unknown;
    error?: unknown;
    success?: unknown;
  } {
    try {
      return bodyText
        ? (JSON.parse(bodyText) as {
            status?: unknown;
            message?: string;
            response?: unknown;
            error?: unknown;
            success?: unknown;
          })
        : {};
    } catch {
      return {};
    }
  }

  private isFailureResponse(
    body: {
      status?: unknown;
      message?: string;
      error?: unknown;
      success?: unknown;
    },
    bodyText: string,
  ): boolean {
    if (body.success === false || body.error) {
      return true;
    }

    const status = this.providerStatus(body)?.toLowerCase().trim();
    if (
      status &&
      ['error', 'failed', 'failure', 'rejected', 'invalid'].includes(status)
    ) {
      return true;
    }

    const message = body.message?.toLowerCase().trim() || '';
    if (
      /(invalid|failed|failure|error|insufficient|unauthori[sz]ed)/.test(
        message,
      )
    ) {
      return true;
    }

    const raw = bodyText.toLowerCase();
    return /(invalid|failed|failure|error|insufficient|unauthori[sz]ed)/.test(
      raw,
    );
  }

  private providerStatus(body: { status?: unknown }): string | undefined {
    if (typeof body.status === 'string' || typeof body.status === 'number') {
      return String(body.status);
    }
    return undefined;
  }

  private successStatus(
    body: { status?: unknown; message?: string },
    bodyText: string,
  ): string {
    const status = this.providerStatus(body);
    if (status) return status;
    const text = `${body.message ?? ''} ${bodyText}`.toLowerCase();
    if (text.includes('sent') || text.includes('successfully')) return 'sent';
    return 'accepted';
  }

  private debugResponse(response: Response, bodyText: string): void {
    if (process.env.SMS_PROVIDER_DEBUG !== 'true') return;
    console.info('[sms_ethiopia] send response', {
      ok: response.ok,
      status: response.status,
      body: bodyText.slice(0, 1000),
    });
  }

  private apiKey(): string | undefined {
    return process.env.SMS_ETHIOPIA_API_KEY?.trim() || undefined;
  }

  private baseUrl(): string {
    return (
      process.env.SMS_ETHIOPIA_API_BASE_URL?.trim() || 'https://smsethiopia.et'
    );
  }
}
