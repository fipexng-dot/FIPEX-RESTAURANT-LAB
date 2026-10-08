import { useState } from 'react'

export default function BrandMark() {
  const [ok, setOk] = useState(true)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
      {ok ? (
        <img src="/fipex-logo.png" alt="" onError={() => setOk(false)}
          style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#ea580c,#f59e0b)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>F</div>
      )}
      <div style={{ fontWeight: 800, lineHeight: 1.15, fontSize: 14, letterSpacing: 0.3 }}>
        FIPEX<br />RESTAURANT LAB
      </div>
    </div>
  )
}
