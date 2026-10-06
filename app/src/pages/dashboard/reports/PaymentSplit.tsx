import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

const LABELS: Record<string, string> = { cash: 'Cash', pos: 'POS', transfer: 'Transfer', online: 'Online' }

function startOf(range: string): string | null {
  const d = new Date()
  const m = /^(\d+)d$/.exec(range)
  if (m) {
    d.setDate(d.getDate() - Number(m[1]))
    return d.toISOString()
  }
  if (range === 'today') {
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  return null
}

export function PaymentSplit({ rid, range }: { rid: string; range: string }) {
  const [rows, setRows] = useState<{ key: string; total: number; count: number }[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const start = startOf(range)
    let q = supabase.from('orders').select('payment_method,total')
      .eq('restaurant_id', rid).eq('payment_status', 'success').limit(1000)
    if (start) q = q.gte('created_at', start)
    q.then(({ data, error: err }) => {
      if (!alive) return
      if (err) return setError(err.message)
      const map: Record<string, { total: number; count: number }> = {}
      for (const o of data ?? []) {
        const k = o.payment_method || 'online'
        map[k] = map[k] ?? { total: 0, count: 0 }
        map[k].total += Number(o.total) || 0
        map[k].count += 1
      }
      setRows(Object.entries(map).map(([key, v]) => ({ key, ...v })).sort((a, b) => b.total - a.total))
      setError('')
    })
    return () => { alive = false }
  }, [rid, range])

  const sum = rows.reduce((s, r) => s + r.total, 0) || 1
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 14, margin: '12px 0', border: '1px solid #eee' }}>
      <h3 style={{ margin: '0 0 10px' }}>Payment methods</h3>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!rows.length && !error && <p style={{ color: '#888' }}>No paid orders in this period</p>}
      {rows.map((r) => (
        <div key={r.key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>{LABELS[r.key] ?? r.key} ({r.count})</span>
            <strong>₦{r.total.toLocaleString()}</strong>
          </div>
          <div style={{ height: 8, background: '#f1f1f1', borderRadius: 4 }}>
            <div style={{ width: `${(r.total / sum) * 100}%`, height: 8, background: '#c2410c', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
