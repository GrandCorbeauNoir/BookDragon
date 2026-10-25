import { useState } from 'react'

const HUES = {
  adventure: 30,
  technology: 215,
  horror: 350,
  'sci-fi': 270,
  fiction: 135,
  'non-fiction': 175,
}

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

// The book's real cover; falls back to a typographic jacket tinted by genre when
// Google has no image or it fails to load.
export default function Cover({ book, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (book.cover && !failed) {
    return (
      <img
        className={`cover cover--image ${className}`}
        src={book.cover}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    )
  }
  const h = (HUES[book.genre] ?? 200) + (hash(book.id) % 70) - 35
  return (
    <div
      className={`cover ${className}`}
      style={{ '--c1': `hsl(${h} 45% 30%)`, '--c2': `hsl(${h + 20} 50% 12%)` }}
      aria-hidden="true"
    >
      <span className="cover__title">{book.title}</span>
      <span className="cover__author">{book.authors[0]}</span>
    </div>
  )
}
