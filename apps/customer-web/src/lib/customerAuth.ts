export const CUSTOMER_ACCESS_TOKEN_KEY = 'ejoy_customer_access_token_v1'
export const CUSTOMER_AUTH_EVENT = 'ejoy_customer_auth_changed'

export function getCustomerAccessToken(): string {
  try {
    return localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setCustomerAccessToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY)
    }
    window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT))
  } catch {
    /* ignore storage restrictions */
  }
}

export function clearCustomerAccessToken(): void {
  setCustomerAccessToken('')
}

