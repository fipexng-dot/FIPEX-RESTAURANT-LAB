import { useLocation } from 'react-router-dom'

export default function ComingSoon() {
  const { pathname } = useLocation()
    const name = pathname.split('/').filter(Boolean).pop() ?? 'page'
      return (
          <div style={{ padding: 24 }}>
                <h2 style={{ textTransform: 'capitalize' }}>{name}</h2>
                      <p>This section is coming soon.</p>
                          </div>
                            )
                            }
                            