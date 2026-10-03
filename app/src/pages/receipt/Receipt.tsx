import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { ReceiptView } from './ReceiptView'
import { fetchReceipt } from './receiptData'
import type { ReceiptData } from './receiptData'

const btn: CSSProperties = {
  padding: '13px 10px',
  fontSize: 15,
  fontWeight: 700,
  borderRadius: 12,
  border: 'none',
  background: '#2b1b12',
  color: '#fff',
}
const light: CSSProperties = { ...btn, background: '#fff', color: '#2b1b12', border: '1.5px solid #d9d9d9' }

export default function Receipt() {
  const { key } = useParams()
  const [data, setData] = useState<ReceiptData | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!key) return
    fetchReceipt(key)
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [key])

  async function capture() {
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(box.current as HTMLElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
  }

  async function pdf() {
    if (!box.current || !data) return
    setBusy('pdf')
    try {
      const canvas = await capture()
      const { jsPDF } = await import('jspdf')
      const w = canvas.width / 2
      const h = canvas.height / 2
      const doc = new jsPDF({ unit: 'px', format: [w, h], orientation: w > h ? 'l' : 'p' })
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      doc.save(`receipt-${data.order.order_number || 'order'}.pdf`)
    } catch {
      alert('Could not create the PDF. Tap Print and choose Save as PDF.')
    }
    setBusy('')
  }

  if (!key) {
    return <div style={{ padding: 24 }}>Receipt not found.</div>
  }

  if (data === undefined && !error) {
    return <div style={{ padding: 24 }}>Loading receipt…</div>
  }

  if (error || !data) {
    return <div style={{ padding: 24, color: '#b00020' }}>{error || 'Receipt could not be loaded.'}</div>
  }

  return (
    <div style={{ padding: 16, background: '#f9f5f1', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" style={light} onClick={() => window.print()}>
          Print
        </button>
        <button type="button" style={btn} onClick={pdf} disabled={busy === 'pdf'}>
          {busy === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
        </button>
      </div>

      <div ref={box} style={{ width: '100%' }}>
        <ReceiptView d={data} />
      </div>
    </div>
  )
}
