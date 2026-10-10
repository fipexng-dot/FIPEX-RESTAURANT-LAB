import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

const card = { background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,.06)' } as const
const btn = { padding: '12px 16px', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' } as const

function CopyBox({ title, text }: { title: string; text: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
    } catch {
      alert('Press and hold the text to copy it')
    }
  }
  return (
    <div style={card}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ whiteSpace: 'pre-wrap', background: '#faf7f2', borderRadius: 10, padding: 10, fontSize: 14, color: '#44403c' }}>{text}</div>
      <button onClick={copy} style={{ ...btn, marginTop: 10, background: '#1c1917', color: '#fff' }}>{done ? 'Copied!' : 'Copy'}</button>
    </div>
  )
}

export default function ShareLink() {
  const { profile } = useAuth()
  const rid = (profile as unknown as { restaurant_id?: string } | null)?.restaurant_id
  const [rest, setRest] = useState<{ name: string; slug: string } | null>(null)
  useEffect(() => {
    if (!rid) return
    supabase.from('restaurants').select('name,slug').eq('id', rid).maybeSingle().then(({ data }) => setRest(data))
  }, [rid])
  if (!rest) return <div style={{ padding: 16 }}>Loading...</div>
  const link = `${window.location.origin}/r/${rest.slug}`
  const wa = `Hello! You can now order from ${rest.name} online: ${link}\nChoose delivery or takeaway and pay securely.`
  const ig = `Order online 👇\n${link}`
  const status = `Hungry? 🍽️ Order from ${rest.name} in 1 minute.\nTap the link: ${link}`
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 14 }}>
      <h2 style={{ margin: 0 }}>Share and promote</h2>
      <div style={card}>
        <div style={{ fontWeight: 800 }}>Your order link</div>
        <div style={{ margin: '8px 0', padding: 10, background: '#faf7f2', borderRadius: 10, wordBreak: 'break-all' }}>{link}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={`https://wa.me/?text=${encodeURIComponent(wa)}`} target="_blank" rel="noreferrer" style={{ ...btn, background: '#16a34a', color: '#fff' }}>Share on WhatsApp</a>
          <a href={link} target="_blank" rel="noreferrer" style={{ ...btn, background: '#fff', color: '#1c1917', border: '1.5px solid #e7e0d8' }}>Open as a customer</a>
        </div>
      </div>
      <CopyBox title="WhatsApp message (send to customers and groups)" text={wa} />
      <CopyBox title="WhatsApp Status caption" text={status} />
      <CopyBox title="Instagram bio line" text={ig} />
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>How to use it</div>
        <div style={{ color: '#57534e', fontSize: 14, lineHeight: 1.6 }}>
          1. Instagram: paste the link in your bio, and pin a story highlight called Order.<br />
          2. WhatsApp: add the link to your business profile and share it on your Status.<br />
          3. Customers tap the link, choose delivery or takeaway, and pay online.
        </div>
      </div>
    </div>
  )
}
