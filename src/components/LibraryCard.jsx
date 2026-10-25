import { useState } from 'react'
import { Link } from 'react-router-dom'
import { statusLabel } from '../data/statuses.js'
import { useAppState } from '../state/AppStateContext.js'
import Cover from './Cover.jsx'
import RemoveBookButton from './RemoveBookButton.jsx'
import StatusSelect from './StatusSelect.jsx'

// The Library page loads books in one batch and passes each card its book.
// `missing` means the batch couldn't resolve it; `onRetry` retries just that id.
export default function LibraryCard({ book, entry, missing = false, onRetry }) {
  const { setStatus } = useAppState()
  const [statusError, setStatusError] = useState('')
  const status = book ? 'ready' : missing ? 'error' : 'loading'

  if (status === 'loading') {
    return (
      <li className="card-item" role="status" aria-label="Loading book">
        <div className="card card--skeleton" aria-hidden="true">
          <div className="cover cover--skeleton" />
          <div className="card__body">
            <span className="skeleton-line" style={{ width: '80%' }} />
            <span className="skeleton-line" style={{ width: '50%' }} />
          </div>
        </div>
      </li>
    )
  }

  if (status !== 'ready') {
    return (
      <li className="card-item">
        <div className="card">
          <div className="card__body">
            <span className="badge" data-status={entry.status}>{statusLabel(entry.status)}</span>
            <h2 className="card__title">
              We couldn't load this book
            </h2>
          </div>
          <div className="card__actions">
            <button type="button" className="btn btn--outline btn--small" onClick={onRetry}>
              Try again
            </button>
            <RemoveBookButton book={{ id: entry.bookId, title: 'this book' }} />
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="card-item">
      <div className="card">
        <Link to={`/books/${book.id}`} state={{ book }} className="card__link">
          <Cover book={book} />
          <div className="card__body">
            <span className="badge" data-status={entry.status}>{statusLabel(entry.status)}</span>
            <h2 className="card__title">{book.title}</h2>
            <p className="card__author">{book.authors.join(', ')}</p>
          </div>
        </Link>
        <div className="card__actions">
          <StatusSelect
            hideLabel
            label={`Reading status for ${book.title}`}
            value={entry.status}
            onChange={async (status) => {
              const result = await setStatus(book.id, status)
              setStatusError(result.ok ? '' : result.error)
            }}
          />
          <RemoveBookButton book={book} />
          {statusError && <p className="field__error" role="alert">{statusError}</p>}
        </div>
      </div>
    </li>
  )
}
