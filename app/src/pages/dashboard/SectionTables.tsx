import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Card, Field, inputStyle, num } from './settingsKit'
import type { SectionProps } from './settingsKit'

type TableRow = { id: string; table_number: string }

const byNumber = (a: TableRow, b: TableRow) =>
  a.table_number.localeCompare(b.table_number, undefined, { numeric: true })

  const btn = {
    padding: '11px 16px',
      fontSize: 15,
        fontWeight: 700,
          borderRadius: 10,
            border: '1.5px solid #d9d9d9',
              background: '#fff',
              } as const

              export function TablesSection({ row }: SectionProps) {
                const [tables, setTables] = useState<TableRow[]>([])
                  const [count, setCount] = useState('10')
                    const [busy, setBusy] = useState(false)
                      const [msg, setMsg] = useState('')

                        const load = useCallback(async () => {
                            const { data } = await supabase.from('tables').select('id,table_number').eq('restaurant_id', row.id)
                                const list = ((data ?? []) as TableRow[]).sort(byNumber)
                                    setTables(list)
                                        if (list.length > 0) setCount(String(list.length))
                                          }, [row.id])

                                            useEffect(() => {
                                                load()
                                                  }, [load])

                                                    async function create() {
                                                        const n = Math.min(200, Math.max(1, Math.round(num(count, 0))))
                                                            setCount(String(n))
                                                                setBusy(true)
                                                                    setMsg('')
                                                                        const have = new Set(tables.map((t) => t.table_number))
                                                                            const missing: { restaurant_id: string; table_number: string }[] = []
                                                                                for (let i = 1; i <= n; i++) {
                                                                                      if (!have.has(String(i))) missing.push({ restaurant_id: row.id, table_number: String(i) })
                                                                                          }
                                                                                              if (missing.length === 0) {
                                                                                                    setMsg(`Tables 1 to ${n} already exist`)
                                                                                                          setBusy(false)
                                                                                                                return
                                                                                                                    }
                                                                                                                        const { error } = await supabase.from('tables').insert(missing)
                                                                                                                            setBusy(false)
                                                                                                                                if (error) {
                                                                                                                                      setMsg(error.message)
                                                                                                                                            return
                                                                                                                                                }
                                                                                                                                                    setMsg(`Created ${missing.length} new table${missing.length > 1 ? 's' : ''} ✓`)
                                                                                                                                                        await load()
                                                                                                                                                          }

                                                                                                                                                            async function removeExtra() {
                                                                                                                                                                const n = Math.round(num(count, 0))
                                                                                                                                                                    const extra = tables.filter((t) => Number(t.table_number) > n)
                                                                                                                                                                        if (extra.length === 0) {
                                                                                                                                                                              setMsg('No extra tables to remove')
                                                                                                                                                                                    return
                                                                                                                                                                                        }
                                                                                                                                                                                            if (!confirm(`Remove ${extra.length} table(s) above ${n}? Tables that have orders are kept.`)) return
                                                                                                                                                                                                setBusy(true)
                                                                                                                                                                                                    setMsg('')
                                                                                                                                                                                                        let removed = 0
                                                                                                                                                                                                            let kept = 0
                                                                                                                                                                                                                for (const t of extra) {
                                                                                                                                                                                                                      const { data: used } = await supabase.from('orders').select('id').eq('table_id', t.id).limit(1)
                                                                                                                                                                                                                            if (used && used.length > 0) {
                                                                                                                                                                                                                                    kept++
                                                                                                                                                                                                                                            continue
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                        const { error } = await supabase.from('tables').delete().eq('id', t.id)
                                                                                                                                                                                                                                                              if (error) kept++
                                                                                                                                                                                                                                                                    else removed++
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                            setBusy(false)
                                                                                                                                                                                                                                                                                setMsg(`Removed ${removed}${kept ? `, kept ${kept} that have orders` : ''}`)
                                                                                                                                                                                                                                                                                    await load()
                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                        return (
                                                                                                                                                                                                                                                                                            <Card
                                                                                                                                                                                                                                                                                                  title="Tables and QR codes"
                                                                                                                                                                                                                                                                                                        hint="Enter how many tables you have. Existing tables are kept, and only missing ones are created."
                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                  <p style={{ margin: '8px 0 0', fontSize: 15 }}>
                                                                                                                                                                                                                                                                                                                          You currently have <strong>{tables.length}</strong> table{tables.length === 1 ? '' : 's'}.
                                                                                                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                                                                                                                                      <Field label="Number of tables">
                                                                                                                                                                                                                                                                                                                                              <input style={inputStyle} value={count} inputMode="numeric" onChange={(e) => setCount(e.target.value)} />
                                                                                                                                                                                                                                                                                                                                                    </Field>
                                                                                                                                                                                                                                                                                                                                                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                                                                                                                                                                                                                                                                                                                                                                  <button style={{ ...btn, background: '#2b1b12', color: '#fff', border: 'none' }} disabled={busy} onClick={create}>
                                                                                                                                                                                                                                                                                                                                                                            {busy ? 'Working...' : 'Create tables'}
                                                                                                                                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                                                                                                                                            <button style={btn} disabled={busy} onClick={removeExtra}>
                                                                                                                                                                                                                                                                                                                                                                                                      Remove unused extras
                                                                                                                                                                                                                                                                                                                                                                                                              </button>
                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                          {msg && <p style={{ margin: '10px 0 0', fontSize: 15, color: '#15803d' }}>{msg}</p>}
                                                                                                                                                                                                                                                                                                                                                                                                                                <p style={{ margin: '12px 0 0' }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                        <Link to="/dashboard/tables">Open QR codes to print →</Link>
                                                                                                                                                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                  </Card>
                                                                                                                                                                                                                                                                                                                                                                                                                                                    )
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                    