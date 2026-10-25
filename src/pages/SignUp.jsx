import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useAuthRedirect } from '../components/useAuthRedirect.js'
import { useAppState } from '../state/AppStateContext.js'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUp() {
  useDocumentTitle('Sign Up')
  const { user, signUp } = useAppState()
  const location = useLocation()
  const redirectTo = useAuthRedirect()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(null)

  if (user) return <Navigate to={redirectTo} replace />

  if (confirmEmail) {
    return (
      <section className="auth-card" aria-labelledby="signup-title">
        <h1 id="signup-title" className="auth-card__title">Check your email</h1>
        <p className="auth-card__lead" role="status">
          We sent a confirmation link to {confirmEmail}. Open it, then sign in.
        </p>
        <Link to="/signin" state={location.state} className="btn btn--scarlet btn--block">Sign in</Link>
        <Link to="/" className="auth-card__link">Back to home</Link>
      </section>
    )
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    const name = form.name.trim()
    if (!name) next.name = 'Enter a display name.'
    else if (name.length > 40) next.name = 'Use 40 characters or fewer.'
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter a valid email, like name@example.com.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (Object.keys(next).length) return setErrors(next)

    if (busy) return
    setBusy(true)
    const result = await signUp(form)
    setBusy(false)
    if (result.ok) {
      if (result.confirm) setConfirmEmail(form.email.trim())
      return
    }
    if (result.field === 'email') {
      setErrors({ email: result.error ?? 'An account with this email already exists. Sign in instead.' })
    } else if (result.field === 'password') {
      setErrors({ password: result.error })
    } else {
      setErrors({ form: result.error })
    }
  }

  return (
    <section className="auth-card" aria-labelledby="signup-title">
      <h1 id="signup-title" className="auth-card__title">Sign Up</h1>
      <p className="auth-card__lead">Your display name appears on the logs you write. Your email stays private.</p>
      <form onSubmit={onSubmit} noValidate className="auth-form">
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        <Field label="Name" name="name" autoComplete="nickname" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" name="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <button type="submit" className="btn btn--scarlet btn--block" disabled={busy}>{busy ? 'Creating account…' : 'Continue'}</button>
      </form>
      <p className="auth-card__switch">
        Already signed up? <Link to="/signin" state={location.state}>Sign in</Link>
      </p>
      <Link to="/" className="auth-card__link">Back to home</Link>
    </section>
  )
}
