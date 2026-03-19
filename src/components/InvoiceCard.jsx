import StatusBadge from './StatusBadge'

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)

const LEFT_BORDER = {
  action:    'border-l-4 border-l-deel-red',
  progress:  'border-l-4 border-l-deel-blue',
  completed: 'border-l-4 border-l-deel-green',
}

export default function InvoiceCard({ invoice, onClick }) {
  return (
    <button
      onClick={() => onClick(invoice)}
      className={`w-full text-left bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 ${LEFT_BORDER[invoice.group]} overflow-hidden`}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        {/* Left: names */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-deel-muted uppercase tracking-wide mb-0.5">{invoice.company}</p>
          <p className="text-[15px] font-semibold text-deel-text truncate">{invoice.payrollName}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-deel-muted">
            <span>Due <span className="text-deel-text font-medium">{invoice.dueDate}</span></span>
            <span>Workers paid by <span className="text-deel-text font-medium">{invoice.workersPaidBy}</span></span>
          </div>
        </div>

        {/* Right: amount + badge */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-[17px] font-bold text-deel-text">{fmt(invoice.amount)}</p>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {/* Partial progress bar */}
      {invoice.status === 'partial' && (
        <div className="px-5 pb-4">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-deel-yellow rounded-full transition-all"
              style={{ width: `${(invoice.amountReceived / invoice.amount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-deel-muted mt-1">{fmt(invoice.amountReceived)} received of {fmt(invoice.amount)}</p>
        </div>
      )}
    </button>
  )
}
