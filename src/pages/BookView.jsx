import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Cover from '../components/Cover.jsx'
import LibraryControls from '../components/LibraryControls.jsx'
import LogComposer from '../components/LogComposer.jsx'
import LogList from '../components/LogList.jsx'
import { fetchBook } from '../data/bookService.js'
import { GENRES, genreSlug } from '../data/genres.js'
import { useAppState } from '../state/AppStateContext.js'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

function BackLink() {
  const navigate = useNavigate()
  const { key } = useLocation()
  // "default" means this page was opened directly, so there is nothing to go back to.
  return key === 'default' ? (
    <Link to="/" className="back">← Back to home</Link>
  ) : (
    <button type="button" className="back" onClick={() => navigate(-1)}>← Back</button>
  )
}

function BookDetails({ id }) {
  const { user, logs, loadLogs } = useAppState()
  const { state: navState } = useLocation()
  // A card the user just clicked already carries its book, so the page opens ready.
  const preloaded = navState?.book?.id === id ? navState.book : null
  const [state, setState] = useState(
    preloaded ? { status: 'ready', book: preloaded } : { status: 'loading', book: null },
  )
  const [attempt, setAttempt] = useState(0)
  const skipFetch = useRef(Boolean(preloaded))
  const [logsStatus, setLogsStatus] = useState('loading') // loading | ready | error
  const [logsAttempt, setLogsAttempt] = useState(0)

  useDocumentTitle(
    state.book?.title ?? (state.status === 'missing' ? 'Book not found' : state.status === 'error' ? 'Error' : 'Loading book'),
  )

  useEffect(() => {
    if (skipFetch.current) {
      skipFetch.current = false
      return
    }
    let cancelled = false
    fetchBook(id).then(
      (book) => {
        if (!cancelled) setState({ status: book ? 'ready' : 'missing', book })
      },
      () => {
        if (!cancelled) setState({ status: 'error', book: null })
      },
    )
    return () => {
      cancelled = true
    }
  }, [id, attempt])

  useEffect(() => {
    let cancelled = false
    loadLogs(id).then(
      () => {
        if (!cancelled) setLogsStatus('ready')
      },
      () => {
        if (!cancelled) setLogsStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [id, loadLogs, logsAttempt])

  const { status, book } = state

  if (status === 'loading') {
    return (
      <div role="status" aria-label="Loading book" className="detail detail--skeleton">
        <div className="cover cover--skeleton detail__cover" />
        <div className="detail__main">
          <span className="skeleton-line skeleton-line--title" />
          <span className="skeleton-line" style={{ width: '40%' }} />
          <span className="skeleton-line" />
          <span className="skeleton-line" />
          <span className="skeleton-line" style={{ width: '70%' }} />
        </div>
        <span className="sr-only">Loading book…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="notice" role="alert">
        <h1 className="notice__title">We couldn't load this book</h1>
        <p>Check your connection and try again.</p>
        <button
          type="button"
          className="btn btn--scarlet"
          onClick={() => {
            setState({ status: 'loading', book: null })
            setAttempt((a) => a + 1)
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="notice">
        <h1 className="notice__title">We can't find that book</h1>
        <p>The link may be wrong, or the book may have been removed.</p>
        <Link to="/" className="btn btn--scarlet">Back to home</Link>
      </div>
    )
  }

  const genreName = GENRES.find((g) => genreSlug(g) === book.genre)
  const unknown = 'Not listed'
  const bookLogs = logs
    .filter((l) => l.bookId === book.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <article className="detail">
        <Cover book={book} className="detail__cover" />
        <div className="detail__main">
          <h1 className="detail__title">{book.title}</h1>
          <p className="detail__authors">by {book.authors.join(', ')}</p>
          <p className="detail__description">{book.synopsis}</p>
          <dl className="facts">
            <div className="facts__item">
              <dt>Pages</dt>
              <dd>{book.pageCount ? book.pageCount.toLocaleString('en-US') : unknown}</dd>
            </div>
            <div className="facts__item">
              <dt>First published</dt>
              <dd>{book.publishedYear ?? unknown}</dd>
            </div>
            <div className="facts__item">
              <dt>Genre</dt>
              <dd>
                {genreName ? <Link to={`/genres/${book.genre}`}>{genreName}</Link> : unknown}
              </dd>
            </div>
          </dl>
          {user ? (
            <LibraryControls book={book} />
          ) : (
            <p className="detail__prompt">
              <Link to="/signin" state={{ from: `/books/${book.id}` }}>Sign in</Link> to add this book to your library and write logs.
            </p>
          )}
        </div>
      </article>

      <section className="logs" aria-labelledby="logs-title">
        <h2 id="logs-title" className="logs__title">
          Reader logs {logsStatus === 'ready' && <span className="logs__count">{bookLogs.length}</span>}
        </h2>
        {logsStatus === 'loading' && (
          <p className="logs__note" role="status">Loading logs…</p>
        )}
        {logsStatus === 'error' && (
          <div className="notice" role="alert">
            <h3 className="notice__title">We couldn't load the logs</h3>
            <p>Check your connection and try again.</p>
            <button
              type="button"
              className="btn btn--scarlet"
              onClick={() => {
                setLogsStatus('loading')
                setLogsAttempt((a) => a + 1)
              }}
            >
              Try again
            </button>
          </div>
        )}
        {logsStatus === 'ready' && <LogList logs={bookLogs} />}
        <LogComposer book={book} />
      </section>
    </>
  )
}

export default function BookView() {
  const { id } = useParams()
  return (
    <>
      <BackLink />
      <BookDetails key={id} id={id} />
    </>
  )
}
