import { Route, Routes } from 'react-router-dom'
import { CustomerOrderingPage } from '../features/customer-ordering/CustomerOrderingPage'
import { MockTelebirrRoute } from '../features/mock-payment/MockTelebirrRoute'
import { OrderDetailRoute } from '../features/order-detail/OrderDetailRoute'
import { OrderHistoryPage } from '../features/order-history/OrderHistoryPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/mock-telebirr" element={<MockTelebirrRoute />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailRoute />} />
      <Route path="/*" element={<CustomerOrderingPage />} />
    </Routes>
  )
}
