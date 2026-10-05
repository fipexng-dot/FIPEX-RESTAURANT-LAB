import { useState } from 'react'
import type { CSSProperties } from 'react'
import { money } from '../../customer/checkoutHelpers'
import { METHODS } from './counterApi'

type Props = {
  subtotal: number
  fees: { delivery_fee: number | null; takeaway_fee: number | null }
  busy: boolean
  error: string
  onClose: () => void
  onSubmit: (d: Record<string, unknown>) => void
}
const TYPES = [
  { key: 'dine_in', label: 'Dine in' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'delivery', label: 'Delivery' },
]
const field: CSSProperties = { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }
const lab: CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', margin: '12px 0 4px' }
const choice = (on: boolean): CSSProperties => ({ flex: 1, minWidth: '40%', padding: 10, borderRadius: 8, cursor: 'pointer', border: on ? '2px solid #c2410c' : '1px solid #ddd', background: on ? '#fff7ed' : '#fff' })

export function CheckoutPanel(p: Props) {
  const [orderType, setOrderType] = useState('dine_in')
  const [method, setMethod] = useState('cash')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [table, setTable] = useState('')
  const [reference, setReference] = useState('')
  const fee = orderType === 'delivery' ? p.fees.delivery_fee ?? 0 : orderType === 'takeaway' ? p.fees.takeaway_fee ?? 0 : 0
  const needRef = method === 'pos' || method === 'transfer'
  const go = () => p.onSubmit({ order_type: orderType, method, name, phone, address, table, reference })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', borderRadius: '18px 18px 0 0', padding: 16, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Take payment</h2>
          <button onClick={p.onClose} style={{ border: 'none', background: 'transparent', fontSize: 22 }}>X</button>
        </div>
        <label style={lab}>Order type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {TYPES.map((t) => (
            <button key={t.key} style={choice(orderType === t.key)} onClick={() => setOrderType(t.key)}>{t.label}</button>
          ))}
        </div>
        {orderType === 'dine_in' && (<><label style={lab}>Table (optional)</label><input style={field} value={table} onChange={(e) => setTable(e.target.value)} /></>)}
        {orderType === 'delivery' && (<><label style={lab}>Delivery address</label><input style={field} value={address} onChange={(e) => setAddress(e.target.value)} /></>)}
        <label style={lab}>Customer name (optional)</label>
        <input style={field} value={name} onChange={(e) => setName(e.target.value)} />
        <label style={lab}>Phone (optional)</label>
        <input style={field} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label style={lab}>Payment method</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {METHODS.map((m) => (
            <button key={m.key} style={choice(method === m.key)} onClick={() => setMethod(m.key)}>{m.label}</button>
          ))}
        </div>
        {needRef && (<><label style={lab}>Reference (optional)</label><input style={field} value={reference} onChange={(e) => setReference(e.target.value)} /></>)}
        <p style={{ fontWeight: 700, marginTop: 14 }}>Estimated total: {money(p.subtotal + fee)}</p>
        {p.error && <p style={{ color: 'crimson' }}>{p.error}</p>}
        <button disabled={p.busy} onClick={go} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 10, background: '#c2410c', color: '#fff', fontWeight: 700 }}>
          {p.busy ? 'Saving...' : 'Confirm order'}
        </button>
      </div>
    </div>
  )
}
