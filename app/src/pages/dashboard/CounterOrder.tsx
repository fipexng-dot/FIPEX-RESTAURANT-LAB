import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../hooks/useCart'
import { MenuItemCard } from '../customer/MenuItemCard'
import type { Category, MenuItem } from '../customer/menuHelpers'
import { money } from '../customer/checkoutHelpers'
import { CheckoutPanel } from './counterparts/CheckoutPanel'
import type { CounterResult } from './counterparts/counterApi'

type Fees = { delivery_fee: number | null; takeaway_fee: number | null }

function Inner({ onNew }: { onNew: () => void }) {
  const { profile } = useAuth()
  const rid = profile?.restaurant_id
  const cart = useCart()
  const [fees, setFees] = useState<Fees>({ delivery_fee: 0, takeaway_fee: 0 })
  const [cats, setCats] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [panel, setPanel] = useState(false)
  const [result, setResult] = useState<CounterResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!rid) return
    Promise.all([
      supabase.from('restaurants').select('delivery_fee,takeaway_fee').eq('id', rid).single(),
      supabase.from('menu_categories').select('*').eq('restaurant_id', rid).order('sort_order'),
      supabase.from('menu_items').select('*').eq('restaurant_id', rid).neq('availability', 'hidden'),
    ])
      .then(([r, c, m]) => {
        if (r.data) setFees(r.data)
        setCats((c.data ?? []) as Category[])
        setItems((m.data ?? []) as MenuItem[])
      })
      .catch((e: Error) => setError(e.message))
  }, [rid])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (i) => (activeCat === 'all' || i.category_id === activeCat) && (!q || i.name.toLowerCase().includes(q))
    )
  }, [items, search, activeCat])

  const qtyOf = (id: string) => cart.items.find((i) => i.id === id)?.quantity ?? 0
