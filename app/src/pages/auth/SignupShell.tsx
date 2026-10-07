import { Link } from 'react-router-dom'
import OnboardingWizard from './OnboardingWizard'

const css = `
.fx-form input,.fx-form select,.fx-form textarea{border-radius:12px !important;border:1.5px solid #e4ddd5 !important;font-size:16px !important;box-sizing:border-box}
.fx-form input:focus,.fx-form select:focus,.fx-form textarea:focus{outline:none;border-color:#ea580c !important;box-shadow:0 0 0 3px rgba(234,88,12,.15)}
.fx-form button{border-radius:12px !important;font-weight:700}
@keyframes fxup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.fx-up{animation:fxup .5s ease both}
`
const perks = [
  ['📱', 'QR ordering', 'Guests scan, order and pay from their phones'],
  ['💳', 'Easy payments', 'Paystack online, plus cash, POS and transfer'],
  ['🔔', 'Live kitchen alerts', 'A loud alarm until every order is accepted'],
  ['📊', 'Smart reports', 'Best dishes, busiest hours, daily sales'],
]

export default function SignupShell() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fff7ed,#ffffff 45%,#fef0e4)', padding: '0 14px 40px' }}>
      <style>{css}</style>
      <div className="fx-up" style={{ maxWidth: 640, margin: '0 auto', padding: '28px 4px 8px' }}>
        <div style={{ fontWeight: 800, color: '#ea580c', letterSpacing: 0.5 }}>🍽️ FIPEX RESTAURANT LAB</div>
        <h1 style={{ fontSize: 30, lineHeight: 1.15, margin: '14px 0 8px', color: '#1c1917' }}>
          Launch your restaurant online, in minutes.
        </h1>
        <p style={{ color: '#57534e', fontSize: 16, margin: 0 }}>
          Take orders by QR code, get paid faster and run your whole restaurant from your phone.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '18px 0' }}>
          {perks.map(([icon, title, text]) => (
            <div key={title} style={{ background: '#fff', borderRadius: 14, padding: 12, boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{title}</div>
              <div style={{ color: '#78716c', fontSize: 12, marginTop: 2 }}>{text}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#7c2d12' }}>
          <span style={{ background: '#ffedd5', borderRadius: 20, padding: '4px 10px' }}>✅ All features unlocked</span>
          <span style={{ background: '#ffedd5', borderRadius: 20, padding: '4px 10px' }}>⚡ Set up in minutes</span>
          <span style={{ background: '#ffedd5', borderRadius: 20, padding: '4px 10px' }}>🇳🇬 Built for Nigerian restaurants</span>
        </div>
      </div>
      <div className="fx-up fx-form" style={{ maxWidth: 640, margin: '14px auto 0', background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 8px 30px rgba(0,0,0,.08)' }}>
        <OnboardingWizard />
      </div>
      <p style={{ textAlign: 'center', color: '#78716c', fontSize: 14, marginTop: 16 }}>
        Already have an account? <Link to="/login" style={{ color: '#ea580c', fontWeight: 700 }}>Log in</Link>
      </p>
    </div>
  )
}
