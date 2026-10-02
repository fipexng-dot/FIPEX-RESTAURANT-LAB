import { useCallback, useEffect, useState } from 'react'
import { ROLE_LABELS } from '../../lib/permissions'
import { timeAgo } from './feed/notifyFeed'
import { AddStaffForm } from './staffparts/AddStaffForm'
import { ROLE_CHOICES, randomPassword, staffCall } from './staffparts/staffApi'
import type { StaffMember } from './staffparts/staffApi'

const smallBtn = {
  padding: '8px 12px',
  fontSize: 14,
  borderRadius: 8,
  border: '1.5px solid #d9d9d9',
  background: '#fff',
} as const

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await staffCall<{ staff: StaffMember[] }>({ action: 'list' })
      setStaff(r.staff)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load staff')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function act(body: Record<string, unknown>) {
    try {
      await staffCall(body)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  function toggle(s: StaffMember) {
    const off = s.status !== 'inactive'
    const who = s.full_name || s.email
    const q = off
      ? `Deactivate ${who}? They will be logged out and cannot sign in.`
      : `Reactivate ${who}?`
    if (!confirm(q)) return
    act({ action: 'set_status', id: s.id, status: off ? 'inactive' : 'active' })
  }

  async function reset(s: StaffMember) {
    const pw = prompt('New temporary password (at least 8 characters):', randomPassword())
    if (!pw) return
    try {
      await staffCall({ action: 'reset_password', id: s.id, password: pw })
      alert(`Password changed. Give them this new password:\n${pw}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not change password')
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Staff</h1>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{ padding: '10px 16px', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, background: '#2b1b12', color: '#fff' }}
        >
          {adding ? 'Close' : '+ Add staff'}
        </button>
      </div>
      <p style={{ color: '#6b6b6b', margin: '6px 0 14px' }}>
        Manager: everything except Settings and Staff. Cashier: Orders, Payments, Customers. Kitchen: Kitchen and Orders.
      </p>

      {adding && <AddStaffForm onAdded={load} />}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {staff.map((s) => {
          const owner = s.role === 'restaurant_owner'
          const off = s.status === 'inactive'
          return (
            <div
              key={s.id}
              style={{ background: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', opacity: off ? 0.6 : 1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{s.full_name || 'Unnamed'}</div>
                  <div style={{ fontSize: 14, color: '#6b6b6b' }}>{s.email}</div>
                  <div style={{ fontSize: 13, color: '#6b6b6b' }}>
                    {s.last_sign_in_at ? `Last login ${timeAgo(s.last_sign_in_at)}` : 'Has not logged in yet'}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: off ? '#b91c1c' : '#15803d' }}>
                  {off ? 'DEACTIVATED' : 'ACTIVE'}
                </div>
              </div>
              {owner ? (
                <div style={{ marginTop: 8, fontWeight: 700 }}>👑 {ROLE_LABELS[s.role] || 'Owner'}</div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <select
                    value={s.role}
                    onChange={(e) => act({ action: 'set_role', id: s.id, role: e.target.value })}
                    style={{ ...smallBtn, fontWeight: 700 }}
                  >
                    {ROLE_CHOICES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <button style={smallBtn} onClick={() => reset(s)}>
                    Reset password
                  </button>
                  <button style={{ ...smallBtn, color: off ? '#15803d' : '#b91c1c' }} onClick={() => toggle(s)}>
                    {off ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
