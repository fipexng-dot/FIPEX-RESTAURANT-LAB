import { Link } from 'react-router-dom'

const features = [
  ['📱', 'QR ordering', 'Guests scan, browse your photo menu and order from their phones.'],
  ['💳', 'Get paid your way', 'Paystack online, plus cash, POS and bank transfer at the counter.'],
  ['🔔', 'Never miss an order', 'A loud alert rings in the kitchen until the order is accepted.'],
  ['🧾', 'Instant receipts', 'Clean receipts customers can print, download or share.'],
  ['📊', 'Know your numbers', 'Daily sales, best-selling dishes and busiest hours at a glance.'],
  ['👥', 'Your whole team', 'Owner, manager, cashier and kitchen logins with the right access.'],
]
const steps = [
  ['1', 'Sign up', 'Create your restaurant account in minutes.'],
  ['2', 'Add your menu', 'Upload dishes with photos and prices.'],
  ['3', 'Print your QR codes', 'Place them on tables and start taking orders.'],
]
const css = `
.fx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.fx-btn{display:inline-block;padding:14px 22px;border-radius:14px;font-weight:700;text-decoration:none;font-size:16px}
.fx-btn:active{transform:scale(.98)}
@keyframes fxin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.fx-in{animation:fxin .6s ease both}
`

export default function Landing() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1c1917', background: '#fffaf5', minHeight: '100vh' }}>
      <style>{css}</style>
      <header style={{ maxWidth: 960, margin: '0 auto', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>
          <span style={{ background: 'linear-gradient(135deg,#ea580c,#f59e0b)', color: '#fff', borderRadius: 8, padding: '4px 9px', marginRight: 8 }}>F</span>
          FIPEX RESTAURANT LAB
        </div>
        <Link to="/login" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
      </header>
      <section className="fx-in" style={{ maxWidth: 960, margin: '0 auto', padding: '30px 18px 10px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#ffedd5', color: '#9a3412', borderRadius: 20, padding: '5px 12px', fontSize: 13, fontWeight: 600 }}>
          🇳🇬 Built for Nigerian restaurants
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 54px)', lineHeight: 1.1, margin: '16px 0 12px' }}>
          Take orders by QR.<br />Get paid. Run it from your phone.
        </h1>
        <p style={{ color: '#57534e', fontSize: 17, maxWidth: 560, margin: '0 auto 22px' }}>
          Your menu, orders, payments, kitchen and sales reports in one simple app, with no extra hardware.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="fx-btn" style={{ background: 'linear-gradient(135deg,#ea580c,#f59e0b)', color: '#fff' }}>Register your restaurant</Link>
          <Link to="/r/ojokit" className="fx-btn" style={{ background: '#fff', color: '#1c1917', border: '1.5px solid #e7e0d8' }}>Try the demo menu</Link>
        </div>
      </section>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '34px 18px 6px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 16px' }}>Everything your restaurant needs</h2>
        <div className="fx-grid">
          {features.map(([icon, title, text]) => (
            <div key={title} style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 26 }}>{icon}</div>
              <div style={{ fontWeight: 700, margin: '6px 0 2px' }}>{title}</div>
              <div style={{ color: '#78716c', fontSize: 14 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '34px 18px 10px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 16px' }}>Up and running in 3 steps</h2>
        <div className="fx-grid">
          {steps.map(([n, title, text]) => (
            <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff7ed', borderRadius: 16, padding: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{n}</div>
              <div><div style={{ fontWeight: 700 }}>{title}</div><div style={{ color: '#78716c', fontSize: 14 }}>{text}</div></div>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ textAlign: 'center', color: '#a8a29e', fontSize: 13, padding: '34px 18px 40px' }}>
        © {new Date().getFullYear()} FIPEX RESTAURANT LAB ·{' '}
        <Link to="/login" style={{ color: '#a8a29e' }}>Log in</Link> · <Link to="/signup" style={{ color: '#a8a29e' }}>Sign up</Link>
      </footer>
    </div>
  )
}
