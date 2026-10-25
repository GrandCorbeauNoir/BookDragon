import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LibraryCard from '../components/LibraryCard.jsx'
import { fetchBooksByIds, PAGE_SIZE } from '../data/bookService.js'
import { STATUSES } from '../data/statuses.js'
import { useAppState } from '../state/AppStateContext.js'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

export default function Library() {
  useDocumentTitle('My Library')
  const { myLibrary, libraryStatus, reloadLibrary } = useAppState()
  const [filter, setFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [books, setBooks] = useState({}) // bookId -> book
  const [missing, setMissing] = useState(() => new Set()) // ids the API couldn't resolve
  const [booksFailed, setBooksFailed] = useState(false) // a whole call failed
  const [requested, setRequested] = useState(() => new Set()) // ids already sent to the API

  const entries = [...myLibrary]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .map((entry) => ({ entry }))
  const shown = entries.filter((x) => filter === 'all' || x.entry.status === filter)
  const count = (status) => entries.filter((x) => x.entry.status === status).length

  const visibleIds = shown.slice(0, visible).map((x) => x.entry.bookId)
  const pendingKey = visibleIds
    .filter((id) => !books[id] && !missing.has(id) && !requested.has(id))
    .join(',')

  // One call per page of cards: fetch every visible book we don't have yet.
  useEffect(() => {
    if (!pendingKey || booksFailed) return
    const ids = pendingKey.split(',')
    // Mark as requested right after this effect so a re-render doesn't refetch them.
    queueMicrotask(() => setRequested((prev) => new Set([...prev, ...ids])))
    fetchBooksByIds(ids).then(
      (res) => {
        setBooks((prev) => ({ ...prev, ...Object.fromEntries(res.books.map((b) => [b.id, b])) }))
        const got = new Set(res.books.map((b) => b.id))
        const gone = ids.filter((id) => !got.has(id))
        if (gone.length) setMissing((prev) => new Set([...prev, ...gone]))
      },
      () => {
        setRequested(new Set())
        setBooksFailed(true)
      },
    )
  }, [pendingKey, booksFailed])

  // Retry only the ids that came back missing.
  const retryMissing = useCallback((id) => {
    const without = (prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    }
    setMissing(without)
    setRequested(without)
  }, [])

  const pick = (value) => {
    setFilter(value)
    setVisible(PAGE_SIZE)
  }

  if (libraryStatus === 'loading' || libraryStatus === 'idle' || libraryStatus === 'error' || booksFailed) {
    return (
      <>
        <h1 className="list-heading list-heading--page">My Library</h1>
        {libraryStatus === 'error' || booksFailed ? (
          <div className="notice" role="alert">
            <h2 className="notice__title">We couldn't load your library</h2>
            <p>Check your connection and try again.</p>
            <button type="button" className="btn btn--scarlet" onClick={() => (booksFailed ? setBooksFailed(false) : reloadLibrary())}>Try again</button>
          </div>
        ) : (
          <div role="status" aria-label="Loading your library">
            <ul className="grid" aria-hidden="true">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <li key={i} className="card-item">
                  <div className="card card--skeleton">
                    <div className="cover cover--skeleton" />
                    <div className="card__body">
                      <span className="skeleton-line" style={{ width: '80%' }} />
                      <span className="skeleton-line" style={{ width: '50%' }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <span className="sr-only">Loading your library…</span>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <h1 className="list-heading list-heading--page">My Library</h1>

      {entries.length === 0 ? (
        <div className="notice">
          <h2 className="notice__title">Your library is empty</h2>
          <p>Add a book from its page and it will show up here, along with your reading status.</p>
          <Link to="/" className="btn btn--scarlet">Browse books</Link>
        </div>
      ) : (
        <>
          <div className="chips" role="group" aria-label="Filter by reading status">
            {[{ value: 'all', label: 'All', n: entries.length }, ...STATUSES.map((s) => ({ ...s, n: count(s.value) }))].map((c) => (
              <button
                key={c.value}
                type="button"
                className="chip"
                aria-pressed={filter === c.value}
                onClick={() => pick(c.value)}
              >
                {c.label} <span className="chip__count">{c.n}</span>
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="notice">
              <h2 className="notice__title">Nothing here yet</h2>
              <p>No books are marked with this status. Change a book's status from its card to see it here.</p>
            </div>
          ) : (
            <>
              <p className="list-count" aria-live="polite">
                Showing {Math.min(visible, shown.length)} of {shown.length} {shown.length === 1 ? 'book' : 'books'}
              </p>
              <ul className="grid">
                {shown.slice(0, visible).map(({ entry }) => (
                  <LibraryCard
                    key={entry.bookId}
                    entry={entry}
                    book={books[entry.bookId] ?? null}
                    missing={missing.has(entry.bookId)}
                    onRetry={() => retryMissing(entry.bookId)}
                  />
                ))}
              </ul>
              {visible < shown.length && (
                <div className="load-more">
                  <button type="button" className="btn btn--scarlet" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
