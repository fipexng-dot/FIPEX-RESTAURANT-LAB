import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { firstAllowed } from '../lib/permissions'

export default function NoAccess({ role }: { role?: string }) {
  const go = firstAllowed(role)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const atHome = pathname.replace(/\/$/, '') === '/dashboard'

  useEffect(() => {
    if (atHome && go) navigate(go, { replace: true })
  }, [atHome, go, navigate])

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h1 style={{ margin: 0 }}>No access</h1>
      <p style={{ fontSize: 17 }}>Your role does not have permission to open this page.</p>
      {go && (
        <Link to={go} style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 10, background: '#2b1b12', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          Go to my page →
        </Link>
      )}
    </div>
  )
}
