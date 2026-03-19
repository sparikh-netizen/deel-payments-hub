import InvoiceCard from '../components/InvoiceCard'

const GROUPS = [
  {
    key: 'action',
    label: 'Action Required',
    borderColor: 'border-deel-red',
    textColor: 'text-deel-red',
    badgeBg: 'bg-deel-red',
  },
  {
    key: 'progress',
    label: 'In Progress',
    borderColor: 'border-deel-blue',
    textColor: 'text-deel-blue',
    badgeBg: 'bg-deel-blue',
  },
  {
    key: 'completed',
    label: 'Completed',
    borderColor: 'border-deel-green',
    textColor: 'text-deel-green',
    badgeBg: 'bg-deel-green',
  },
]

export default function PaymentsHub({ invoices, onSelect }) {
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: invoices.filter((inv) => inv.group === g.key),
  }))

  const scrollToSection = (key) => {
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-deel-text tracking-tight">Payments Hub</h1>
          <p className="text-sm text-deel-muted mt-0.5">Manage payroll funding and payment status</p>
        </div>
        <button className="bg-deel-purple hover:bg-deel-purple-light transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
          + New Payment
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {grouped.map((g) => (
          <div key={g.key} onClick={() => scrollToSection(g.key)} className={`bg-white rounded-xl shadow-card hover:shadow-card-hover cursor-pointer px-4 py-3.5 border-t-2 transition-shadow ${g.borderColor}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${g.textColor}`}>{g.label}</p>
            <p className="text-2xl font-bold text-deel-text mt-1">{g.items.length}</p>
            <p className="text-xs text-deel-muted mt-0.5">invoice{g.items.length !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Invoice groups */}
      <div className="space-y-7">
        {grouped.map((g) => (
          <div key={g.key} id={`section-${g.key}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${g.textColor}`}>{g.label}</h2>
              {g.key === 'action' && g.items.length > 0 && (
                <span className={`${g.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  {g.items.length}
                </span>
              )}
              <div className="flex-1 h-px bg-deel-border" />
            </div>
            {g.items.length === 0 ? (
              <p className="text-sm text-deel-muted italic">No invoices</p>
            ) : (
              <div className="space-y-3">
                {g.items.map((inv) => (
                  <InvoiceCard key={inv.id} invoice={inv} onClick={onSelect} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
