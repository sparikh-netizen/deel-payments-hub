const TRACKS = [
  {
    label: 'Invoice',
    color: 'text-deel-purple',
    bg: 'bg-deel-purple-dim',
    border: 'border-deel-purple/30',
    nodes: ['Draft', 'Issued', 'Payment Initiated', 'Partially Paid', 'Paid', 'Overdue'],
    main: [0, 1, 2, 4],
    branch: { from: 2, to: 3 },
    fail:   { from: 2, to: 5 },
  },
  {
    label: 'Payment Instruction',
    color: 'text-deel-blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    nodes: ['Pending', 'Submitted', 'In Transit', 'Settled', 'Failed', 'Returned'],
    main: [0, 1, 2, 3],
    fail: { from: 2, to: 4 },
    ret:  { from: 3, to: 5 },
    internal: [3],
  },
  {
    label: 'Funding / Settlement',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    nodes: ['Awaiting Funds', 'Partially Settled', 'Fully Settled — Reversible', 'Fully Settled — Final', 'Settlement at Risk', 'Failed Settlement'],
    main: [0, 2, 3],
    branch: { from: 0, to: 1 },
    fail:   { from: 0, to: 4 },
    fail2:  { from: 4, to: 5 },
    internal: [0, 1, 2, 3, 4, 5],
  },
  {
    label: 'Worker Payout',
    color: 'text-deel-green',
    bg: 'bg-green-50',
    border: 'border-green-200',
    nodes: ['Scheduled', 'Processing', 'Paid', 'On Hold', 'Failed', 'Partially Paid'],
    main: [0, 1, 2],
    branch: { from: 0, to: 3 },
    fail:   { from: 1, to: 4 },
    fail2:  { from: 1, to: 5 },
  },
]

function Node({ label, internal, accent }) {
  return (
    <div className={`
      relative px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap
      ${internal
        ? 'bg-gray-100 border-gray-200 text-gray-400 italic'
        : accent
          ? `${accent.bg} ${accent.border} ${accent.color} border`
          : 'bg-white border-gray-200 text-deel-text'
      }
    `}>
      {label}
      {internal && (
        <span className="ml-1.5 text-[9px] font-normal not-italic text-gray-400">internal</span>
      )}
    </div>
  )
}

function Arrow({ label, color = 'text-gray-300' }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${color}`}>
      <div className="w-px h-3 bg-current" />
      <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor">
        <path d="M4 6L0 0h8z"/>
      </svg>
      {label && <span className="text-[9px] text-gray-400 -mt-0.5">{label}</span>}
    </div>
  )
}

export default function StateFlowDiagram() {
  return (
    <div className="space-y-6">
      {TRACKS.map(track => (
        <div key={track.label}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${track.color}`}>
              {track.label}
            </span>
            {track.internal?.length === track.nodes.length && (
              <span className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">internal only</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
            {track.nodes.map((node, i) => {
              const isInternal = track.internal?.includes(i)
              const accent = isInternal ? null : { bg: track.bg, border: track.border, color: track.color }
              const isInMain = track.main.includes(i)
              const mainIdx  = track.main.indexOf(i)
              const isLast   = mainIdx === track.main.length - 1

              if (!isInMain) {
                // Branch / failure nodes rendered inline only if they appear here
                return null
              }

              return (
                <div key={node} className="flex items-center gap-1.5">
                  <Node
                    label={node}
                    internal={isInternal}
                    accent={isInternal ? null : accent}
                  />
                  {!isLast && (
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-gray-300">
                      <path d="M1 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              )
            })}

            {/* Show side nodes */}
            {[track.branch, track.fail, track.fail2, track.ret].filter(Boolean).map((b, bi) => {
              const fromNode = track.nodes[b.from]
              const toNode   = track.nodes[b.to]
              const isFailure = b === track.fail || b === track.fail2 || b === track.ret
              return (
                <div key={bi} className="flex items-center gap-1.5 text-[10px] text-gray-400 w-full mt-1 ml-2">
                  <span className="font-mono">↳</span>
                  <span className="text-gray-400">from</span>
                  <span className="font-medium text-gray-500">{fromNode}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-gray-300">
                    <path d="M1 4h10M7 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`font-medium ${isFailure ? 'text-deel-red' : 'text-yellow-600'}`}>{toNode}</span>
                  {isFailure && <span className="text-gray-300">(failure path)</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 mb-2">Cascade rule</p>
        <p className="text-xs text-deel-muted leading-relaxed">
          If the funding track reverts (e.g. ACH return after settlement), it cascades downstream:
          invoice is flagged → payout is blocked or clawed back → client is notified.
          Payment instruction states are informational only — they do not trigger payout or invoice changes directly.
        </p>
      </div>
    </div>
  )
}
