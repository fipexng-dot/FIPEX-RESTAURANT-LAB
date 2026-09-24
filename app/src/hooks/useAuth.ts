import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Profile = {
  id: string
    restaurant_id: string
      role: string
        full_name: string | null
        }

        export function useAuth() {
          const [loading, setLoading] = useState(true)
            const [userId, setUserId] = useState<string | null>(null)
              const [profile, setProfile] = useState<Profile | null>(null)

                useEffect(() => {
                    async function load() {
                          const { data: { session } } = await supabase.auth.getSession()
                                if (!session) {
                                        setLoading(false)
                                                return
                                                      }
                                                            setUserId(session.user.id)

                                                                  const { data: profileData } = await supabase
                                                                          .from('profiles')
                                                                                  .select('*')
                                                                                          .eq('id', session.user.id)
                                                                                                  .single()

                                                                                                        setProfile(profileData)
                                                                                                              setLoading(false)
                                                                                                                  }
                                                                                                                      load()

                                                                                                                          const { data: listener } = supabase.auth.onAuthStateChange(() => {
                                                                                                                                load()
                                                                                                                                    })
                                                                                                                                        return () => listener.subscription.unsubscribe()
                                                                                                                                          }, [])

                                                                                                                                            return { loading, userId, profile }
                                                                                                                                            }
                                                                                                                                            