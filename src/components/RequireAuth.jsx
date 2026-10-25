import { Navigate, useLocation } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext.js'

// Signed-out visitors are sent to Sign In and returned here afterwards.
// While a stored session is being restored (e.g. after a refresh), wait instead of redirecting.
export default function RequireAuth({ children }) {
  const { user, authStatus } = useAppState()
  const location = useLocation()
  if (authStatus === 'loading') {
    return (
      <div className="notice" role="status">
        <p>Checking your sign-in…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />
  return children
}
