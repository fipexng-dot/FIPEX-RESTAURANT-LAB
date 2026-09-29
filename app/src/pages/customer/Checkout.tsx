import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CartItem } from '../../hooks/useCart'
import { supabase } from '../../lib/supabaseClient'
import { card, heading, money, cleanLocal, validPhone } from './checkoutHelpers'
import type { Loyalty, OrderType, RestaurantInfo } from './checkoutHelpers'
import { OrderTypeCard, DetailsCard } from './CheckoutForm'
import { LoyaltyBanner, SummaryCard, PayBar } from './CheckoutSummary'

export default function Checkout() {
  const { restaurantSlug } = useParams()
  const navigate = useNavigate()

  const [items, setItems] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [table, setTable] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('+234')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('cart')
    if (stored) {
      try {
        setItems(JSON.parse(stored) as CartItem[])
      } catch {
        setItems([])
      }
    }

    const storedTable = sessionStorage.getItem('table')
    if (storedTable) {
      setTable(storedTable)
      setOrderType('dine_in')
    }
  }, [])

  useEffect(() => {
    async function load() {
      if (!restaurantSlug) return

      const { data } = await supabase
        .from('restaurants')
        .select('id,name,primary_color,country_code,delivery_fee,takeaway_fee')
        .eq('slug', restaurantSlug)
        .single()

      if (data) {
        setRestaurant(data as RestaurantInfo)
        setCountryCode(data.country_code || '+234')
      }
    }

    load()
  }, [restaurantSlug])

  const local = cleanLocal(phone, countryCode)
  const phoneOk = validPhone(countryCode, local)
  const fullPhone = `${countryCode}${local}`

  useEffect(() => {
    setLoyalty(null)
    if (!restaurant || !phoneOk) return

    let cancelled = false
    const timeout = setTimeout(async () => {
      const { data } = await supabase.rpc('get_loyalty_status', {
        p_restaurant_id: restaurant.id,
        p_phone: fullPhone,
      })

      if (!cancelled && data?.[0]) setLoyalty(data[0] as Loyalty)
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [restaurant, phoneOk, fullPhone])

  const accent = restaurant?.primary_color || '#ea580c'
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === 'delivery' ? Number(restaurant?.delivery_fee ?? 0) : 0
  const takeawayFee = orderType === 'takeaway' ? Number(restaurant?.takeaway_fee ?? 0) : 0

  let discount = 0
  if (loyalty?.qualifies) {
    if (loyalty.reward_type === 'free_delivery') discount = deliveryFee
    else if (loyalty.reward_type === 'free_food') {
      discount = Math.min(Number(loyalty.reward_value || 0), subtotal)
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + takeawayFee - discount)
  const canPay =
    name.trim().length >= 2 && phoneOk && (orderType !== 'delivery' || address.trim().length >= 5)

  function proceedToPayment() {
    if (!canPay) return

    sessionStorage.setItem(
      'checkoutDetails',
      JSON.stringify({
        orderType,
        table,
        name: name.trim(),
        phone: fullPhone,
        address: address.trim(),
        subtotal,
        deliveryFee,
        takeawayFee,
        discount,
        loyaltyRewardApplied: discount > 0,
        total,
      }),
    )
    navigate(`/r/${restaurantSlug}/pay`)
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 18 }}>Your cart is empty.</p>
        <button
          onClick={() => navigate(`/r/${restaurantSlug}`)}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: accent,
            color: '#fff',
            fontSize: 16,
          }}
        >
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#f6f4f1', minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, paddingBottom: 130 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => navigate(`/r/${restaurantSlug}`)}
            aria-label="Back"
            style={{ border: 'none', background: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 18 }}
          >
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>Checkout</h1>
            {restaurant?.name && <div style={{ color: '#6b6b6b', fontSize: 15 }}>{restaurant.name}</div>}
          </div>
        </div>

        <div style={card}>
          <h3 style={heading}>Your Order</h3>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid #f0ece8',
              }}
            >
              <span style={{ fontSize: 16 }}>
                {item.name} <span style={{ color: '#6b6b6b' }}>× {item.quantity}</span>
              </span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{money(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <OrderTypeCard orderType={orderType} setOrderType={setOrderType} table={table} restaurant={restaurant} accent={accent} />
        <DetailsCard
          orderType={orderType}
          name={name}
          setName={setName}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
          phone={phone}
          setPhone={setPhone}
          phoneOk={phoneOk}
          address={address}
          setAddress={setAddress}
        />
        <LoyaltyBanner loyalty={loyalty} orderType={orderType} />
        <SummaryCard
          orderType={orderType}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          takeawayFee={takeawayFee}
          discount={discount}
          total={total}
        />
      </div>

      <PayBar canPay={canPay} total={total} accent={accent} onPay={proceedToPayment} />
    </div>
  )
}