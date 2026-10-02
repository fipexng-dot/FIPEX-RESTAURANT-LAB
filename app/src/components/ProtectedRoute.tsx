import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, userId, profile } = useAuth()
  const disabled = profile?.status === 'inactive'

  useEffect(() => {
    if (disabled) supabase.auth.signOut()
  }, [disabled])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!userId || !profile || disabled) return <Navigate to="/login" replace />
  return <>{children}</>
}
