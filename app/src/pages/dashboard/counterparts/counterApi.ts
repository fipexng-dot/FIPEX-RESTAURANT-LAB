import { supabase } from '../../../lib/supabaseClient'

export type CounterResult = {
  order_id: string
  order_number: string | null
  receipt_token: string | null
  total: number
  paid: boolean
}

const URL = 'https://dpfgurqoogjintzqqzcx.supabase.co/functions/v1/counter-order'

export async function counterCall(body: Record<string, unknown>): Promise<CounterResult> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in again')
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Something went wrong')
  return json as CounterResult
}

export const METHODS = [
  { key: 'cash', label: '💵 Cash' },
  { key: 'pos', label: '💳 POS' },
  { key: 'transfer', label: '🏦 Transfer' },
  { key: 'pay_later', label: '⏳ Pay later' },
]
