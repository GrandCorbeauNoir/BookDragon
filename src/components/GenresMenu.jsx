import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GENRES, genreSlug } from '../data/genres.js'

export default function GenresMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="genres" ref={rootRef}>
      <button
        ref={toggleRef}
        type="button"
        className="nav__link genres__toggle"
        aria-expanded={open}
        aria-controls="genres-list"
        onClick={() => setOpen((o) => !o)}
      >
        Genres
        <svg className="genres__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul id="genres-list" className="genres__list" data-open={open} hidden={!open}>
        {GENRES.map((g) => (
          <li key={g}>
            <Link to={`/genres/${genreSlug(g)}`} className="genres__item" onClick={() => setOpen(false)}>
              {g}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
