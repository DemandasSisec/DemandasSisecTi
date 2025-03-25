import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSmallLoading } from '../context/SmallLoadingContext'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: JSX.Element
  allowedUserTypes: string[]
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { userType, loading } = useAuth()
  const { setSmallLoading } = useSmallLoading()
  const location = useLocation()

  useEffect(() => {
    setSmallLoading(loading)
  }, [loading, setSmallLoading])

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!userType || !allowedUserTypes.includes(userType)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
} 