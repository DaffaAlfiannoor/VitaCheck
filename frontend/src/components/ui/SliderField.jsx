export default function SliderField({ label, value, onChange, min, max, step, unit, minLabel, maxLabel }) {
  const display = unit ? `${value} ${unit}` : value
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <span className="text-xs font-mono font-semibold text-indigo-600">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500 range-thumb"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  )
}
