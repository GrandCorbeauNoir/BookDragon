import { Link } from 'react-router-dom'

export default function Brand() {
  return (
    <Link to="/" className="brand" aria-label="BookDragon home">
      <img src="/logo.jpg" alt="" className="brand__logo" width="44" height="44" />
      <span className="brand__name">BookDragon</span>
    </Link>
  )
}
