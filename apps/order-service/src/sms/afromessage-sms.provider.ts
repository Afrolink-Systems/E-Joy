import { Injectable } from '@nestjs/common';
import type {
  SmsOtpInput,
  SmsProvider,
  SmsSendResult,
} from './sms-provider.interface';
import { SmsProviderError } from './sms-provider.error';
import { providerErrorMessage } from './sms-provider.utils';

@Injectable()
export class AfroMessageSmsProvider implements SmsProvider {
  readonly name = 'afromessage' as const;

  isConfigured(): boolean {
    return Boolean(this.token());
  }

  async sendOtp(input: SmsOtpInput): Promise<SmsSendResult> {
    const token = this.token();
    if (!token) {
      throw new SmsProviderError('SMS provider is not configured', this.name, {
        reason: 'missing_afromessage_token',
      });
    }
    const url = new URL('/api/send', this.baseUrl());
    url.searchParams.set('from', this.identifierId() ?? '');
    url.searchParams.set('sender', this.senderName() ?? '');
    url.searchParams.set('to', input.phone);
    url.searchParams.set('message', input.message);
    const callbackUrl = this.callbackUrl();
    if (callbackUrl) {
      url.searchParams.set('callback', callbackUrl);
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const bodyText = await response.text();
      const body = this.parseBody(bodyText);
      if (!response.ok || body.acknowledge !== 'success') {
        throw new SmsProviderError('Could not send OTP SMS', this.name, {
          status: response.status,
          acknowledge: body.acknowledge ?? 'unknown',
          message: providerErrorMessage(body, bodyText),
        });
      }
      return {
        provider: this.name,
        providerMessageId: this.providerMessageId(body.response),
        status: body.acknowledge,
        raw: body.response,
      };
    } catch (error) {
      if (error instanceof SmsProviderError) throw error;
      throw new SmsProviderError('Could not send OTP SMS', this.name, {
        reason: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  private parseBody(bodyText: string): {
    acknowledge?: string;
    response?: unknown;
    message?: string;
    error?: unknown;
  } {
    try {
      return bodyText
        ? (JSON.parse(bodyText) as {
            acknowledge?: string;
            response?: unknown;
            message?: string;
            error?: unknown;
          })
        : {};
    } catch {
      return {};
    }
  }

  private providerMessageId(response: unknown): string | undefined {
    if (!response || typeof response !== 'object') return undefined;
    const value = (response as Record<string, unknown>).message_id;
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : undefined;
  }

  private token(): string | undefined {
    return (
      process.env.AFROMESSAGE_TOKEN?.trim() ||
      process.env.AFRO_MESSAGE_TOKEN?.trim() ||
      undefined
    );
  }

  private identifierId(): string | undefined {
    return (
      process.env.AFROMESSAGE_IDENTIFIER_ID?.trim() ||
      process.env.AFRO_MESSAGE_IDENTIFIER_ID?.trim() ||
      undefined
    );
  }

  private senderName(): string | undefined {
    return (
      process.env.AFROMESSAGE_SENDER_NAME?.trim() ||
      process.env.AFRO_MESSAGE_SENDER_NAME?.trim() ||
      undefined
    );
  }

  private callbackUrl(): string | undefined {
    return (
      process.env.AFROMESSAGE_CALLBACK_URL?.trim() ||
      process.env.AFRO_MESSAGE_CALLBACK_URL?.trim() ||
      undefined
    );
  }

  private baseUrl(): string {
    return (
      process.env.AFROMESSAGE_API_BASE_URL?.trim() ||
      'https://api.afromessage.com'
    );
  }
}
