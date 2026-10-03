import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { CustomerCard } from './customerparts/CustomerCard'
import { loadCustomers } from './customerparts/customerData'
import type { CustomerData } from './customerparts/customerData'

type Filter = 'all' | 'reward' | 'regulars' | 'lapsed' | 'new'
type Sort = 'spent' | 'orders' | 'recent'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reward', label: '🎁 Reward ready' },
  { key: 'regulars', label: 'Regulars' },
  { key: 'lapsed', label: 'Lapsed' },
  { key: 'new', label: 'New' },
]
const DAY = 86400000
const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`

function exportCsv(rows: CustomerData['customers']) {
  const lines = [
    ['Name', 'Phone', 'Email', 'Paid orders', 'Total spent', 'Last order'],
    ...rows.map((c) => [c.name, c.phone, c.email, c.orders, c.spent, c.lastOrder || '']),
  ]
  const csv = lines
    .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'customers.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e7ddd1', borderRadius: 12, padding: 14, background: '#fff' }}>
      <div style={{ color: '#6b6b6b', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{value}</div>
    </div>
  )
}

export default function Customers() {
  const { profile } = useAuth()
  const [data, setData] = useState<CustomerData | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('spent')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.restaurant_id) return

    loadCustomers(profile.restaurant_id)
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [profile?.restaurant_id])

  const shown = useMemo(() => {
    if (!data) return []

    const q = search.trim().toLowerCase()
    const qd = q.replace(/\D/g, '')
    const now = Date.now()
    const last = (c: { lastOrder: string | null }) => new Date(c.lastOrder || 0).getTime()

    return data.customers
      .filter(
        (c) => !q || c.name.toLowerCase().includes(q) || (qd && (c.phone || '').replace(/\D/g, '').includes(qd))
      )
      .filter((c) => {
        if (filter === 'reward') return c.rewardReady
        if (filter === 'regulars') return c.orders >= 3
        if (filter === 'lapsed') return !!c.lastOrder && now - last(c) > 30 * DAY
        if (filter === 'new') return now - new Date(c.joined).getTime() < 30 * DAY
        return true
      })
      .sort((a, b) => {
        if (sort === 'spent') return b.spent - a.spent
        if (sort === 'orders') return b.orders - a.orders
        return last(b) - last(a)
      })
  }, [data, search, filter, sort])

  if (!profile) {
    return <div style={{ padding: 16 }}>Loading your restaurant...</div>
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Customers</h2>
          <div style={{ color: '#6b6b6b', marginTop: 4 }}>Customer activity and loyalty overview</div>
        </div>

        <button
          type="button"
          onClick={() => data && exportCsv(data.customers)}
          disabled={!data}
          style={{
            border: '1px solid #d9d3cd',
            background: '#fff',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: data ? 'pointer' : 'not-allowed',
            opacity: data ? 1 : 0.6,
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
          <StatCard label="Buyers" value={String(data.buyers)} />
          <StatCard label="Repeaters" value={String(data.repeaters)} />
          <StatCard label="Revenue" value={naira(data.revenue)} />
          <StatCard label="Loyalty need" value={data.loyaltyOn ? `${data.needed} orders` : 'Off'} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone"
          style={{ flex: '1 1 220px', padding: '10px 12px', borderRadius: 8, border: '1px solid #d9d3cd' }}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d9d3cd' }}>
          {FILTERS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d9d3cd' }}>
          <option value="spent">Sort: total spent</option>
          <option value="orders">Sort: paid orders</option>
          <option value="recent">Sort: recent</option>
        </select>
      </div>

      {error && <p style={{ color: '#b00020', marginBottom: 12 }}>{error}</p>}
      {!data && !error && <p>Loading customers…</p>}
      {data && shown.length === 0 && <p>No customers match these filters.</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {shown.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            loyaltyOn={data?.loyaltyOn}
            needed={data?.needed}
            isOpen={openId === customer.id}
            onToggle={() => setOpenId((current) => (current === customer.id ? null : customer.id))}
          />
        ))}
      </div>
    </div>
  )
}
