import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext.js'
import LogForm from './LogForm.jsx'

// Who may write a log here: only a signed-in user who has the book in their library.
export default function LogComposer({ book }) {
  const { user, entryFor, addLog, libraryStatus, reloadLibrary } = useAppState()

  if (!user) {
    return (
      <p className="logs__note">
        <Link to="/signin" state={{ from: `/books/${book.id}` }}>Sign in</Link> to write a log.
      </p>
    )
  }

  if (libraryStatus === 'loading' || libraryStatus === 'idle') return null

  if (libraryStatus === 'error') {
    return (
      <p className="logs__note">
        We couldn't load your library.{' '}
        <button type="button" className="link-button" onClick={reloadLibrary}>Try again</button>
      </p>
    )
  }

  if (!entryFor(book.id)) {
    return <p className="logs__note">Add this book to your library to write a log.</p>
  }

  return (
    <div className="composer">
      <h3 className="composer__title">Write a log</h3>
      <LogForm submitLabel="Post log" onSubmit={(values) => addLog({ bookId: book.id, ...values })} />
    </div>
  )
}
