import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="placeholder">
      <p>That page doesn't exist.</p>
      <Link to="/" className="btn btn--scarlet">Back to home</Link>
    </div>
  )
}
