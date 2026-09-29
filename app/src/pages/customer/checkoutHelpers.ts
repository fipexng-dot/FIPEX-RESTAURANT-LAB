import type { CSSProperties } from 'react'

export type OrderType = 'dine_in' | 'takeaway' | 'delivery'

export interface RestaurantInfo {
  id: string
    name: string
      primary_color: string | null
        country_code: string | null
          delivery_fee: number | null
            takeaway_fee: number | null
            }

            export interface Loyalty {
              qualifies: boolean
                order_count: number
                  needed: number
                    reward_type: string
                      reward_value: number
                      }

                      export const COUNTRIES = [
                        { code: '+234', label: '🇳🇬 +234' },
                          { code: '+233', label: '🇬🇭 +233' },
                            { code: '+254', label: '🇰🇪 +254' },
                              { code: '+27', label: '🇿🇦 +27' },
                                { code: '+44', label: '🇬🇧 +44' },
                                  { code: '+1', label: '🇺🇸 +1' },
                                    { code: '+971', label: '🇦🇪 +971' },
                                    ]

                                    export const money = (n: number) => `₦${Math.round(n).toLocaleString()}`

                                    export function cleanLocal(raw: string, code: string) {
                                      let d = raw.replace(/\D/g, '')
                                        const cc = code.replace('+', '')
                                          if (code === '+234' && d.startsWith(cc) && d.length > 10) d = d.slice(cc.length)
                                            return d.replace(/^0+/, '')
                                            }

                                            export function validPhone(code: string, local: string) {
                                              if (code === '+234') return /^[789][01]\d{8}$/.test(local)
                                                return local.length >= 6 && local.length <= 12
                                                }

                                                export const card: CSSProperties = {
                                                  background: '#fff',
                                                    borderRadius: 16,
                                                      padding: 16,
                                                        marginBottom: 14,
                                                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                                          }
                                                          export const heading: CSSProperties = { margin: '0 0 12px', fontSize: 18, fontWeight: 700 }
                                                          export const label: CSSProperties = { display: 'block', fontSize: 15, fontWeight: 600, margin: '10px 0 6px' }
                                                          export const input: CSSProperties = {
                                                            width: '100%',
                                                              padding: '12px 14px',
                                                                fontSize: 16,
                                                                  border: '1.5px solid #d9d9d9',
                                                                    borderRadius: 10,
                                                                      background: '#fff',
                                                                        outline: 'none',
                                                                        }
                                                                        export const errorText: CSSProperties = { color: '#c62828', fontSize: 14, margin: '4px 0 0' }
                                                                        