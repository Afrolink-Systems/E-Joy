import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTableSessionStore } from '../../../store/useTableSessionStore'
import { useCustomerSessionContext } from './useCustomerSessionContext'

describe('useCustomerSessionContext', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, document.title, '/')
    useTableSessionStore.setState({
      sessionShopId: null,
      sessionTableRef: null,
    })
  })

  it('does not keep the initial QR session alive after clearing it', () => {
    window.history.replaceState({}, document.title, '/?shopId=shop-1&table=A1')

    const { result } = renderHook(() => useCustomerSessionContext())

    expect(result.current.hasTableSession).toBe(true)
    expect(result.current.shopId).toBe('shop-1')
    expect(result.current.tableRef).toBe('A1')

    act(() => {
      result.current.clearSession()
    })

    expect(result.current.hasTableSession).toBe(false)
    expect(result.current.shopId).toBe('')
    expect(result.current.tableRef).toBe('')
  })
})
