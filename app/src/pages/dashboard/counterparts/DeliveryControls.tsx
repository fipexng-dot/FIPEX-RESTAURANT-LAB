import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

type Rider = { id: string; name: string; phone: string | null }
type Ex = {
  receipt_token: string | null
  rider_token: string | null
  delivery_name: string | null
  delivery_phone: string | null
  delivery_stage: string | null
  rider_id: string | null
  restaurant_id: string
  order_number: string | null
}
const b = { padding: '8px 12px', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', margin: '6px 6px 0 0', textDecoration: 'none', display: 'inline-block', fontSize: 14 } as const
const wa = (phone: string | null, text: string) => `https://wa.me/${(phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

export function DeliveryControls({ orderId }: { orderId: string }) {
  const [ex, setEx] = useState<Ex | null>(null)
  const [riders, setRiders] = useState<Rider[]>([])
  const load = useCallback(async () => {
    const { data } = await supabase.from('orders').select('receipt_token,rider_token,delivery_name,delivery_phone,delivery_stage,rider_id,restaurant_id,order_number').eq('id', orderId).maybeSingle()
    if (!data) return
    setEx(data as Ex)
    const r = await supabase.from('riders').select('id,name,phone').eq('restaurant_id', data.restaurant_id).eq('active', true).order('name')
    setRiders((r.data ?? []) as Rider[])
  }, [orderId])
  useEffect(() => { void load() }, [load])
  if (!ex) return null
  const origin = window.location.origin
  const rider = riders.find((r) => r.id === ex.rider_id)
  const trackUrl = `${origin}/track/${ex.receipt_token}`
  const riderUrl = `${origin}/deliver/${ex.rider_token}`
  const stage = ex.delivery_stage
  const patch = async (v: Record<string, unknown>) => {
    await supabase.from('orders').update(v).eq('id', orderId)
    await load()
  }
  const addRider = async () => {
    const name = prompt('Rider name')?.trim()
    if (!name) return
    const phone = prompt('Rider phone (08...)')?.trim() || null
    await supabase.from('riders').insert({ restaurant_id: ex.restaurant_id, name, phone })
    await load()
  }
  const label = stage === 'delivered' ? 'Delivered' : stage === 'out_for_delivery' ? 'Out for delivery' : 'Not dispatched yet'
  return (
    <div style={{ margin: '8px 0', padding: 10, border: '1px dashed #d6ccc2', borderRadius: 10 }}>
      <div style={{ fontWeight: 700 }}>🛵 Delivery: {label}</div>
      <select value={ex.rider_id ?? ''} onChange={(e) => patch({ rider_id: e.target.value || null })} style={{ margin: '8px 0', padding: 8, borderRadius: 8, maxWidth: '100%' }}>
        <option value="">No rider (staff delivers)</option>
        {riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <button onClick={addRider} style={{ ...b, background: '#fff', border: '1px solid #ddd', color: '#1c1917' }}>+ Add rider</button>
      <div>
        {!stage && <button onClick={() => patch({ delivery_stage: 'out_for_delivery', out_for_delivery_at: new Date().toISOString() })} style={{ ...b, background: '#ea580c', color: '#fff' }}>Out for delivery</button>}
        {stage === 'out_for_delivery' && <button onClick={() => patch({ delivery_stage: 'delivered', delivered_at: new Date().toISOString(), status: 'completed' })} style={{ ...b, background: '#16a34a', color: '#fff' }}>Delivered</button>}
        <a href={wa(ex.delivery_phone, `Hello${ex.delivery_name ? ' ' + ex.delivery_name : ''}! Track your order ${ex.order_number ?? ''} live here: ${trackUrl}`)} target="_blank" rel="noreferrer" style={{ ...b, background: '#16a34a', color: '#fff' }}>WhatsApp customer</a>
        {rider && <a href={wa(rider.phone, `New delivery ${ex.order_number ?? ''}. Open: ${riderUrl}`)} target="_blank" rel="noreferrer" style={{ ...b, background: '#1c1917', color: '#fff' }}>Send to rider</a>}
        <button onClick={() => navigator.clipboard.writeText(trackUrl)} style={{ ...b, background: '#fff', border: '1px solid #ddd', color: '#1c1917' }}>Copy tracking link</button>
      </div>
    </div>
  )
}
