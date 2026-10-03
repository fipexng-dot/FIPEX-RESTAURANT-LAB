import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const btn = {
  padding: '6px 10px',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #d9d9d9',
  background: '#fff',
  color: '#2b1b12',
  textDecoration: 'none',
} as const

export function ReceiptLink(p: { orderId: string; paid: boolean; phone?: string | null }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!p.paid) return
    supabase
      .from('orders')
      .select('receipt_token')
      .eq('id', p.orderId)
      .single()
      .then(({ data }) => setToken(data?.receipt_token ?? null))
  }, [p.orderId, p.paid])

  if (!p.paid || !token) return null
  const url = `${window.location.origin}/receipt/${token}`
  const digits = (p.phone || '').replace(/\D/g, '')
  const wa = `https://wa.me/${digits}?text=${encodeURIComponent(`Your receipt: ${url}`)}`

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      <a href={url} target="_blank" rel="noreferrer" style={btn}>📄 Receipt</a>
      <button style={btn} onClick={() => navigator.clipboard?.writeText(url)}>Copy link</button>
      <a href={wa} target="_blank" rel="noreferrer" style={btn}>💬 WhatsApp</a>
    </div>
  )
}
