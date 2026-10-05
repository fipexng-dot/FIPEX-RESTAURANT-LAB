
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1500, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: '92vh', overflowY: 'auto', borderRadius: '18px 18px 0 0', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Take payment</h2>
          <button onClick={p.onClose} style={{ border: 'none', background: 'transparent', fontSize: 22 }}>✕</button>
        </div>

        <label style={lab}>Order type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {TYPES.map((t) => (
            <button key={t.key} style={choice(orderType === t.key)} onClick={() => setOrderType(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {orderType === 'dine_in' && (
          <>
            <label style={lab}>Table number (optional)</label>
            <input style={field} value={table} onChange={(e) => setTable(e.target.value)} />
          </>
        )}
        {orderType === 'delivery' && (
          <>
            <label style={lab}>Delivery address</label>
            <input style={field} value={address} onChange={(e) => setAddress(e.target.value)} />
          </>
        )}

        <label style={lab}>Customer name (optional)</label>
        <input style={field} value={name} onChange={(e) => setName(e.target.value)} />
        <label style={lab}>Phone (optional, earns loyalty)</label>
        <input style={field} value={phone} inputMode="tel" placeholder="0803 123 4567" onChange={(e) => setPhone(e.target.value)} />

        <div style={{ borderTop: '1px dashed #d1d5db', margin: '14px 0 8px' }} />
        <Row a="Subtotal" b={money(p.subtotal)} />
        {fee > 0 && <Row a={orderType === 'delivery' ? 'Delivery fee' : 'Takeaway pack'} b={money(fee)} />}
        <Row a="Total" b={money(total)} bold />

        <label style={lab}>Payment method</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {METHODS.map((m) => (
            <button key={m.key} style={choice(method === m.key)} onClick={() => setMethod(m.key)}>
              {m.label}
            </button>
          ))}
        </div>
        {method === 'transfer' && (
          <>
            <label style={lab}>Transfer reference or sender name (optional)</label>
            <input style={field} value={reference} onChange={(e) => setReference(e.target.value)} />
          </>
        )}

        {error && <p style={{ color: '#b91c1c', margin: '10px 0 0' }}>{error}</p>}
        <button
          onClick={submit}
          disabled={busy}
          style={{ width: '100%', marginTop: 14, padding: '15px 16px', fontSize: 18, fontWeight: 800, border: 'none', borderRadius: 12, background: busy ? '#c9c3bd' : '#16a34a', color: '#fff' }}
        >
          {busy ? 'Please wait...' : method === 'pay_later' ? `Create unpaid order · ${money(total)}` : `Confirm ${label} · ${money(total)}`}
        </button>
      </div>
    </div>
  )
}
