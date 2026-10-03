import { useEffect, useState } from 'react'
import { timeAgo } from '../feed/notifyFeed'
import { isPaid, loadHistory } from './customerData'
import type { CustomerStat, HistoryRow } from './customerData'

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`
const TYPES: Record<string, string> = {
  dine_in: 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
}

type CustomerCardProps = {
  customer: CustomerStat
  loyaltyOn?: boolean
  needed?: number
  isOpen?: boolean
  onToggle?: () => void
}

function History({ id }: { id: string }) {
  const [rows, setRows] = useState<HistoryRow[] | null>(null)

  useEffect(() => {
    loadHistory(id).then(setRows)
  }, [id])

  if (!rows) return <p style={{ margin: '8px 0 0' }}>Loading orders...</p>
  if (rows.length === 0) return <p style={{ margin: '8px 0 0', color: '#6b6b6b' }}>No orders yet.</p>

  return (
    <div style={{ marginTop: 12 }}>
      {rows.map((o) => (
        <div
          key={o.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 14,
            padding: '6px 0',
            borderTop: '1px solid #f0ece8',
            flexWrap: 'wrap',
          }}
        >
          <span>
            {o.order_number || o.id.slice(0, 6)} · {TYPES[o.order_type] || o.order_type}
          </span>
          <span>
            {naira(o.total)} · {timeAgo(o.created_at)}
            {!isPaid(o.payment_status) && ' (unpaid)'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CustomerCard({ customer, loyaltyOn, needed, isOpen = false, onToggle }: CustomerCardProps) {
  const progressPercent = needed ? Math.min(100, (customer.progress / needed) * 100) : 0

  return (
    <div
      style={{
        border: '1px solid #e7ddd1',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(30, 20, 14, 0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{customer.name}</div>
          <div style={{ color: '#6b6b6b', fontSize: 13, marginTop: 4 }}>
            {customer.phone || 'No phone'}
            {customer.email ? ` · ${customer.email}` : ''}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          style={{
            border: '1px solid #d9d3cd',
            background: '#f9f4f0',
            color: '#2b1b12',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isOpen ? 'Hide orders' : 'View orders'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginTop: 14,
        }}
      >
        <div>
          <div style={{ color: '#6b6b6b', fontSize: 12 }}>Paid orders</div>
          <div style={{ fontWeight: 700 }}>{customer.orders}</div>
        </div>
        <div>
          <div style={{ color: '#6b6b6b', fontSize: 12 }}>Total spent</div>
          <div style={{ fontWeight: 700 }}>{naira(customer.spent)}</div>
        </div>
        <div>
          <div style={{ color: '#6b6b6b', fontSize: 12 }}>Last order</div>
          <div style={{ fontWeight: 700 }}>{customer.lastOrder ? timeAgo(customer.lastOrder) : 'No order yet'}</div>
        </div>
      </div>

      {loyaltyOn && needed ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, marginBottom: 6 }}>
            <span>Reward progress</span>
            <span>
              {customer.progress}/{needed}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: 999, background: '#f0e7e2', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#d97706',
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ marginTop: 6, color: '#6b6b6b', fontSize: 12 }}>
            {customer.rewardReady ? 'Reward ready.' : `${Math.max(0, needed - customer.progress)} more orders to unlock.`}
          </div>
        </div>
      ) : null}

      {isOpen && <History id={customer.id} />}
    </div>
  )
}

export default CustomerCard
