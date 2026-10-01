import type { ReactNode } from 'react'

export const COLORS = ['#ea580c', '#16a34a', '#2563eb', '#9333ea', '#eab308', '#0891b2']

export const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`

export const short = (n: number) =>
  n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}m`
          : n >= 1000
                ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
                      : String(Math.round(n))

                      export function Panel(p: { title: string; sub?: string; children: ReactNode }) {
                        return (
                            <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                  <h3 style={{ margin: 0, fontSize: 18 }}>{p.title}</h3>
                                        {p.sub && <div style={{ fontSize: 14, color: '#6b6b6b', marginTop: 2 }}>{p.sub}</div>}
                                              <div style={{ marginTop: 10 }}>{p.children}</div>
                                                  </div>
                                                    )
                                                    }

                                                    export function Kpi(p: { label: string; value: string; delta?: number | null; note?: string }) {
                                                      const d = p.delta
                                                        return (
                                                            <div style={{ background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                                                  <div style={{ fontSize: 14, color: '#6b6b6b' }}>{p.label}</div>
                                                                        <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0' }}>{p.value}</div>
                                                                              {d !== undefined &&
                                                                                      (d === null ? (
                                                                                                <div style={{ fontSize: 13, color: '#6b6b6b' }}>New activity</div>
                                                                                                        ) : (
                                                                                                                  <div style={{ fontSize: 13, fontWeight: 700, color: d >= 0 ? '#16a34a' : '#dc2626' }}>
                                                                                                                              {d >= 0 ? '▲' : '▼'} {Math.abs(d).toFixed(1)}% vs previous
                                                                                                                                        </div>
                                                                                                                                                ))}
                                                                                                                                                      {p.note && <div style={{ fontSize: 13, color: '#6b6b6b' }}>{p.note}</div>}
                                                                                                                                                          </div>
                                                                                                                                                            )
                                                                                                                                                            }

                                                                                                                                                            export function BarList(p: { rows: { name: string; value: number; label: string }[]; color: string }) {
                                                                                                                                                              const max = Math.max(1, ...p.rows.map((r) => r.value))
                                                                                                                                                                if (p.rows.length === 0) return <p style={{ color: '#6b6b6b', margin: 0 }}>No data for this period.</p>
                                                                                                                                                                  return (
                                                                                                                                                                      <div>
                                                                                                                                                                            {p.rows.map((r) => (
                                                                                                                                                                                    <div key={r.name} style={{ marginTop: 10 }}>
                                                                                                                                                                                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 15 }}>
                                                                                                                                                                                                          <span style={{ fontWeight: 600 }}>{r.name}</span>
                                                                                                                                                                                                                      <span style={{ color: '#4a4a4a' }}>{r.label}</span>
                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                          <div style={{ height: 10, background: '#f1ece6', borderRadius: 6, marginTop: 4 }}>
                                                                                                                                                                                                                                                      <div
                                                                                                                                                                                                                                                                    style={{
                                                                                                                                                                                                                                                                                    width: `${(r.value / max) * 100}%`,
                                                                                                                                                                                                                                                                                                    height: '100%',
                                                                                                                                                                                                                                                                                                                    background: p.color,
                                                                                                                                                                                                                                                                                                                                    borderRadius: 6,
                                                                                                                                                                                                                                                                                                                                                  }}
                                                                                                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                      ))}
                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                            )
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            