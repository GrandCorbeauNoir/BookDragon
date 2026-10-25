import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBooks, PAGE_SIZE } from '../data/bookService.js'
import BookCard from './BookCard.jsx'

const fmt = (n) => `${n} ${n === 1 ? 'book' : 'books'}`

// Load a list from `source` ({ genre } or { query }). Remount with a new `key` to reset.
export default function BookList({ source, fail = false, emptyMessage, headingLevel = 3 }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [hint, setHint] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextOffset, setNextOffset] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreFailed, setMoreFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchBooks({ ...source, offset: 0, fail }).then(
      (res) => {
        if (cancelled) return
        setItems(res.items)
        setTotal(res.total)
        setHint(res.hint)
        setHasMore(res.hasMore)
        setNextOffset(res.count)
        setStatus('ready')
      },
      () => {
        if (!cancelled) setStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [source, fail, attempt])

  const retry = () => {
    setStatus('loading')
    setAttempt((a) => a + 1)
  }

  const loadMore = async () => {
    setLoadingMore(true)
    setMoreFailed(false)
    try {
      const res = await fetchBooks({ ...source, offset: nextOffset, fail })
      setItems((prev) => {
        const seen = new Set(prev.map((b) => b.id))
        return [...prev, ...res.items.filter((b) => !seen.has(b.id))]
      })
      setTotal(res.total)
      setHasMore(res.hasMore)
      setNextOffset((n) => n + res.count)
    } catch {
      setMoreFailed(true)
    } finally {
      setLoadingMore(false)
    }
  }

  if (status === 'loading') {
    return (
      <div role="status" aria-label="Loading books">
        <ul className="grid" aria-hidden="true">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <li key={i} className="card-item">
              <div className="card card--skeleton">
                <div className="cover cover--skeleton" />
                <div className="card__body">
                  <span className="skeleton-line" style={{ width: '80%' }} />
                  <span className="skeleton-line" style={{ width: '50%' }} />
                  <span className="skeleton-line" />
                  <span className="skeleton-line" style={{ width: '90%' }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <span className="sr-only">Loading books…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="notice" role="alert">
        <h2 className="notice__title">We couldn't load the books</h2>
        <p>Check your connection and try again.</p>
        <button type="button" className="btn btn--scarlet" onClick={retry}>Try again</button>
      </div>
    )
  }

  if (items.length === 0) {
    return hint === 'title-only' ? (
      <div className="notice">
        <h2 className="notice__title">Search by book title</h2>
        <p>
          That doesn't look like a book title. BookDragon searches by title only, so authors,
          ISBNs and keywords won't find anything. Enter the title of the book you're after,
          or browse by genre.
        </p>
      </div>
    ) : (
      <div className="notice">
        <h2 className="notice__title">No books found</h2>
        <p>{emptyMessage ?? "Check the spelling or try another title."}</p>
        <Link to="/" className="btn btn--scarlet">Back to home</Link>
      </div>
    )
  }

  return (
    <>
      <p className="list-count" aria-live="polite">
        Showing {items.length} of {fmt(Math.max(total, items.length))}
      </p>
      <ul className="grid grid--animate">
        {items.map((book, i) => (
          <BookCard key={book.id} book={book} index={i % PAGE_SIZE} headingLevel={headingLevel} />
        ))}
      </ul>
      {(hasMore || moreFailed) && (
        <div className="load-more">
          {moreFailed && (
            <p className="load-more__error" role="alert">
              More books couldn't be loaded.
            </p>
          )}
          <button type="button" className="btn btn--scarlet" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : moreFailed ? 'Try again' : 'Load More'}
          </button>
        </div>
      )}
    </>
  )
}
