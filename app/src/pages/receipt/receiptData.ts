import { supabase } from '../../lib/supabaseClient'

export type ReceiptData = {
  restaurant: {
    name: string | null
    logo_url: string | null
    primary_color: string | null
    phone: string | null
    city: string | null
    address: string | null
    receipt_footer: string | null
    whatsapp_number: string | null
  }
  order: {
    order_number: string | null
    order_type: string
    subtotal: number | null
    delivery_fee: number | null
    takeaway_fee: number | null
    discount: number | null
    vat_amount: number | null
    service_charge: number | null
    total: number
    created_at: string
    paid_at: string | null
    customer_name: string | null
    customer_phone: string | null
    delivery_address: string | null
    payment_method: string | null
    table_number: string | null
  }
  items: { name: string; price: number; quantity: number }[]
  payment: { provider: string | null; reference: string | null; paid_at: string | null } | null
}

export async function fetchReceipt(key: string) {
  const { data, error } = await supabase.rpc('get_receipt', { p_key: key })
  if (error) throw new Error(error.message)
  return (data ?? null) as ReceiptData | null
}

export const TYPE_LABEL: Record<string, string> = {
  dine_in: 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
}

export const money = (n: number) => `₦${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`

export const safeColor = (c: string | null) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#ea580c')

export function maskPhone(p: string) {
  return p.length > 8 ? `${p.slice(0, p.length - 7)}•••${p.slice(-4)}` : p
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function payLabel(method?: string | null, provider?: string | null) {
  const m = (method || provider || '').toLowerCase()
  if (m === 'cash') return 'Cash'
  if (m === 'pos') return 'POS (card machine)'
  if (m === 'transfer') return 'Bank transfer'
  return 'Online payment'
}
