const barColors = {
  high: 'bg-red-500',
  mid: 'bg-amber-500',
  low: 'bg-green-500',
}

export default function FactorBar({ name, pct, color = 'mid' }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="text-sm w-36 shrink-0 text-slate-700">{name}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColors[color] ?? barColors.mid}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}
