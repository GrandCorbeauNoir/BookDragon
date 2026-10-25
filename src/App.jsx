import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import Home from './pages/Home.jsx'
import Results from './pages/Results.jsx'
import BookView from './pages/BookView.jsx'
import Library from './pages/Library.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import NotFound from './pages/NotFound.jsx'
import RequireAuth from './components/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Results />} />
        <Route path="genres/:genre" element={<Results />} />
        <Route path="books/:id" element={<BookView />} />
        <Route path="library" element={<RequireAuth><Library /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>
    </Routes>
  )
}
