import { supabase } from '../../../lib/supabaseClient'

export type CustomerStat = {
  id: string
  name: string
  phone: string
  email: string
  joined: string
  orders: number
  spent: number
  lastOrder: string | null
  progress: number
  rewardReady: boolean
}

export type CustomerData = {
  customers: CustomerStat[]
  loyaltyOn: boolean
  needed: number
  windowDays: number
  buyers: number
  repeaters: number
  revenue: number
}

export type HistoryRow = {
  id: string
  order_number: string | null
  order_type: string
  status: string
  payment_status: string
  total: number
  created_at: string
}

export const isPaid = (s: string | null | undefined) =>
  ['success', 'paid'].includes((s || '').toLowerCase())

export async function loadHistory(customerId: string) {
  const { data } = await supabase
    .from('orders')
    .select('id,order_number,order_type,status,payment_status,total,created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(15)
  return (data ?? []) as HistoryRow[]
}

type OrderRow = {
  customer_id: string | null
  total: number
  payment_status: string
  created_at: string
  loyalty_reward_applied: boolean | null
}

export async function loadCustomers(restaurantId: string): Promise<CustomerData> {
  const [cust, ords, rest] = await Promise.all([
    supabase
      .from('customers')
      .select('id,name,phone,email,created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('orders')
      .select('customer_id,total,payment_status,created_at,loyalty_reward_applied')
      .eq('restaurant_id', restaurantId)
      .not('customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('restaurants')
      .select('loyalty_enabled,loyalty_min_orders,loyalty_window_days')
      .eq('id', restaurantId)
      .single(),
  ])
  if (cust.error) throw new Error(cust.error.message)
  if (ords.error) throw new Error(ords.error.message)

  const s = rest.data
  const loyaltyOn = !!s?.loyalty_enabled
  const needed = Math.max(1, Number(s?.loyalty_min_orders ?? 15))
  const windowDays = Math.max(1, Number(s?.loyalty_window_days ?? 60))
  const windowStart = Date.now() - windowDays * 86400000

  const byCustomer = new Map<string, OrderRow[]>()
  for (const o of (ords.data ?? []) as OrderRow[]) {
    if (!o.customer_id) continue
    const list = byCustomer.get(o.customer_id) ?? []
    list.push(o)
    byCustomer.set(o.customer_id, list)
  }

  const customers = (cust.data ?? []).map((c): CustomerStat => {
    const all = byCustomer.get(c.id) ?? []
    const paid = all.filter((o) => isPaid(o.payment_status))
    const rewardTimes = all
      .filter((o) => o.loyalty_reward_applied)
      .map((o) => new Date(o.created_at).getTime())
    const lastReward = rewardTimes.length ? Math.max(...rewardTimes) : 0
    const progress = paid.filter((o) => {
      const t = new Date(o.created_at).getTime()
      return t >= windowStart && t > lastReward
    }).length
    return {
      id: c.id,
      name: c.name || 'Unnamed',
      phone: c.phone || '',
      email: c.email || '',
      joined: c.created_at,
      orders: paid.length,
      spent: paid.reduce((sum, o) => sum + Number(o.total || 0), 0),
      lastOrder: paid[0]?.created_at ?? null,
      progress,
      rewardReady: loyaltyOn && progress >= needed,
    }
  })

  return {
    customers: customers.sort((a, b) => b.spent - a.spent),
    loyaltyOn,
    needed,
    windowDays,
    buyers: customers.filter((c) => c.orders > 0).length,
    repeaters: customers.filter((c) => c.orders > 1).length,
    revenue: customers.reduce((sum, c) => sum + c.spent, 0),
  }
}
