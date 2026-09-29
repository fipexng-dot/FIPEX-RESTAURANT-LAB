export type Restaurant = {
      id: string
        name: string
          slug: string
            logo_url: string | null
              slogan: string | null
                primary_color: string | null
                  secondary_color: string | null
                    status: string
                      city: string | null
                      }
                      export type Category = { id: string; name: string }
                      export type MenuItem = {
                        id: string
                          category_id: string | null
                            name: string
                              description: string | null
                                price: number
                                  image_url: string | null
                                    availability: string
                                      is_featured: boolean | null
                                      }

                                      export const money = (n: number) => `₦${Math.round(n).toLocaleString()}`

                                      export const isSoldOut = (availability: string) => /sold|out|unavail/i.test(availability || '')

                                      export function dishEmoji(name: string) {
                                        const n = name.toLowerCase()
                                          if (/rice|jollof|fried rice/.test(n)) return '🍛'
                                            if (/beef|steak|suya|meat|goat/.test(n)) return '🍖'
                                              if (/chicken|wing/.test(n)) return '🍗'
                                                if (/fish|catfish|tilapia/.test(n)) return '🐟'
                                                  if (/burger/.test(n)) return '🍔'
                                                    if (/pizza/.test(n)) return '🍕'
                                                      if (/pasta|spaghetti|noodle/.test(n)) return '🍝'
                                                        if (/soup|stew|pepper/.test(n)) return '🍲'
                                                          if (/salad/.test(n)) return '🥗'
                                                            if (/drink|juice|water|soda|coke|malt|zobo/.test(n)) return '🥤'
                                                              if (/cake|dessert|ice/.test(n)) return '🍰'
                                                                return '🍽️'
                                                                }

                                                                const BG = [
                                                                  'linear-gradient(135deg,#ffedd5,#fdba74)',
                                                                    'linear-gradient(135deg,#fef3c7,#fcd34d)',
                                                                      'linear-gradient(135deg,#fee2e2,#fca5a5)',
                                                                        'linear-gradient(135deg,#dcfce7,#86efac)',
                                                                        ]
                                                                        export function fallbackBg(id: string) {
                                                                          let h = 0
                                                                            for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
                                                                              return BG[h % BG.length]
                                                                              }
                                                                    