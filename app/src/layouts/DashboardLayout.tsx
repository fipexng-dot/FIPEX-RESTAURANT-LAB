import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/orders', label: 'Orders' },
      { to: '/dashboard/menu', label: 'Menu' },
        { to: '/dashboard/tables', label: 'Tables & QR' },
          { to: '/dashboard/customers', label: 'Customers' },
            { to: '/dashboard/payments', label: 'Payments' },
              { to: '/dashboard/kitchen', label: 'Kitchen' },
                { to: '/dashboard/reports', label: 'Reports' },
                  { to: '/dashboard/staff', label: 'Staff' },
                    { to: '/dashboard/notifications', label: 'Notifications' },
                      { to: '/dashboard/settings', label: 'Settings' },
                      ]

                      export default function DashboardLayout() {
                        const { profile } = useAuth()
                          const navigate = useNavigate()

                            async function handleLogout() {
                                await supabase.auth.signOut()
                                    navigate('/login')
                                      }

                                        return (
                                            <div style={{ display: 'flex', minHeight: '100vh' }}>
                                                  <aside style={{ width: 200, borderRight: '1px solid #ddd', padding: 12 }}>
                                                          <h3>Restaurant SaaS</h3>
                                                                  {navItems.map((item) => (
                                                                            <div key={item.to} style={{ marginBottom: 8 }}>
                                                                                        <Link to={item.to}>{item.label}</Link>
                                                                                                  </div>
                                                                                                          ))}
                                                                                                                </aside>
                                                                                                                      <main style={{ flex: 1, padding: 16 }}>
                                                                                                                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
                                                                                                                                        <span>👤 {profile?.full_name} ({profile?.role})</span>
                                                                                                                                                  <button onClick={handleLogout}>Logout</button>
                                                                                                                                                          </div>
                                                                                                                                                                  <Outlet />
                                                                                                                                                                        </main>
                                                                                                                                                                            </div>
                                                                                                                                                                              )
                                                                                                                                                                              }
                                                                                                                                                                              