const BADGE_CONFIG = {
  failed:     { label: 'Failed',         bg: 'bg-deel-red-bg',     text: 'text-deel-red',    border: 'border-deel-red-border',    dot: 'bg-deel-red' },
  on_hold:    { label: 'On Hold',        bg: 'bg-deel-yellow-bg',  text: 'text-deel-yellow', border: 'border-deel-yellow-border', dot: 'bg-deel-yellow' },
  in_transit: { label: 'In Transit',     bg: 'bg-deel-blue-bg',    text: 'text-deel-blue',   border: 'border-deel-blue-border',   dot: 'bg-deel-blue' },
  partial:    { label: 'Partially Paid', bg: 'bg-deel-yellow-bg',  text: 'text-deel-yellow', border: 'border-deel-yellow-border', dot: 'bg-deel-yellow' },
  paid:       { label: 'Workers Paid',   bg: 'bg-deel-green-bg',   text: 'text-deel-green',  border: 'border-deel-green-border',  dot: 'bg-deel-green' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = BADGE_CONFIG[status] || {}
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs'
  const px = size === 'lg' ? 'px-3 py-1.5' : 'px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border} ${textSize} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'in_transit' ? 'animate-pulse-dot' : ''}`} />
      {cfg.label}
    </span>
  )
}
