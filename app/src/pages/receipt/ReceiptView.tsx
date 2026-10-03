import { forwardRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { TYPE_LABEL, fmtDate, maskPhone, money, payLabel, safeColor } from './receiptData'
import type { ReceiptData } from './receiptData'

const dash: CSSProperties = { borderTop: '1.5px dashed #d1d5db', margin: '14px 0' }

function Line(p: { a: ReactNode; b: ReactNode; bold?: boolean; color?: string; size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '3px 0',
        fontSize: p.size ?? 14,
        fontWeight: p.bold ? 800 : 400,
        color: p.color,
      }}
    >
      <span>{p.a}</span>
      <span style={{ textAlign: 'right' }}>{p.b}</span>
    </div>
  )
}

export const ReceiptView = forwardRef<HTMLDivElement, { d: ReceiptData }>(function ReceiptView({ d }, ref) {
  const r = d.restaurant
  const o = d.order
  const brand = safeColor(r.primary_color)
  const place = [r.address, r.city].filter(Boolean).join(', ')
  const contact = [r.phone, r.whatsapp_number ? `WhatsApp ${r.whatsapp_number}` : '']
    .filter(Boolean)
    .join(' · ')
  const pos = (n: number | null | undefined) => Number(n ?? 0) > 0

  return (
    <div
      ref={ref}
      style={{
        background: '#fff',
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
        fontFamily: 'system-ui, sans-serif',
        color: '#1f2937',
      }}
    >
      <div style={{ background: brand, color: '#fff', padding: '22px 20px', textAlign: 'center' }}>
        {r.logo_url && (
          <img
            src={r.logo_url}
            alt=""
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.8)' }}
          />
        )}
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: r.logo_url ? 8 : 0 }}>{r.name}</div>
        {place && <div style={{ fontSize: 13, opacity: 0.9 }}>{place}</div>}
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#4b5563' }}>
          <span>{o.order_number || 'Order'}</span>
          <span>{fmtDate(o.created_at)}</span>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 10 }}>
          {TYPE_LABEL[o.order_type] || o.order_type || 'Order'}
          {o.table_number ? ` · Table ${o.table_number}` : ''}
        </div>

        {(o.customer_name || o.customer_phone || o.delivery_address) && (
          <div style={{ marginTop: 14, fontSize: 13, color: '#4b5563' }}>
            {o.customer_name && <div>{o.customer_name}</div>}
            {o.customer_phone && <div>{maskPhone(o.customer_phone)}</div>}
            {o.delivery_address && <div>{o.delivery_address}</div>}
          </div>
        )}

        <div style={dash} />

        {d.items.map((item, index) => (
          <div key={`${item.name}-${index}`} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>{money(item.price * item.quantity)}</span>
            </div>
            {item.price > 0 && (
              <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                {money(item.price)} each
              </div>
            )}
          </div>
        ))}

        <div style={dash} />

        <Line a="Subtotal" b={money(Number(o.subtotal ?? 0))} />
        {pos(o.delivery_fee) && <Line a="Delivery fee" b={money(Number(o.delivery_fee ?? 0))} />}
        {pos(o.takeaway_fee) && <Line a="Takeaway fee" b={money(Number(o.takeaway_fee ?? 0))} />}
        {pos(o.service_charge) && <Line a="Service charge" b={money(Number(o.service_charge ?? 0))} />}
        {pos(o.vat_amount) && <Line a="VAT" b={money(Number(o.vat_amount ?? 0))} />}
        {Number(o.discount ?? 0) > 0 && <Line a="Discount" b={`-${money(Number(o.discount ?? 0))}`} color="#16a34a" />}
        <Line a="Total" b={money(Number(o.total ?? 0))} bold size={18} />

        {d.payment && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Payment</div>
            <Line a={payLabel(o.payment_method, d.payment.provider)} b={d.payment.provider || 'Card'} />
            {d.payment.reference && <Line a="Reference" b={d.payment.reference} size={12} />}
            {d.payment.paid_at && <Line a="Paid" b={fmtDate(d.payment.paid_at)} size={12} />}
          </div>
        )}

        {contact && (
          <div style={{ marginTop: 18, fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
            {contact}
          </div>
        )}

        {r.receipt_footer && (
          <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px dashed #d1d5db', fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
            {r.receipt_footer}
          </div>
        )}
      </div>
    </div>
  )
})

