import { ServiceUnavailableException } from '@nestjs/common';

export class SmsProviderError extends ServiceUnavailableException {
  constructor(
    message = 'Could not send OTP SMS',
    readonly provider?: string,
    readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
  }
}
