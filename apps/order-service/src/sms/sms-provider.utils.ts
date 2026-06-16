export function providerErrorMessage(
  body: { message?: string; response?: unknown; error?: unknown },
  bodyText: string,
): string {
  if (body.message) return body.message;
  if (body.error) return stringifyProviderValue(body.error);
  if (body.response) return stringifyProviderValue(body.response);
  return bodyText.slice(0, 500) || 'unknown';
}

export function normalizeEthiopianSmsPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) return digits;
  if (digits.startsWith('09') && digits.length === 10) {
    return `251${digits.slice(1)}`;
  }
  if (digits.startsWith('9') && digits.length === 9) {
    return `251${digits}`;
  }
  return digits;
}

function stringifyProviderValue(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 500);
  try {
    return JSON.stringify(value).slice(0, 500);
  } catch {
    return 'unreadable_provider_response';
  }
}
