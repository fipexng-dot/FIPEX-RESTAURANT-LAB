import { supabase } from '../../../lib/supabaseClient'

export type StaffMember = {
  id: string
  full_name: string | null
  role: string
  status: string | null
  phone: string | null
  email: string
  last_sign_in_at: string | null
  created_at: string
}

const URL = 'https://dpfgurqoogjintzqqzcx.supabase.co/functions/v1/manage-staff'

export async function staffCall<T = unknown>(body: Record<string, unknown>): Promise<T> {
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
  return json as T
}

export const ROLE_CHOICES = [
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'kitchen', label: 'Kitchen staff' },
]

export function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const nums = new Uint32Array(10)
  crypto.getRandomValues(nums)
  return Array.from(nums, (n) => chars[n % chars.length]).join('') + '#7'
}
