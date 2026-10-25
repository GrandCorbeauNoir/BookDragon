import { useEffect, useState } from 'react'

// The entrance plays once per page load, not on every visit to Home.
let welcomePlayed = false

export default function Welcome() {
  const [animate] = useState(() => !welcomePlayed)
  useEffect(() => {
    welcomePlayed = true
  }, [])

  return (
    <section className={`welcome${animate ? ' welcome--animate' : ''}`} aria-labelledby="welcome-title">
      <h1 id="welcome-title" className="welcome__title">
        <span className="welcome__lead">Welcome to</span>
        <span className="welcome__brand">
          <img src="/logo.jpg" alt="" width="72" height="72" />
          BookDragon
        </span>
      </h1>
      <p className="welcome__tag">Unlimited Books. Anytime. Anywhere.</p>
      <p className="welcome__sub">A good book is just a dragon's breath away.</p>
    </section>
  )
}
