export type SmsProviderName = 'afromessage' | 'sms_ethiopia' | 'noop';

export type SmsOtpInput = {
  phone: string;
  code: string;
  message: string;
  purpose: string;
};

export type SmsSendResult = {
  provider: SmsProviderName;
  providerMessageId?: string;
  status?: string;
  raw?: unknown;
};

export interface SmsProvider {
  readonly name: SmsProviderName;
  sendOtp(input: SmsOtpInput): Promise<SmsSendResult>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
