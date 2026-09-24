import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
      const [error, setError] = useState('')
        const [loading, setLoading] = useState(false)

          async function handleLogin(e: React.FormEvent) {
              e.preventDefault()
                  setLoading(true)
                      setError('')

                          const { error } = await supabase.auth.signInWithPassword({ email, password })

                              if (error) {
                                    setError(error.message)
                                        } else {
                                              alert('Logged in!')
                                                  }
                                                      setLoading(false)
                                                        }

                                                          return (
                                                              <div style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
                                                                    <h1>Sign In</h1>
                                                                          <form onSubmit={handleLogin}>
                                                                                  <input placeholder="Email" type="email" value={email}
                                                                                            onChange={(e) => setEmail(e.target.value)} required
                                                                                                      style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                              <input placeholder="Password" type="password" value={password}
                                                                                                                        onChange={(e) => setPassword(e.target.value)} required
                                                                                                                                  style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                                                          {error && <p style={{ color: 'red' }}>{error}</p>}
                                                                                                                                                  <button type="submit" disabled={loading}>
                                                                                                                                                            {loading ? 'Signing in...' : 'Sign In'}
                                                                                                                                                                    </button>
                                                                                                                                                                          </form>
                                                                                                                                                                              </div>
                                                                                                                                                                                )
                                                                                                                                                                                }