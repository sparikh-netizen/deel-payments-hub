const TRACKS = [
  {
    title: '2.1  Invoice status',
    rows: [
      ['Draft',              'No',  'Generating internally prior to issuance'],
      ['Issued',             'Yes', 'Sent to client; no payment received yet'],
      ['Payment Initiated',  'Yes', 'Client has acted. Signals intent, not money movement.'],
      ['Partially Paid',     'Yes', 'Funds received but below invoice total'],
      ['Paid',               'Yes', 'Full funds settled and confirmed'],
      ['Overdue',            'Yes', 'Due date passed with no funds received'],
      ['Cancelled',          'Yes', 'Invoice voided'],
    ],
  },
  {
    title: '2.2  Payment instruction status',
    rows: [
      ['Pending',    'Yes', 'Instruction received; not yet submitted to bank network'],
      ['Submitted',  'Yes', 'Sent to bank network'],
      ['In Transit', 'Yes', 'Bank confirmed; funds moving'],
      ['Settled',    'No',  'Funds received in platform account (internal only)'],
      ['Failed',     'Yes', 'Bank rejected the instruction'],
      ['Returned',   'Yes', 'Funds received then reversed'],
    ],
  },
  {
    title: '2.3  Funding / settlement status (internal only)',
    rows: [
      ['Awaiting Funds',                'No', 'No cleared funds received yet'],
      ['Partially Settled',             'No', 'Some funds received; below invoice total'],
      ['Fully Settled — Reversible',    'No', 'ACH received; return window still open'],
      ['Fully Settled — Final',         'No', 'Wire received, or ACH return window closed'],
      ['Settlement at Risk',            'No', 'Funds overdue within settlement window'],
      ['Failed Settlement',             'No', 'Funds not received; payroll date at risk'],
    ],
    note: 'ACH settled and wire settled are not equivalent. A wire is final on receipt. ACH can reverse days after settlement. Advance eligibility must reflect this distinction.',
  },
  {
    title: '2.4  Worker payout status',
    rows: [
      ['Scheduled',      'Yes', 'Funds secured; payout date confirmed'],
      ['Processing',     'Yes', 'Instructions sent to payment rails'],
      ['Paid',           'Yes', 'Workers have received funds'],
      ['On Hold',        'Yes', 'Funds not yet cleared; payout paused'],
      ['Failed',         'Yes', 'Payout failed for one or more workers'],
      ['Partially Paid', 'Yes', 'Some workers paid; others held or failed'],
    ],
  },
]

const TRANSITIONS = `INVOICE:   Draft → Issued → Payment Initiated → Paid
                                             → Overdue
                        Payment Initiated → Issued (reverted on failure)
                                         → Partially Paid

PAYMENT:   Pending → Submitted → In Transit → Settled (internal)
                                            → Failed
                                            → Returned

FUNDING:   Awaiting Funds → Fully Settled — Reversible (ACH, window open)
                                          → Fully Settled — Final (wire or window closed)
                          → Partially Settled
                          → Settlement at Risk → Failed Settlement

PAYOUT:    Scheduled → Processing → Paid
                     → On Hold → Processing (once funds clear)
                     → Failed → Partially Paid`

function Table({ headers, rows }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: 10, marginBottom: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: j === 0 ? '#111' : '#374151', verticalAlign: 'top' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function StateFlowDiagram() {
  return (
    <div>
      {TRACKS.map(track => (
        <div key={track.title} style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {track.title}
          </h3>
          <Table headers={['State', 'Client-facing', 'Description']} rows={track.rows} />
          {track.note && (
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>{track.note}</p>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          2.5 (Appendix)  State transition map
        </h3>
        <pre style={{
          fontSize: 12,
          lineHeight: 1.7,
          color: '#374151',
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 4,
          padding: '14px 16px',
          overflowX: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          margin: 0,
        }}>
          {TRANSITIONS}
        </pre>
      </div>
    </div>
  )
}
