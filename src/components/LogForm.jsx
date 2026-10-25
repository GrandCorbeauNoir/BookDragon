import { useId, useState } from 'react'

const MAX = 2000

function RatingInput({ value, onChange }) {
  const name = useId()
  return (
    <fieldset className="rating-input">
      <legend className="field__label">Rating (optional)</legend>
      <div className="rating-input__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="rating-input__star">
            <input
              type="radio"
              id={`${name}-${n}`}
              name={name}
              className="sr-only"
              checked={value === n}
              onChange={() => onChange(n)}
            />
            <label htmlFor={`${name}-${n}`} data-on={value != null && n <= value}>
              <span aria-hidden="true">★</span>
              <span className="sr-only">{n} {n === 1 ? 'star' : 'stars'}</span>
            </label>
          </span>
        ))}
        {value != null && (
          <button type="button" className="link-button" onClick={() => onChange(null)}>Clear rating</button>
        )}
      </div>
    </fieldset>
  )
}

// `onSubmit({ body, rating })` resolves to { ok, error }.
export default function LogForm({ initial, submitLabel, onSubmit, onCancel }) {
  const id = useId()
  const [body, setBody] = useState(initial?.body ?? '')
  const [rating, setRating] = useState(initial?.rating ?? null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const result = await onSubmit({ body, rating })
    setBusy(false)
    if (!result.ok) return setError(result.error)
    setError('')
    if (!initial) {
      setBody('')
      setRating(null)
    }
  }

  return (
    <form className="log-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={id} className="field__label">Your log</label>
        <textarea
          id={id}
          className="field__input field__input--area"
          rows={4}
          autoFocus={Boolean(initial)}
          maxLength={MAX}
          value={body}
          placeholder="What did you think of it?"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            setBody(e.target.value)
            setError('')
          }}
        />
        {error && <p id={`${id}-error`} className="field__error">{error}</p>}
      </div>
      <RatingInput value={rating} onChange={setRating} />
      <div className="log-form__actions">
        <button type="submit" className="btn btn--scarlet" disabled={busy}>{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn--outline" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}
