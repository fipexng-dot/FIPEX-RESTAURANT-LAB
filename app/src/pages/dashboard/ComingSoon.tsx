import { useLocation } from 'react-router-dom'

export default function ComingSoon() {
  const { pathname } = useLocation()
  const last = pathname.split('/').filter(Boolean).pop() || 'dashboard'
  const title = last.charAt(0).toUpperCase() + last.slice(1)

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p>This section is coming soon.</p>
    </div>
  )
}
