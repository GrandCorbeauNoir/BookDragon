import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext.js'
import Brand from './Brand.jsx'
import GenresMenu from './GenresMenu.jsx'
import SearchIcon from './SearchIcon.jsx'

export default function NavBar() {
  const { user, authStatus, signOut } = useAppState()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const signOutAfterNav = useRef(false)

  // Leave the page first, then clear the session, so a protected page
  // (like My Library) can't redirect to Sign In on the way out.
  useEffect(() => {
    if (signOutAfterNav.current && pathname === '/') {
      signOutAfterNav.current = false
      signOut()
    }
  }, [pathname, signOut])

  const onSignOut = () => {
    if (pathname === '/') return signOut()
    signOutAfterNav.current = true
    navigate('/')
  }

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="topbar">
      <Brand />
      <nav className="nav" aria-label="Main">
        <NavLink to="/" end className="nav__link">Home</NavLink>
        {user && <NavLink to="/library" className="nav__link">My Library</NavLink>}
        <GenresMenu />
        <form className="search" role="search" onSubmit={onSearch}>
          <label htmlFor="nav-search" className="sr-only">Search by book title</label>
          <input
            id="nav-search"
            type="search"
            className="search__input"
            placeholder="Search by title"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="search__btn" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
      </nav>
      <div className="account">
        {authStatus === 'loading' ? null : user ? (
          <>
            <span className="account__name">{user.displayName}</span>
            <button type="button" className="btn btn--scarlet" onClick={onSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="account__link">Sign Up</Link>
            <Link to="/signin" className="btn btn--scarlet">Sign In</Link>
          </>
        )}
      </div>
    </header>
  )
}
