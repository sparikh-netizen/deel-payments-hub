const ROWS = [
  { milestone: 'Invoice issued',    ach: 'T‑7', wire: 'T‑3' },
  { milestone: 'Payment due',       ach: 'T‑5', wire: 'T‑2' },
  { milestone: 'Latest settlement', ach: 'T‑2', wire: 'T‑1' },
  { milestone: 'Payroll execution', ach: 'T‑0', wire: 'T‑0' },
]

export default function TimelineDiagram() {
  return (
    <div>
      <div style={{ marginTop: 12, marginBottom: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>Milestone</th>
              <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>ACH / Direct Debit</th>
              <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>Wire Transfer</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.milestone}>
                <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#111' }}>{row.milestone}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'ui-monospace, monospace' }}>{row.ach}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'ui-monospace, monospace' }}>{row.wire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>
        For wire transfers, warn the client at least 2 hours before the receiving bank's cutoff if the invoice is still unpaid at T‑1. For ACH, advance eligibility requires tier verification — settlement confirmation alone is not sufficient given the open return window.
      </p>
    </div>
  )
}
