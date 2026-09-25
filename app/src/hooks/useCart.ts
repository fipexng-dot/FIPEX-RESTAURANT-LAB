import { useState, useCallback } from 'react'

export type CartItem = {
  id: string
    name: string
      price: number
        quantity: number
        }

        export function useCart() {
          const [items, setItems] = useState<CartItem[]>([])

            const addItem = useCallback((item: { id: string; name: string; price: number }) => {
                setItems((prev) => {
                      const existing = prev.find((i) => i.id === item.id)
                            if (existing) {
                                    return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                                          }
                                                return [...prev, { ...item, quantity: 1 }]
                                                    })
                                                      }, [])

                                                        const removeItem = useCallback((id: string) => {
                                                            setItems((prev) => prev.filter((i) => i.id !== id))
                                                              }, [])

                                                                const updateQuantity = useCallback((id: string, quantity: number) => {
                                                                    if (quantity <= 0) {
                                                                          setItems((prev) => prev.filter((i) => i.id !== id))
                                                                                return
                                                                                    }
                                                                                        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
                                                                                          }, [])

                                                                                            const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
                                                                                              const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)

                                                                                                return { items, addItem, removeItem, updateQuantity, subtotal, totalCount }
                                                                                                }
                                                                                                