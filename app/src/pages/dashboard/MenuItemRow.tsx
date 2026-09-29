import { useRef, useState } from 'react'
import { uploadDishPhoto } from './menuImage'

export type DashItem = {
  id: string
    category_id: string | null
      name: string
        description: string | null
          price: number
            image_url: string | null
              availability: string
              }

              interface Props {
                item: DashItem
                  restaurantId: string
                    onChanged: () => void
                      onToggle: () => void
                        onDelete: () => void
                          onError: (msg: string) => void
                          }

                          const smallBtn = {
                            padding: '8px 12px',
                              borderRadius: 8,
                                border: '1px solid #d6cdc4',
                                  background: '#fff',
                                    fontSize: 14,
                                      cursor: 'pointer',
                                      } as const

                                      export function MenuItemRow(p: Props) {
                                        const fileRef = useRef<HTMLInputElement>(null)
                                          const [busy, setBusy] = useState(false)
                                            const soldOut = p.item.availability !== 'available'

                                              async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
                                                  const file = e.target.files?.[0]
                                                      e.target.value = ''
                                                          if (!file) return
                                                              setBusy(true)
                                                                  try {
                                                                        await uploadDishPhoto(p.restaurantId, p.item.id, file)
                                                                              p.onChanged()
                                                                                  } catch (err) {
                                                                                        p.onError(err instanceof Error ? err.message : 'Photo upload failed')
                                                                                            }
                                                                                                setBusy(false)
                                                                                                  }

                                                                                                    return (
                                                                                                        <div
                                                                                                              style={{
                                                                                                                      display: 'flex',
                                                                                                                              gap: 12,
                                                                                                                                      alignItems: 'center',
                                                                                                                                              padding: '10px 0',
                                                                                                                                                      borderBottom: '1px solid #f0ece8',
                                                                                                                                                              flexWrap: 'wrap',
                                                                                                                                                                    }}
                                                                                                                                                                        >
                                                                                                                                                                              <div
                                                                                                                                                                                      style={{
                                                                                                                                                                                                width: 64,
                                                                                                                                                                                                          height: 64,
                                                                                                                                                                                                                    borderRadius: 12,
                                                                                                                                                                                                                              overflow: 'hidden',
                                                                                                                                                                                                                                        background: '#fde7d3',
                                                                                                                                                                                                                                                  display: 'flex',
                                                                                                                                                                                                                                                            alignItems: 'center',
                                                                                                                                                                                                                                                                      justifyContent: 'center',
                                                                                                                                                                                                                                                                                fontSize: 28,
                                                                                                                                                                                                                                                                                          flexShrink: 0,
                                                                                                                                                                                                                                                                                                  }}
                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                {p.item.image_url ? (
                                                                                                                                                                                                                                                                                                                          <img src={p.item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                                                                                                                                                                                                                                                                  ) : (
                                                                                                                                                                                                                                                                                                                                            '🍽️'
                                                                                                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                                                                <div style={{ flex: 1, minWidth: 140 }}>
                                                                                                                                                                                                                                                                                                                                                                        <div style={{ fontSize: 17, fontWeight: 700 }}>{p.item.name}</div>
                                                                                                                                                                                                                                                                                                                                                                                <div style={{ fontSize: 15, color: '#7c6a5e' }}>
                                                                                                                                                                                                                                                                                                                                                                                          ₦{Number(p.item.price).toLocaleString()}
                                                                                                                                                                                                                                                                                                                                                                                                    {soldOut && <span style={{ color: '#b91c1c', marginLeft: 8 }}>Sold out</span>}
                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
                                                                                                                                                                                                                                                                                                                                                                                                                                        <button style={smallBtn} disabled={busy} onClick={() => fileRef.current?.click()}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                  {busy ? 'Uploading...' : p.item.image_url ? '📷 Change photo' : '📷 Add photo'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <button style={smallBtn} onClick={p.onToggle}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            {soldOut ? 'Mark available' : 'Mark sold out'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button style={{ ...smallBtn, color: '#b91c1c' }} onClick={p.onDelete}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      Delete
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          