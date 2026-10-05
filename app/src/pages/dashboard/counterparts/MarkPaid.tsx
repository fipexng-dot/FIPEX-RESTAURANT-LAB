import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { METHODS } from './counterApi'

const URL = 'https://dpfgurqoogjintzqqzcx.supabase.co/functions/v1/mark-paid'

export function MarkPaid({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Please sign in again')
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId, method, reference }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      setOpen(false)
      onDone()
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ margin: '8px 0', padding: '8px 14px', border: 'none', borderRadius: 8, background: '#2f855a', color: '#fff', fontWeight: 700 }}>
        Mark as paid
      </button>
    )
  }
  return (
    <div style={{ margin: '8px 0', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {METHODS.filter((m) => m.key !== 'pay_later').map((m) => (
          <button key={m.key} onClick={() => setMethod(m.key)}
            style={{ padding: '6px 10px', borderRadius: 8, border: method === m.key ? '2px solid #2f855a' : '1px solid #ddd', background: '#fff' }}>
            {m.label}
          </button>
        ))}
      </div>
      <input placeholder="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)}
        style={{ width: '100%', padding: 8, margin: '8px 0', border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
      {error && <p style={{ color: 'crimson', margin: '4px 0' }}>{error}</p>}
      <button disabled={busy} onClick={save} style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: '#2f855a', color: '#fff', fontWeight: 700 }}>
        {busy ? 'Saving...' : 'Confirm payment'}
      </button>
      <button onClick={() => setOpen(false)} style={{ marginLeft: 8, padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
        Cancel
      </button>
    </div>
  )
}
