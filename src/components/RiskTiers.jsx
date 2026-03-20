const TIERS = [
  { tier: 'Tier 1 — New',        criteria: 'Under 3 months or first 3 payrolls', policy: 'No advance' },
  { tier: 'Tier 2 — Established',criteria: '3–12 months, clean payment history',  policy: 'Up to 1 day advance; in-transit funds only' },
  { tier: 'Tier 3 — Trusted',    criteria: '12+ months, no returns or failures',  policy: 'Up to 2 days advance; submitted funds' },
  { tier: 'Tier 4 — Enterprise', criteria: 'Contracted SLA',                       policy: 'Terms defined per contract' },
]

export default function RiskTiers() {
  return (
    <div style={{ marginTop: 10, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>Tier</th>
            <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>Criteria</th>
            <th style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111' }}>Advance policy</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map(row => (
            <tr key={row.tier}>
              <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#111', whiteSpace: 'nowrap' }}>{row.tier}</td>
              <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#374151' }}>{row.criteria}</td>
              <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#374151' }}>{row.policy}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>
        Tiers reviewed quarterly. Immediate downgrade on any failed payment or return.
      </p>
    </div>
  )
}
