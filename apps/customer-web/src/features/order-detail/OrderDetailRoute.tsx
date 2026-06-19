import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { OrderDetailPage } from './OrderDetailPage'

export function OrderDetailRoute() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  if (!orderId?.trim()) {
    return <Navigate to="/" replace />
  }

  return (
    <OrderDetailPage
      orderId={orderId}
      onBack={() => navigate('/', { replace: true })}
      onContinueOrdering={() => navigate('/', { replace: true })}
    />
  )
}
