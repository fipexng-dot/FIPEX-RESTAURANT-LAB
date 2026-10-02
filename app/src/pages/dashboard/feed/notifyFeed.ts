import { supabase } from '../../../lib/supabaseClient'

export type Group = 'orders' | 'payments' | 'rewards'

export type Notice = {
  id: string
    icon: string
      group: Group
        at: string
          title: string
            detail: string
            }

            type Row = {
              id: string
                order_number: string | null
                  order_type: string
                    status: string
                      payment_status: string
                        total: number
                          discount: number | null
                            delivery_name: string | null
                              loyalty_reward_applied: boolean | null
                                created_at: string
                                  paid_at: string | null
                                    confirmed_at: string | null
                                      preparing_at: string | null
                                        ready_at: string | null
                                          completed_at: string | null
                                          }

                                          const TYPES: Record<string, string> = { dine_in: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' }
                                          const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`
                                          const isPaid = (r: Row) => ['success', 'paid'].includes((r.payment_status || '').toLowerCase())

                                          export async function loadFeed(restaurantId: string) {
                                            const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
                                              const { data, error } = await supabase
                                                  .from('orders')
                                                      .select(
                                                            'id,order_number,order_type,status,payment_status,total,discount,delivery_name,loyalty_reward_applied,created_at,paid_at,confirmed_at,preparing_at,ready_at,completed_at'
                                                                )
                                                                    .eq('restaurant_id', restaurantId)
                                                                        .gte('created_at', since)
                                                                            .order('created_at', { ascending: false })
                                                                                .limit(200)
                                                                                  if (error) throw new Error(error.message)

                                                                                    const out: Notice[] = []
                                                                                      let waiting = 0

                                                                                        for (const r of (data ?? []) as Row[]) {
                                                                                            const no = r.order_number || r.id.slice(0, 6)
                                                                                                const who = r.delivery_name || 'Customer'
                                                                                                    const kind = TYPES[r.order_type] || r.order_type
                                                                                                        const add = (suffix: string, icon: string, group: Group, at: string | null, title: string, detail: string) => {
                                                                                                              if (at) out.push({ id: `${r.id}-${suffix}`, icon, group, at, title, detail })
                                                                                                                  }

                                                                                                                      if (isPaid(r)) {
                                                                                                                            if (r.status === 'confirmed') waiting++
                                                                                                                                  add('new', '🛎️', 'orders', r.paid_at || r.confirmed_at || r.created_at, `New order ${no}`, `${who} · ${kind} · ${naira(r.total)} paid`)
                                                                                                                                        add('prep', '👨‍🍳', 'orders', r.preparing_at, `Order ${no} accepted`, `Being prepared for ${who}`)
                                                                                                                                              add('ready', '✅', 'orders', r.ready_at, `Order ${no} is ready`, `${kind} · ${who}`)
                                                                                                                                                    add('done', '🏁', 'orders', r.completed_at, `Order ${no} completed`, `${naira(r.total)} · ${who}`)
                                                                                                                                                          if (r.loyalty_reward_applied) {
                                                                                                                                                                  add('reward', '🎁', 'rewards', r.paid_at || r.created_at, `Loyalty reward used on ${no}`, `${who} saved ${naira(Number(r.discount || 0))}`)
                                                                                                                                                                        }
                                                                                                                                                                            } else if (
                                                                                                                                                                                  (r.payment_status || '').toLowerCase() === 'pending' &&
                                                                                                                                                                                        Date.now() - new Date(r.created_at).getTime() > 15 * 60 * 1000
                                                                                                                                                                                            ) {
                                                                                                                                                                                                  add('unpaid', '⚠️', 'payments', r.created_at, `Payment not completed for ${no}`, `${who} · ${kind} · ${naira(r.total)}`)
                                                                                                                                                                                                      }
                                                                                                                                                                                                        }

                                                                                                                                                                                                          out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                                                                                                                                                                                                            return { notices: out.slice(0, 150), waiting }
                                                                                                                                                                                                            }

                                                                                                                                                                                                            export function timeAgo(iso: string) {
                                                                                                                                                                                                              const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
                                                                                                                                                                                                                if (s < 60) return 'Just now'
                                                                                                                                                                                                                  if (s < 3600) return `${Math.floor(s / 60)} min ago`
                                                                                                                                                                                                                    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
                                                                                                                                                                                                                      const d = new Date(iso)
                                                                                                                                                                                                                        return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}`
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                        