import { Injectable } from '@nestjs/common';
import { AfroMessageSmsProvider } from './afromessage-sms.provider';
import { NoopSmsProvider } from './noop-sms.provider';
import { SmsProviderError } from './sms-provider.error';
import type { SmsProvider, SmsProviderName } from './sms-provider.interface';
import { SmsEthiopiaSmsProvider } from './sms-ethiopia-sms.provider';

@Injectable()
export class SmsProviderFactory {
  constructor(
    private readonly afroMessage: AfroMessageSmsProvider,
    private readonly smsEthiopia: SmsEthiopiaSmsProvider,
    private readonly noop: NoopSmsProvider,
  ) {}

  create(): SmsProvider {
    const selected = this.selectedProvider();
    if (selected === 'noop') return this.noop;
    if (selected === 'afromessage') {
      if (!this.afroMessage.isConfigured()) {
        throw new SmsProviderError('SMS provider is not configured', selected, {
          reason: 'missing_afromessage_token',
        });
      }
      return this.afroMessage;
    }
    if (selected === 'sms_ethiopia') {
      if (!this.smsEthiopia.isConfigured()) {
        throw new SmsProviderError('SMS provider is not configured', selected, {
          reason: 'missing_sms_ethiopia_api_key',
        });
      }
      return this.smsEthiopia;
    }
    throw new SmsProviderError('Unsupported SMS provider', selected);
  }

  selectedProvider(): SmsProviderName {
    const value = process.env.SMS_PROVIDER?.trim().toLowerCase();
    if (value === 'afromessage') return 'afromessage';
    if (value === 'sms_ethiopia') return 'sms_ethiopia';
    if (value === 'noop') return 'noop';
    if (value) throw new SmsProviderError('Unsupported SMS provider', value);
    if (process.env.NODE_ENV === 'production') return 'sms_ethiopia';
    return 'noop';
  }
}
