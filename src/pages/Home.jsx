import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Welcome from '../components/Welcome.jsx'
import BookList from '../components/BookList.jsx'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

export default function Home() {
  useDocumentTitle(null)
  const [params] = useSearchParams()
  const source = useMemo(() => ({ genre: 'technology' }), [])
  // Dev-only: /?fail=1 forces the error state.
  const fail = import.meta.env.DEV && params.get('fail') === '1'

  return (
    <>
      <Welcome />
      <h2 className="list-heading">Technology</h2>
      <BookList source={source} fail={fail} />
    </>
  )
}
