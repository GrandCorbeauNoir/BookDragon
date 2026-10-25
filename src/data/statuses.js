export const STATUSES = [
  { value: 'want to read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label ?? value
