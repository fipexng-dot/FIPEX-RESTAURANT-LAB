import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

type D = {
  order_number: string | null
  customer_name: string | null
  customer_phone: string | null
  address: string | null
  stage: string | null
  items: { name: string; quantity: number }[]
}
const btn = { width: '100%', padding: 16, border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 14 } as const

export default function Deliver() {
  const { token } = useParams()
  const [d, setD] = useState<D | null>(null)
  const [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data } = await supabase.rpc('rider_get', { p_token: token })
    if (!data) setMsg('Delivery not found')
    else setD(data as D)
  }, [token])
  useEffect(() => { void load() }, [load])
  const go = async (stage: string) => {
    const { data } = await supabase.rpc('rider_update', { p_token: token, p_stage: stage })
    if (!data) setMsg('Could not update')
    await load()
  }
  if (!d) return <div style={{ padding: 24 }}>{msg || 'Loading...'}</div>
  const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(d.address ?? '')
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ margin: '0 0 8px' }}>Delivery {d.order_number ?? ''}</h2>
      <div style={{ padding: 14, background: '#fff', borderRadius: 14, border: '1px solid #e7e0d8', lineHeight: 1.6 }}>
        <div><b>{d.customer_name ?? 'Customer'}</b></div>
        {d.customer_phone && <a href={`tel:${d.customer_phone}`}>Call {d.customer_phone}</a>}
        <div style={{ marginTop: 6 }}>{d.address}</div>
        {d.address && <a href={map} target="_blank" rel="noreferrer">Open in Google Maps</a>}
        <div style={{ marginTop: 8, color: '#57534e' }}>{d.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</div>
      </div>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      {!d.stage && <button onClick={() => go('out_for_delivery')} style={{ ...btn, background: '#ea580c' }}>Picked up, start delivery</button>}
      {d.stage === 'out_for_delivery' && <button onClick={() => go('delivered')} style={{ ...btn, background: '#16a34a' }}>Delivered</button>}
      {d.stage === 'delivered' && <p style={{ fontWeight: 700, color: '#16a34a' }}>Delivered. Thank you!</p>}
    </div>
  )
}
