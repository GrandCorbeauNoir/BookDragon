import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import Cover from './Cover.jsx'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BookCard({ book, index = 0, headingLevel = 3 }) {
  const navigate = useNavigate()
  const href = `/books/${book.id}`
  const Heading = `h${headingLevel}`

  // The cover glides into place on the book page. Browsers without View
  // Transitions, modified clicks and reduced-motion users get a plain navigation.
  const open = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!document.startViewTransition || reducedMotion()) return
    e.preventDefault()
    e.currentTarget.querySelector('.cover').style.viewTransitionName = 'book-cover'
    document.startViewTransition(() => {
      flushSync(() => navigate(href, { state: { book } }))
    })
  }

  return (
    <li className="card-item" style={{ '--i': index }}>
      <Link to={href} state={{ book }} className="card" onClick={open}>
        <Cover book={book} />
        <div className="card__body">
          <Heading className="card__title">{book.title}</Heading>
          <p className="card__author">{book.authors.join(', ')}</p>
          <p className="card__synopsis">{book.synopsis}</p>
        </div>
      </Link>
    </li>
  )
}
