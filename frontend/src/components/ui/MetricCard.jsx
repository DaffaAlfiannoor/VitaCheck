export default function MetricCard({ icon, value, label, badge, barWidth, barColor }) {
  const badgeColors = {
    Baik: 'bg-green-50 text-green-700',
    Kurang: 'bg-amber-50 text-amber-700',
    Tinggi: 'bg-red-50 text-red-700',
    Aktif: 'bg-green-50 text-green-700',
    Sedang: 'bg-amber-50 text-amber-700',
    Rendah: 'bg-green-50 text-green-700',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: 'rgba(79,94,255,0.1)' }}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[badge] ?? 'bg-slate-100 text-slate-600'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      {barWidth != null && (
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor ?? 'bg-indigo-500'}`} style={{ width: `${barWidth}%` }} />
        </div>
      )}
    </div>
  )
}
