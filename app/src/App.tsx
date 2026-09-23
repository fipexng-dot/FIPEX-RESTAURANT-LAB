import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

console.log('Supabase client:', supabase)

function App() {
  const [count, setCount] = useState(0)

    return (
        <div>
              <h1>Restaurant SaaS</h1>
                    <button onClick={() => setCount((count) => count + 1)}>
                            Count is {count}
                                  </button>
                                      </div>
                                        )
                                        }

                                        export default App