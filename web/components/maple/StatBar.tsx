export default function StatBar({
  kind = 'hp',
  label,
  value,
  max,
  displayValue,
}: {
  kind?: 'hp' | 'mp' | 'exp'
  label?: string
  value: number
  max: number
  displayValue?: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`ms-stat-bar ms-stat-${kind}`}>
      <div className="ms-stat-label">{label ?? kind.toUpperCase()}</div>
      <div className="ms-stat-track">
        <div className="ms-stat-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ms-stat-value">{displayValue ?? `${value} / ${max}`}</div>
    </div>
  )
}
