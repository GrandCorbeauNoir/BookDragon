import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BookList from '../components/BookList.jsx'
import { GENRES, genreSlug } from '../data/genres.js'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

export default function Results() {
  const { genre: genreParam } = useParams()
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const fail = import.meta.env.DEV && params.get('fail') === '1'

  const genre = genreParam ? GENRES.find((g) => genreSlug(g) === genreParam) : null
  const source = useMemo(() => (genre ? { genre: genreSlug(genre) } : { query: q }), [genre, q])

  const heading = genre ?? (q ? `Results for “${q}”` : 'Search')
  useDocumentTitle(genreParam && !genre ? 'Genre not found' : heading)

  if (genreParam && !genre) {
    return (
      <div className="notice">
        <h1 className="notice__title">That genre doesn't exist</h1>
        <p>Pick one from the Genres menu: {GENRES.join(', ')}.</p>
      </div>
    )
  }

  if (!genre && !q) {
    return (
      <div className="notice">
        <h1 className="notice__title">Enter a book title</h1>
        <p>Type a title in the search bar to find a book.</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="list-heading list-heading--page">{heading}</h1>
      <BookList key={genre ?? q} source={source} fail={fail} headingLevel={2} />
    </>
  )
}
