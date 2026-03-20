const RAILS = [
  {
    label: 'ACH / Direct Debit',
    color: 'bg-deel-blue',
    text: 'text-deel-blue',
    light: 'bg-blue-50',
    events: [
      { t: 'T‑7', label: 'Invoice issued',      sub: 'Client receives invoice' },
      { t: 'T‑5', label: 'Payment due',          sub: 'Client must act by here' },
      { t: 'T‑2', label: 'Latest settlement',    sub: 'Funds must clear platform' },
      { t: 'T‑0', label: 'Payroll date',         sub: 'Workers paid', highlight: true },
    ],
  },
  {
    label: 'Wire Transfer',
    color: 'bg-deel-purple',
    text: 'text-deel-purple',
    light: 'bg-deel-purple-dim',
    events: [
      { t: 'T‑3', label: 'Invoice issued',       sub: 'Client receives invoice' },
      { t: 'T‑2', label: 'Payment due',           sub: 'Client must act by here' },
      { t: 'T‑1', label: 'Latest settlement',     sub: 'Funds must clear platform' },
      { t: 'T‑0', label: 'Payroll date',          sub: 'Workers paid', highlight: true },
    ],
  },
]

export default function TimelineDiagram() {
  return (
    <div className="space-y-8">
      {RAILS.map(rail => (
        <div key={rail.label}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${rail.text}`}>{rail.label}</p>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-8 right-8 h-px bg-gray-200 z-0" />

            <div className="relative z-10 grid grid-cols-4 gap-2">
              {rail.events.map((ev, i) => (
                <div key={ev.t} className="flex flex-col items-center text-center">
                  {/* Dot */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-3
                    ${ev.highlight
                      ? `${rail.color} text-white shadow-md`
                      : `${rail.light} ${rail.text} border-2 border-current`
                    }
                  `}>
                    {ev.t}
                  </div>
                  <p className="text-xs font-semibold text-deel-text leading-tight mb-1">{ev.label}</p>
                  <p className="text-[11px] text-deel-muted leading-tight">{ev.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning note */}
          {rail.label.includes('Wire') && (
            <p className="text-xs text-deel-muted mt-4 flex gap-2">
              <span className="text-deel-purple shrink-0">→</span>
              Warn client at least 2 hours before receiving bank cutoff if invoice is still unpaid at T‑1.
            </p>
          )}
          {rail.label.includes('ACH') && (
            <p className="text-xs text-deel-muted mt-4 flex gap-2">
              <span className="text-deel-blue shrink-0">→</span>
              ACH settled ≠ final. Return window stays open post-settlement. Advance eligibility uses tier logic, not just settlement confirmation.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
