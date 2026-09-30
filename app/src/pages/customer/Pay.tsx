import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CartItem } from '../../hooks/useCart'
import { card, heading, input, errorText, money } from './checkoutHelpers'

type Details = {
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  table: string | null
  name: string
  phone: string
  address?: string
  subtotal: number
  deliveryFee: number
  takeawayFee: number
  discount: number
  total: number
}

const FUNCTION_URL =
  'https://dpfgurqoogjintzqqzcx.supabase.co/functions/v1/initialize-payment'

function Row(p: { name: string; value: string; color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 16,
        padding: '4px 0',
        color: p.color,
      }}
    >
      <span>{p.name}</span>
      <span>{p.value}</span>
    </div>
  )
}

export default function Pay() {
  const { restaurantSlug } = useParams()
  const navigate = useNavigate()

  const [items, setItems] = useState<CartItem[]>([])
  const [details, setDetails] = useState<Details | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedCart = sessionStorage.getItem('cart')
    const storedDetails = sessionStorage.getItem('checkoutDetails')

    try {
      if (storedCart) setItems(JSON.parse(storedCart) as CartItem[])
      if (storedDetails) setDetails(JSON.parse(storedDetails) as Details)
    } catch {
      setItems([])
      setDetails(null)
    }
  }, [])

  async function handlePayNow() {
    setError('')

    if (!details || items.length === 0) {
      setError('Missing order details. Please go back to checkout.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_slug: restaurantSlug,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          order_type: details.orderType,
          table: details.table,
          name: details.name,
          phone: details.phone,
          address: details.address ?? null,
          email: email.trim(),
          callback_url: `${window.location.origin}/r/${restaurantSlug}/order-confirmation`,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error || 'Could not start payment')
      }

      window.location.href = data.authorization_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (items.length === 0 || !details) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 18 }}>Your cart is empty.</p>
        <button
          onClick={() => navigate(`/r/${restaurantSlug}`)}
          style={{ padding: '12px 24px', fontSize: 16 }}
        >
          Back to menu
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#f6f4f1', minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 16 }}>
        <h1 style={{ margin: '8px 0 16px', fontSize: 26 }}>Payment</h1>

        <div style={card}>
          <h3 style={heading}>Order summary</h3>
          {items.map((item) => (
            <Row
              key={item.id}
              name={`${item.name} × ${item.quantity}`}
              value={money(item.price * item.quantity)}
            />
          ))}
          <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
            {details.deliveryFee > 0 && <Row name="Delivery fee" value={money(details.deliveryFee)} />}
            {details.takeawayFee > 0 && <Row name="Takeaway pack" value={money(details.takeawayFee)} />}
            {details.discount > 0 && (
              <Row name="Loyalty reward" value={`− ${money(details.discount)}`} color="#2e7d32" />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 20,
                fontWeight: 800,
                paddingTop: 8,
              }}
            >
              <span>Total</span>
              <span>{money(details.total)}</span>
            </div>
          </div>
        </div>

        <div style={card}>
          <h3 style={heading}>Email for your receipt</h3>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={input}
          />
          {error && <p style={errorText}>{error}</p>}
        </div>

        <button
          onClick={handlePayNow}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: 18,
            fontWeight: 700,
            border: 'none',
            borderRadius: 12,
            background: loading ? '#c9c3bd' : '#ea580c',
            color: '#fff',
          }}
        >
          {loading ? 'Please wait...' : `Pay ${money(details.total)}`}
        </button>
        <button
          onClick={() => navigate(`/r/${restaurantSlug}/checkout`)}
          style={{
            width: '100%',
            marginTop: 10,
            padding: 12,
            fontSize: 16,
            background: 'transparent',
            border: 'none',
            color: '#6b6b6b',
          }}
        >
          ← Back to checkout
        </button>
      </div>
    </div>
  )
}
