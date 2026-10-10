import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

type T = {
  restaurant: { name: string; primary_color: string | null; phone: string | null }
  rider: { name: string; phone: string | null } | null
  order_number: string | null
  order_type: string
  status: string
  delivery_stage: string | null
  items: { name: string; quantity: number }[]
}
const STEPS: Record<string, string[]> = {
  delivery: ['Order received', 'Preparing your food', 'Ready for dispatch', 'Out for delivery', 'Delivered'],
  takeaway: ['Order received', 'Preparing your food', 'Ready for pickup'],
  dine_in: ['Order received', 'Preparing your food', 'Ready to serve'],
}
function stepOf(t: T, n: number) {
  if (t.delivery_stage === 'delivered' || t.status === 'completed') return n - 1
  if (t.delivery_stage === 'out_for_delivery') return 3
  if (t.status === 'ready') return 2
  if (t.status === 'preparing') return 1
  return 0
}

export default function Track() {
  const { key } = useParams()
  const [t, setT] = useState<T | null>(null)
  const [missing, setMissing] = useState(false)
  const [note, setNote] = useState('')
  const last = useRef(-1)

  useEffect(() => {
    let alive = true
    const load = async () => {
      const { data } = await supabase.rpc('track_order', { p_key: key })
      if (!alive) return
      if (!data) { setMissing(true); return }
      const d = data as T
      const steps = STEPS[d.order_type] ?? STEPS.takeaway
      const s = stepOf(d, steps.length)
      if (last.current >= 0 && s !== last.current) {
        setNote(steps[s])
        navigator.vibrate?.([200, 100, 200])
        document.title = 'Update: ' + steps[s]
      }
      last.current = s
      setT(d)
    }
    void load()
    const id = setInterval(load, 8000)
    return () => { alive = false; clearInterval(id) }
  }, [key])

  if (missing) return <div style={{ padding: 24 }}>We could not find this order.</div>
  if (!t) return <div style={{ padding: 24 }}>Loading...</div>
  const steps = STEPS[t.order_type] ?? STEPS.takeaway
  const cur = stepOf(t, steps.length)
  const accent = t.restaurant.primary_color || '#ea580c'
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: accent, color: '#fff', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.9 }}>{t.restaurant.name}</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Order {t.order_number ?? ''}</div>
        <div style={{ marginTop: 4 }}>{steps[cur]}</div>
      </div>
      {note && <div style={{ margin: '12px 0', padding: 12, borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>Update: {note}</div>}
      <div style={{ margin: '16px 0' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', opacity: i <= cur ? 1 : 0.4 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= cur ? accent : '#d6d3d1' }} />
            <div style={{ fontWeight: i === cur ? 800 : 500 }}>{s}</div>
          </div>
        ))}
      </div>
      {t.rider && (
        <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #e7e0d8', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#78716c' }}>Your rider</div>
          <div style={{ fontWeight: 700 }}>{t.rider.name}</div>
          {t.rider.phone && <a href={`tel:${t.rider.phone}`} style={{ color: accent, fontWeight: 700 }}>Call rider</a>}
        </div>
      )}
      <div style={{ fontSize: 14, color: '#44403c' }}>{t.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</div>
      <div style={{ marginTop: 16, color: '#78716c', fontSize: 12 }}>This page updates by itself. Keep it open.</div>
    </div>
  )
}
