import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../state/AppStateContext.js'
import { focusMain } from '../utils/focus.js'

// Removing a book also deletes the user's logs for it, so ask first.
export default function RemoveBookButton({ book, onRemoved }) {
  const { user, logs, removeFromLibrary, loadLogs } = useAppState()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const triggerRef = useRef(null)
  const restoreFocus = useRef(false)

  // After "Keep it", put focus back on the button that opened the confirmation.
  useEffect(() => {
    if (!confirming && restoreFocus.current) {
      restoreFocus.current = false
      triggerRef.current?.focus()
    }
  }, [confirming])
  // Make sure this user's logs for the book are loaded so the warning is accurate.
  useEffect(() => {
    if (confirming) loadLogs(book.id).catch(() => {})
  }, [confirming, book.id, loadLogs])
  const logCount = logs.filter((l) => l.authorId === user?.id && l.bookId === book.id).length

  if (!confirming) {
    return (
      <button ref={triggerRef} type="button" className="btn btn--outline btn--small" onClick={() => setConfirming(true)}>
        Remove from library
      </button>
    )
  }

  return (
    <div className="confirm" role="alertdialog" aria-label={`Remove ${book.title} from your library`}>
      <p className="confirm__text">
        {logCount > 0
          ? `Remove this book? Your ${logCount === 1 ? 'log' : `${logCount} logs`} for it will be deleted too.`
          : 'Remove this book from your library?'}
      </p>
      {error && <p className="field__error" role="alert">{error}</p>}
      <div className="confirm__actions">
        <button
          type="button"
          className="btn btn--danger btn--small"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            const result = await removeFromLibrary(book.id)
            if (!result.ok) {
              setBusy(false)
              return setError(result.error)
            }
            focusMain()
            onRemoved?.()
          }}
        >
          {logCount > 0 ? 'Remove book and logs' : 'Remove book'}
        </button>
        <button type="button" className="btn btn--outline btn--small" onClick={() => {
            restoreFocus.current = true
            setConfirming(false)
          }}
          autoFocus
        >
          Keep it
        </button>
      </div>
    </div>
  )
}
