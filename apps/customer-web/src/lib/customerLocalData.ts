export const CART_STORAGE_KEY = 'ejoy_cart_v1'
export const CUSTOMER_ORDER_IDS_KEY = 'ejoy_customer_order_ids_v1'

export function clearPersistedCustomerOrderingData(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(CUSTOMER_ORDER_IDS_KEY)
  } catch {
    /* ignore storage restrictions */
  }
}
