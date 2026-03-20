const TIERS = [
  {
    tier: 'Tier 1',
    label: 'New',
    criteria: 'Under 3 months or first 3 payrolls',
    policy: 'No advance',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  {
    tier: 'Tier 2',
    label: 'Established',
    criteria: '3–12 months, clean history',
    policy: 'Up to 1 day, in-transit funds only',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    tier: 'Tier 3',
    label: 'Trusted',
    criteria: '12+ months, no returns',
    policy: 'Up to 2 days, submitted funds',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    tier: 'Tier 4',
    label: 'Enterprise',
    criteria: 'Contracted SLA',
    policy: 'Terms per contract',
    color: 'bg-deel-purple-dim border-deel-purple/20',
    badge: 'bg-deel-purple-dim text-deel-purple',
  },
]

export default function RiskTiers() {
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        {TIERS.map(t => (
          <div key={t.tier} className={`p-4 rounded-xl border ${t.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badge}`}>{t.tier}</span>
            </div>
            <p className="text-sm font-semibold mb-1">{t.label}</p>
            <p className="text-xs text-deel-muted mb-3 leading-relaxed">{t.criteria}</p>
            <p className="text-xs font-medium text-deel-text">{t.policy}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-deel-muted">
        Tiers reviewed quarterly. Immediate downgrade on failed payment or return.
      </p>
    </div>
  )
}
