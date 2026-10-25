import { useState } from 'react'
import { useAppState } from '../state/AppStateContext.js'
import RemoveBookButton from './RemoveBookButton.jsx'
import StatusSelect from './StatusSelect.jsx'

// Add / status / remove controls for a signed-in user on the book page.
export default function LibraryControls({ book }) {
  const { entryFor, addToLibrary, setStatus, libraryStatus, reloadLibrary } = useAppState()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const entry = entryFor(book.id)

  if (libraryStatus === 'loading' || libraryStatus === 'idle') {
    return (
      <div className="library-controls">
        <p className="library-controls__msg" role="status">Loading your library…</p>
      </div>
    )
  }

  if (libraryStatus === 'error') {
    return (
      <div className="library-controls">
        <p className="library-controls__msg" role="alert">We couldn't load your library.</p>
        <button type="button" className="btn btn--outline btn--small" onClick={reloadLibrary}>Try again</button>
      </div>
    )
  }

  return (
    <div className="library-controls">
      {entry ? (
        <>
          <StatusSelect
            value={entry.status}
            onChange={async (status) => {
              const result = await setStatus(book.id, status)
              setMessage(result.ok ? 'Status updated.' : result.error)
            }}
          />
          <RemoveBookButton book={book} onRemoved={() => setMessage('Removed from your library.')} />
        </>
      ) : (
        <button
          type="button"
          className="btn btn--scarlet"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            const result = await addToLibrary(book.id)
            setBusy(false)
            setMessage(result.ok ? 'Added to your library.' : result.error)
          }}
        >
          Add to my library
        </button>
      )}
      <p className="library-controls__msg" aria-live="polite">{message}</p>
    </div>
  )
}
