                                   import { useState } from 'react'
                                   import { supabase } from '../../lib/supabaseClient'

                                   export default function Signup() {
                                     const [email, setEmail] = useState('')
                                       const [password, setPassword] = useState('')
                                         const [fullName, setFullName] = useState('')
                                           const [restaurantName, setRestaurantName] = useState('')
                                             const [error, setError] = useState('')
                                               const [loading, setLoading] = useState(false)

                                                 async function handleSignup(e: React.FormEvent) {
                                                     e.preventDefault()
                                                         setLoading(true)
                                                             setError('')

                                                                 const { data: authData, error: authError } = await supabase.auth.signUp({
                                                                       email,
                                                                             password,
                                                                                 })

                                                                                     if (authError || !authData.user) {
                                                                                           setError(authError?.message || 'Signup failed')
                                                                                                 setLoading(false)
                                                                                                       return
                                                                                                           }

                                                                                                               const slug = restaurantName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

                                                                                                                   const { data: restaurant, error: restError } = await supabase
                                                                                                                         .from('restaurants')
                                                                                                                               .insert({ name: restaurantName, slug })
                                                                                                                                     .select()
                                                                                                                                           .single()

                                                                                                                                               if (restError || !restaurant) {
                                                                                                                                                     setError(restError?.message || 'Could not create restaurant')
                                                                                                                                                           setLoading(false)
                                                                                                                                                                 return
                                                                                                                                                                     }

                                                                                                                                                                         const { error: profileError } = await supabase.from('profiles').insert({
                                                                                                                                                                               id: authData.user.id,
                                                                                                                                                                                     restaurant_id: restaurant.id,
                                                                                                                                                                                           role: 'restaurant_owner',
                                                                                                                                                                                                 full_name: fullName,
                                                                                                                                                                                                     })

                                                                                                                                                                                                         if (profileError) {
                                                                                                                                                                                                               setError(profileError.message)
                                                                                                                                                                                                                     setLoading(false)
                                                                                                                                                                                                                           return
                                                                                                                                                                                                                               }

                                                                                                                                                                                                                                   alert('Restaurant created! You can now log in.')
                                                                                                                                                                                                                                       setLoading(false)
                                                                                                                                                                                                                                         }

                                                                                                                                                                                                                                           return (
                                                                                                                                                                                                                                               <div style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
                                                                                                                                                                                                                                                     <h1>Create Your Restaurant</h1>
                                                                                                                                                                                                                                                           <form onSubmit={handleSignup}>
                                                                                                                                                                                                                                                                   <input placeholder="Restaurant name" value={restaurantName}
                                                                                                                                                                                                                                                                             onChange={(e) => setRestaurantName(e.target.value)} required
                                                                                                                                                                                                                                                                                       style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                                                                                                                                                                                                               <input placeholder="Owner full name" value={fullName}
                                                                                                                                                                                                                                                                                                         onChange={(e) => setFullName(e.target.value)} required
                                                                                                                                                                                                                                                                                                                   style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                                                                                                                                                                                                                                           <input placeholder="Email" type="email" value={email}
                                                                                                                                                                                                                                                                                                                                     onChange={(e) => setEmail(e.target.value)} required
                                                                                                                                                                                                                                                                                                                                               style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                                                                                                                                                                                                                                                                       <input placeholder="Password" type="password" value={password}
                                                                                                                                                                                                                                                                                                                                                                 onChange={(e) => setPassword(e.target.value)} required
                                                                                                                                                                                                                                                                                                                                                                           style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
                                                                                                                                                                                                                                                                                                                                                                                   {error && <p style={{ color: 'red' }}>{error}</p>}
                                                                                                                                                                                                                                                                                                                                                                                           <button type="submit" disabled={loading}>
                                                                                                                                                                                                                                                                                                                                                                                                     {loading ? 'Creating...' : 'Create Restaurant'}
                                                                                                                                                                                                                                                                                                                                                                                                             </button>
                                                                                                                                                                                                                                                                                                                                                                                                                   </form>
                                                                                                                                                                                                                                                                                                                                                                                                                       </div>
                                                                                                                                                                                                                                                                                                                                                                                                                         )
                                                                                                                                                                                                                                                                                                                                                                                                                         }