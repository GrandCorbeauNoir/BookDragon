import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar.jsx'

export default function SiteLayout() {
  const { pathname, search } = useLocation()
  const mainRef = useRef(null)
  const lastLocation = useRef(pathname + search)

  // After in-app navigation, reset scroll and move focus to the new content.
  useEffect(() => {
    // Only act when the location actually changed (also safe under StrictMode's double effects).
    if (lastLocation.current === pathname + search) return
    lastLocation.current = pathname + search
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname, search])

  const skip = (e) => {
    e.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={skip}>Skip to main content</a>
      <NavBar />
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <Outlet />
      </main>
    </div>
  )
}
