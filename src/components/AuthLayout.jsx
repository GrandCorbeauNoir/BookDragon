import { Outlet } from 'react-router-dom'
import Brand from './Brand.jsx'

export default function AuthLayout() {
  return (
    <div className="shell shell--auth">
      <header className="topbar topbar--auth">
        <Brand />
      </header>
      <main className="main main--auth">
        <Outlet />
      </main>
    </div>
  )
}
