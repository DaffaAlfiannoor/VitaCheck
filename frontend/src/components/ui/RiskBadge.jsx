const colors = {
  'Risiko Rendah': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  'Risiko Sedang': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Risiko Tinggi': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function RiskBadge({ label }) {
  const c = colors[label] || colors['Risiko Sedang']
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  )
}
