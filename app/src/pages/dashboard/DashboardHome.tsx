import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { canAccess } from '../../lib/permissions'

type R = Record<string, unknown>
type Food = { name: string; sold: number; revenue: number; photo: string | null }
type Recent = { id: string; order_number: string | null; total: number; payment_status: string; created_at: string }

const naira = (n: number) => '₦' + Math.round(n).toLocaleString()
const PHOTO_KEYS = ['image_url', 'photo_url', 'image', 'photo', 'picture_url']
const photoOf = (m: R): string | null => {
  for (const k of PHOTO_KEYS) if (typeof m[k] === 'string' && m[k]) return m[k] as string
  return null
}
const greet = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function DashboardHome() {
  const { profile } = useAuth()
  const pf = profile as unknown as R | null
  const rid = pf?.restaurant_id ? String(pf.restaurant_id) : ''
  const [rest, setRest] = useState<R | null>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [recent, setRecent] = useState<Recent[]>([])
  const [today, setToday] = useState({ orders: 0, revenue: 0 })
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!rid) return
    let alive = true
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    ;(async () => {
      const [r, o, m] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', rid).maybeSingle(),
        supabase.from('orders').select('id,order_number,total,payment_status,created_at')
          .eq('restaurant_id', rid).gte('created_at', since).order('created_at', { ascending: false }).limit(300),
        supabase.from('menu_items').select('*').eq('restaurant_id', rid),
      ])
      if (!alive) return
      const rows = (o.data ?? []) as unknown as Recent[]
      const paid = rows.filter((x) => x.payment_status === 'success')
      const todays = paid.filter((x) => new Date(x.created_at).getTime() >= start.getTime())
      setToday({ orders: todays.length, revenue: todays.reduce((s, x) => s + Number(x.total || 0), 0) })
      setRecent(rows.slice(0, 5))
      const photos: Record<string, string | null> = {}
      for (const it of (m.data ?? []) as R[]) photos[String(it.name).toLowerCase()] = photoOf(it)
      const ids = paid.slice(0, 100).map((x) => x.id)
      const agg: Record<string, Food> = {}
      if (ids.length) {
        const { data: li } = await supabase.from('order_items').select('item_name,item_price,quantity').in('order_id', ids)
        for (const i of (li ?? []) as R[]) {
          const n = String(i.item_name)
          const q = Number(i.quantity) || 0
          agg[n] = agg[n] ?? { name: n, sold: 0, revenue: 0, photo: photos[n.toLowerCase()] ?? null }
          agg[n].sold += q
          agg[n].revenue += q * (Number(i.item_price) || 0)
        }
      }
      if (!alive) return
      setFoods(Object.values(agg).sort((a, b) => b.sold - a.sold).slice(0, 6))
      setRest((r.data as R | null) ?? null)
      setNote(String((r.data as R | null)?.announcement ?? ''))
    })()
    return () => { alive = false }
  }, [rid])

  const save = async () => {
    if (!rid) return
    setSaving(true)
    await supabase.from('restaurants').update({ announcement: note.trim() || null }).eq('id', rid)
    setSaving(false)
    setEditing(false)
  }

  const [upBusy, setUpBusy] = useState(false)
  const uploadLogo = async (file: File | undefined) => {
    if (!file || !rid) return
    if (file.size > 3000000) { alert('Please choose an image under 3 MB'); return }
    setUpBusy(true)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${rid}/logo-${Date.now()}.${ext}`
    const up = await supabase.storage.from('restaurant-logos').upload(path, file, { upsert: true, contentType: file.type })
    if (up.error) { alert(up.error.message); setUpBusy(false); return }
    const url = supabase.storage.from('restaurant-logos').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('restaurants').update({ logo_url: url }).eq('id', rid)
    if (error) alert(error.message)
    else setRest({ ...(rest ?? {}), logo_url: url })
    setUpBusy(false)
  }
  const accent = String(rest?.primary_color || '#ea580c')
  const logo = typeof rest?.logo_url === 'string' ? rest.logo_url : ''
  const role = String(pf?.role || '')
  const canEdit = role === 'restaurant_owner' || role === 'manager'
  const loyalty = useMemo(() => {
    if (!rest?.loyalty_enabled) return ''
    const prize = rest.loyalty_reward_type === 'free_delivery' ? 'free delivery' : `${naira(Number(rest.loyalty_reward_value || 0))} off`
    return `Order ${Number(rest.loyalty_min_orders || 0)} times in ${Number(rest.loyalty_window_days || 0)} days and enjoy ${prize}`
  }, [rest])
  const line = note || loyalty || 'Welcome! Tap the pencil to post an announcement or promo.'
  const card = { background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 2px 10px rgba(0,0,0,.06)' } as const

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 14 }}>
      <style>{'@keyframes fxs{from{transform:translateX(100%)}to{transform:translateX(-100%)}}'}</style>
      <div style={{ background: `linear-gradient(135deg, ${accent}, #111)`, borderRadius: 20, padding: 20, color: '#fff', display: 'flex', gap: 14, alignItems: 'center' }}>
<div style={{ position: 'relative' }}>
{logo ? <img src={logo} alt="" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff' }} /> : <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center', fontSize: 30 }}>🍽️</div>}
{canEdit && (
            <label style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#fff', color: '#111', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
              {upBusy ? '…' : '📷'}
              <input type="file" accept="image/*" hidden onChange={(e) => uploadLogo(e.target.files?.[0])} />
            </label>
          )}
</div>
        <div>
          <div style={{ opacity: 0.85, fontSize: 14 }}>{greet()}{pf?.full_name ? `, ${String(pf.full_name)}` : ''} 👋</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{String(rest?.name || 'Your restaurant')}</div>
        </div>
      </div>
      <div style={{ ...card, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <span>📣</span>
        {editing ? (
          <>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 20% off all swallow this weekend!" style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none' }} />
            <button onClick={save} disabled={saving} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontWeight: 700 }}>{saving ? '...' : 'Save'}</button>
          </>
        ) : (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <span style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'fxs 16s linear infinite' }}>{line}</span>
            </div>
            {canEdit && <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18 }}>✏️</button>}
          </>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[["Today's orders", String(today.orders)], ["Today's sales", naira(today.revenue)], ['Average order', naira(today.orders ? today.revenue / today.orders : 0)]].map(([k, v]) => (
          <div key={k} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#777' }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>🔥 Top sellers lately</div>
        {foods.length === 0 && <div style={{ color: '#888' }}>Your best dishes will show here after the first paid orders.</div>}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {foods.map((f, i) => (
            <div key={f.name} style={{ minWidth: 150, borderRadius: 14, overflow: 'hidden', border: '1px solid #eee' }}>
              <div style={{ height: 105, background: '#f3f0ec', display: 'grid', placeItems: 'center', fontSize: 34, position: 'relative' }}>
                {f.photo ? <img src={f.photo} alt={f.name} onError={(e) => { e.currentTarget.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : '🍽️'}
                <span style={{ position: 'absolute', top: 6, left: 6, background: accent, color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>#{i + 1}</span>
              </div>
              <div style={{ padding: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#777' }}>{f.sold} sold · {naira(f.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {loyalty && (
        <div style={{ ...card, background: `${accent}18`, border: `1px dashed ${accent}` }}>
          <div style={{ fontWeight: 800 }}>🎁 Loyalty reward</div>
          <div style={{ color: '#444', marginTop: 4 }}>{loyalty}</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[['counter', '🛎️', 'Counter Order'], ['orders', '🧾', 'Orders'], ['kitchen', '👨‍🍳', 'Kitchen'], ['menu', '🍽️', 'Menu']]
          .filter(([s]) => canAccess(role, s))
          .map(([s, icon, label]) => (
            <Link key={s} to={`/dashboard/${s}`} style={{ ...card, textDecoration: 'none', color: '#111', fontWeight: 700 }}>{icon} {label}</Link>
          ))}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Latest orders</div>
        {recent.length === 0 && <div style={{ color: '#888' }}>No orders yet.</div>}
        {recent.map((r) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>
            <span>{r.order_number ?? r.id.slice(0, 6)} · {r.payment_status === 'success' ? 'Paid' : 'Unpaid'}</span>
            <strong>{naira(Number(r.total) || 0)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
