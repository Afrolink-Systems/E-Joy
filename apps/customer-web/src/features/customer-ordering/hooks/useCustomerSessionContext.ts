import { useTableSession } from '../../../hooks/useTableSession'
import {
  readTableSessionFromLocalStorage,
  useTableSessionStore,
} from '../../../store/useTableSessionStore'

export function useCustomerSessionContext() {
  useTableSession(true)
  const cachedSession = readTableSessionFromLocalStorage()
  const sessionShopId = useTableSessionStore((s) => s.sessionShopId)
  const sessionTableRef = useTableSessionStore((s) => s.sessionTableRef)
  const clearSession = useTableSessionStore((s) => s.clearSession)
  const shopId = sessionShopId ?? cachedSession.shopId ?? ''
  const tableRef = sessionTableRef ?? cachedSession.table ?? ''

  return {
    clearSession,
    hasTableSession: Boolean(shopId.trim() && tableRef.trim()),
    shopId,
    tableRef,
  }
}
