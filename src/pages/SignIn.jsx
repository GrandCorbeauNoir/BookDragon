import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useAuthRedirect } from '../components/useAuthRedirect.js'
import { useAppState } from '../state/AppStateContext.js'
import { useDocumentTitle } from '../utils/useDocumentTitle.js'

export default function SignIn() {
  useDocumentTitle('Sign In')
  const { user, signIn } = useAppState()
  const location = useLocation()
  const redirectTo = useAuthRedirect()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={redirectTo} replace />

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Enter your email.'
    if (!form.password) next.password = 'Enter your password.'
    if (Object.keys(next).length) return setErrors(next)

    if (busy) return
    setBusy(true)
    const result = await signIn(form)
    setBusy(false)
    if (!result.ok) setErrors({ form: result.error ?? 'Email or password is incorrect.' })
  }

  return (
    <section className="auth-card" aria-labelledby="signin-title">
      <h1 id="signin-title" className="auth-card__title">Sign In</h1>
      <p className="auth-card__lead">Enter your info to sign in or sign up.</p>
      <form onSubmit={onSubmit} noValidate className="auth-form">
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        <Field label="Email" type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" name="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <button type="submit" className="btn btn--scarlet btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Continue'}</button>
      </form>
      <Link to="/signup" state={location.state} className="btn btn--outline btn--block">Create account</Link>
      <Link to="/" className="auth-card__link">Back to home</Link>
    </section>
  )
}
