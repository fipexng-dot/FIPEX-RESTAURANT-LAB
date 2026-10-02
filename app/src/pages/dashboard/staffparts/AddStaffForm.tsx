import { useState } from 'react'
import { ROLE_CHOICES, randomPassword, staffCall } from './staffApi'

const input = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 16,
  border: '1.5px solid #d9d9d9',
  borderRadius: 10,
  background: '#fff',
} as const
const lab = { display: 'block', fontSize: 15, fontWeight: 600, margin: '10px 0 4px' } as const

export function AddStaffForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('cashier')
  const [password, setPassword] = useState(() => randomPassword())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  async function submit() {
    setBusy(true)
    setError('')
    try {
      await staffCall({ action: 'create', full_name: name, email, phone, role, password })
      setCreated({ email: email.trim().toLowerCase(), password })
      setName('')
      setEmail('')
      setPhone('')
      setPassword(randomPassword())
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add staff')
    }
    setBusy(false)
  }

  function copy() {
    if (!created) return
    navigator.clipboard?.writeText(
      `Login: ${window.location.origin}/login\nEmail: ${created.email}\nPassword: ${created.password}`
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ margin: 0 }}>Add staff</h3>

      {created && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #16a34a', borderRadius: 12, padding: 12, marginTop: 10 }}>
          <strong>✅ Account created. Share these details:</strong>
          <div style={{ fontSize: 15, marginTop: 6 }}>Email: {created.email}</div>
          <div style={{ fontSize: 15 }}>Password: {created.password}</div>
          <div style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4 }}>
            This password is only shown now. Copy it before you leave.
          </div>
          <button onClick={copy} style={{ marginTop: 8, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #16a34a', background: '#fff' }}>
            Copy login details
          </button>
        </div>
      )}

      <label style={lab}>Full name</label>
      <input style={input} value={name} onChange={(e) => setName(e.target.value)} />
      <label style={lab}>Email (used to log in)</label>
      <input style={input} value={email} type="email" onChange={(e) => setEmail(e.target.value)} />
      <label style={lab}>Phone (optional)</label>
      <input style={input} value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} />
      <label style={lab}>Role</label>
      <select style={input} value={role} onChange={(e) => setRole(e.target.value)}>
        {ROLE_CHOICES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <label style={lab}>Temporary password</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={() => setPassword(randomPassword())} style={{ padding: '0 14px', borderRadius: 10, border: '1.5px solid #d9d9d9', background: '#fff' }}>
          New
        </button>
      </div>

      {error && <p style={{ color: '#b91c1c', margin: '10px 0 0' }}>{error}</p>}
      <button
        onClick={submit}
        disabled={busy}
        style={{ marginTop: 14, padding: '12px 20px', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 10, background: busy ? '#c9c3bd' : '#2b1b12', color: '#fff' }}
      >
        {busy ? 'Creating...' : 'Create account'}
      </button>
    </div>
  )
}
