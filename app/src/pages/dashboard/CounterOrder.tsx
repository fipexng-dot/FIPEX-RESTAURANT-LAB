import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../hooks/useCart'
import { MenuItemCard } from '../customer/MenuItemCard'
import type { Category, MenuItem } from '../customer/menuHelpers'
import { money } from '../customer/checkoutHelpers'
import { CheckoutPanel } from './counterparts/CheckoutPanel'
import { counterCall } from './counterparts/counterApi'
import type { CounterResult } from './counterparts/counterApi'

type Fees = { delivery_fee: number | null; takeaway_fee: number | null; vat_percent?: number | null; service_charge_percent?: number | null }

function Inner({ onNew }: { onNew: () => void }) {
  const { profile } = useAuth()
  const rid = profile?.restaurant_id
  const cart = useCart()
  const [fees, setFees] = useState<Fees>({ delivery_fee: 0, takeaway_fee: 0 })
  const [cats, setCats] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [panel, setPanel] = useState(false)
  const [result, setResult] = useState<CounterResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!rid) return
    Promise.all([
      supabase.from('restaurants').select('delivery_fee,takeaway_fee,vat_percent,service_charge_percent').eq('id', rid).single(),
      supabase.from('menu_categories').select('*').eq('restaurant_id', rid).order('sort_order'),
      supabase.from('menu_items').select('*').eq('restaurant_id', rid).neq('availability', 'hidden'),
    ])
      .then(([r, c, m]) => {
        if (r.data) setFees(r.data)
        setCats((c.data ?? []) as Category[])
        setItems((m.data ?? []) as MenuItem[])
      })
      .catch((e: Error) => setError(e.message))
  }, [rid])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (i) => (activeCat === 'all' || i.category_id === activeCat) && (!q || i.name.toLowerCase().includes(q))
    )
  }, [items, search, activeCat])

  const qtyOf = (id: string) => cart.items.find((i) => i.id === id)?.quantity ?? 0
  const [busy, setBusy] = useState(false)

  const submit = async (d: Record<string, unknown>) => {
    setBusy(true)
    setError('')
    try {
      const items = cart.items.map((i) => ({ id: i.id, quantity: i.quantity }))
      setResult(await counterCall({ ...d, items }))
      setPanel(false)
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(false)
  }

  if (result) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Order {result.order_number ?? ''} saved</h2>
        <p>{money(result.total)} - {result.paid ? 'Paid' : 'Pay later'}</p>
        {result.receipt_token && (
          <a href={`/receipt/${result.receipt_token}`} target="_blank" rel="noreferrer">View receipt</a>
        )}
        <div style={{ marginTop: 16 }}>
          <button onClick={onNew} style={btn}>New counter order</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 12, paddingBottom: 90 }}>
      <h2 style={{ margin: '0 0 10px' }}>Counter Order</h2>
      <input placeholder="Search dish" value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '10px 0' }}>
        {[{ id: 'all', name: 'All' }, ...cats].map((c) => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            style={{ ...chip, background: activeCat === c.id ? '#c2410c' : '#fff', color: activeCat === c.id ? '#fff' : '#333' }}>
            {c.name}
          </button>
        ))}
      </div>
      {error && !panel && <p style={{ color: 'crimson' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {shown.map((m) => (
          <MenuItemCard key={m.id} item={m} qty={qtyOf(m.id)} accent="#c2410c" disabled={false}
            onAdd={() => cart.addItem({ id: m.id, name: m.name, price: m.price })}
            onChange={(q) => cart.updateQuantity(m.id, q)} />
        ))}
      </div>
      {cart.totalCount > 0 && (
        <button onClick={() => setPanel(true)} style={{ ...btn, position: 'fixed', left: 12, right: 12, bottom: 12 }}>
          Charge {cart.totalCount} item(s) - {money(cart.subtotal)}
        </button>
      )}
      {panel && (
        <CheckoutPanel subtotal={cart.subtotal} fees={fees} busy={busy} error={error}
          onClose={() => setPanel(false)} onSubmit={submit} />
      )}
    </div>
  )
}

const btn = { padding: '12px 18px', border: 'none', borderRadius: 10, background: '#c2410c', color: '#fff', fontWeight: 700, cursor: 'pointer' }
const chip = { padding: '6px 12px', borderRadius: 16, border: '1px solid #ddd', whiteSpace: 'nowrap' as const, cursor: 'pointer' }

export default function CounterOrder() {
  const [k, setK] = useState(0)
  return <Inner key={k} onNew={() => setK(k + 1)} />
}
