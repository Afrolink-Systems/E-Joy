import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../ops/app-logger.service';
import type {
  SmsOtpInput,
  SmsProvider,
  SmsSendResult,
} from './sms-provider.interface';

@Injectable()
export class NoopSmsProvider implements SmsProvider {
  readonly name = 'noop' as const;

  constructor(private readonly appLogger: AppLoggerService) {}

  async sendOtp(input: SmsOtpInput): Promise<SmsSendResult> {
    this.appLogger.warn('customer.otp.sms_noop', {
      provider: this.name,
      phone: input.phone,
      purpose: input.purpose,
    });
    return { provider: this.name, status: 'skipped' };
  }
}
