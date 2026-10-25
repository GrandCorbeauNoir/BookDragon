import { useId } from 'react'
import { STATUSES } from '../data/statuses.js'

export default function StatusSelect({ value, onChange, label = 'Reading status', hideLabel = false }) {
  const id = useId()
  return (
    <div className="status-select">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'status-select__label'}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
