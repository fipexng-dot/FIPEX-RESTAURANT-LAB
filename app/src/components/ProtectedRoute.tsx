import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, userId, profile } = useAuth()

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>
      if (!userId || !profile) return <Navigate to="/login" replace />

        return <>{children}</>
        }
        