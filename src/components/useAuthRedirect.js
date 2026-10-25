import { useLocation } from 'react-router-dom'

// Where to send a signed-in user who lands on (or just finished) an auth page.
export function useAuthRedirect() {
  const { state } = useLocation()
  return typeof state?.from === 'string' && state.from.startsWith('/') ? state.from : '/'
}
