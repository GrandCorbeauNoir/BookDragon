import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../data/supabase.js'
import { AppStateContext } from './AppStateContext.js'

const normalizeEmail = (email) => email.trim().toLowerCase()
const MAX_LOG_LENGTH = 2000
const GENERIC_ERROR = 'Something went wrong. Try again.'
const LIBRARY_COLS = 'volume_id, reading_status, created_at'
const LOG_COLS = 'log_id, user_id, volume_id, log, rating, created_at, updated_at'

const toEntry = (r, userId) => ({ bookId: r.volume_id, status: r.reading_status, addedAt: r.created_at, userId })
const toLog = (r, authorName) => ({
  id: r.log_id,
  bookId: r.volume_id,
  authorId: r.user_id,
  authorName: authorName ?? 'Reader',
  rating: r.rating,
  body: r.log,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

// Postgres / PostgREST / fetch errors -> friendly text.
const errorText = (err, fallback = GENERIC_ERROR) => {
  if (err?.code === '23503') return 'Add this book to your library to write a log.'
  if (err?.code === 'PGRST116') return 'You can only change your own logs.'
  if (/fetch|network/i.test(err?.message ?? '')) return 'The server could not be reached. Check your connection and try again.'
  return fallback
}

// Accounts live in Supabase Auth. The session is stored by supabase-js and restored on
// refresh; `user` is the signed-in user's public profile (id + display name, never email).
// Rules enforced by the database through RLS (and mirrored in the UI):
//  - a library belongs to one user and only they can see or change it
//  - a log can only be written for a book in its author's library
//  - removing a book from a library deletes that user's logs for it
//  - users can edit or delete only their own logs; everyone can read logs
export function AppStateProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined until Supabase reports the stored session
  const [profile, setProfile] = useState(null)
  const [library, setLibrary] = useState([])
  const [loadedStatus, setLibraryStatus] = useState('loading') // loading | ready | error (while signed in)
  const [libraryAttempt, setLibraryAttempt] = useState(0)
  const [logs, setLogs] = useState([]) // logs loaded for the book pages visited so far

  // INITIAL_SESSION fires first (restored from storage), then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
  // Don't await Supabase calls in here: the profile is loaded by the effect below.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const authUser = session?.user ?? null
  const sessionUserId = authUser?.id ?? null

  // Confirm who is signed in: load their profile whenever the session's user changes.
  useEffect(() => {
    if (!authUser) return undefined
    let cancelled = false
    supabase
      .from('profiles')
      .select('user_id, display_name')
      .eq('user_id', authUser.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const fallback = authUser.user_metadata?.display_name || 'Reader'
        setProfile({ id: authUser.id, displayName: data?.display_name ?? fallback })
      })
    return () => {
      cancelled = true
    }
  }, [authUser])

  const user = profile && profile.id === sessionUserId ? profile : null
  const authStatus = session === undefined || (sessionUserId && !user) ? 'loading' : 'ready'
  const userId = user?.id ?? null
  const libraryStatus = userId ? loadedStatus : 'idle'

  // Hydrate the signed-in user's library. RLS only ever returns their own rows.
  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    supabase
      .from('library_items')
      .select(LIBRARY_COLS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) return setLibraryStatus('error')
        setLibrary((data ?? []).map((r) => toEntry(r, userId)))
        setLibraryStatus('ready')
      })
    return () => {
      cancelled = true
    }
  }, [userId, libraryAttempt])

  const reloadLibrary = useCallback(() => {
    setLibraryStatus('loading')
    setLibraryAttempt((a) => a + 1)
  }, [])

  // Fetch one book's logs (public) with their authors' display names. Rejects when the request fails.
  const loadLogs = useCallback(async (bookId) => {
    const { data, error } = await supabase
      .from('logs')
      .select(LOG_COLS)
      .eq('volume_id', bookId)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    const ids = [...new Set((data ?? []).map((r) => r.user_id))]
    const names = new Map()
    if (ids.length) {
      const res = await supabase.from('profiles').select('user_id, display_name').in('user_id', ids)
      if (res.error) throw res.error
      for (const p of res.data ?? []) names.set(p.user_id, p.display_name)
    }
    const shaped = (data ?? []).map((r) => toLog(r, names.get(r.user_id)))
    setLogs((prev) => [...prev.filter((l) => l.bookId !== bookId), ...shaped])
  }, [])

  const value = useMemo(() => {
    const myLibrary = user ? library.filter((e) => e.userId === user.id) : []
    const entryFor = (bookId) => myLibrary.find((e) => e.bookId === bookId) ?? null

    const validLog = ({ body, rating }) => {
      const text = (body ?? '').trim()
      if (!text) return { error: 'Write something before saving.' }
      if (text.length > MAX_LOG_LENGTH) return { error: `Keep it under ${MAX_LOG_LENGTH} characters.` }
      if (rating != null && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
        return { error: 'Choose a rating from 1 to 5, or leave it blank.' }
      }
      return { text }
    }

    return {
      user,
      authStatus,
      logs,
      myLibrary,
      libraryStatus,
      reloadLibrary,
      entryFor,
      loadLogs,

      // The sign-up trigger creates the profile from `display_name`.
      // With email confirmation on, there's no session yet: `confirm: true`.
      signUp: async ({ name, email, password }) => {
        const { data, error } = await supabase.auth.signUp({
          email: normalizeEmail(email),
          password,
          options: { data: { display_name: name.trim() } },
        })
        if (error) {
          if (error.code === 'user_already_exists' || error.code === 'email_exists') return { ok: false, field: 'email' }
          if (error.code === 'weak_password') return { ok: false, field: 'password', error: error.message }
          if (error.code === 'email_address_invalid') return { ok: false, field: 'email', error: 'Use a different email address.' }
          return { ok: false, error: errorText(error, "We couldn't create your account. Try again.") }
        }
        // Confirmation on + existing email: Supabase returns a user with no identities instead of an error.
        if (data.user && data.user.identities?.length === 0) return { ok: false, field: 'email' }
        return { ok: true, confirm: !data.session }
      },
      signIn: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password })
        if (!error) return { ok: true }
        if (error.code === 'email_not_confirmed') return { ok: false, error: 'Confirm your email first, then sign in.' }
        if (error.code === 'invalid_credentials') return { ok: false }
        return { ok: false, error: errorText(error, "We couldn't sign you in. Try again.") }
      },
      // Ends the session on the server and removes the stored tokens from this browser.
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) await supabase.auth.signOut({ scope: 'local' })
        setProfile(null)
        setLibrary([])
      },

      addToLibrary: async (bookId) => {
        if (!user) return { ok: false, error: 'Sign in to add books to your library.' }
        if (entryFor(bookId)) return { ok: true }
        const { data, error } = await supabase.from('library_items').insert({ volume_id: bookId }).select(LIBRARY_COLS).single()
        if (error) return { ok: false, error: errorText(error, "Couldn't add this book. Try again.") }
        setLibrary((prev) => [...prev.filter((e) => !(e.userId === user.id && e.bookId === bookId)), toEntry(data, user.id)])
        return { ok: true }
      },
      setStatus: async (bookId, status) => {
        if (!user || !entryFor(bookId)) return { ok: false, error: GENERIC_ERROR }
        const { data, error } = await supabase
          .from('library_items')
          .update({ reading_status: status })
          .eq('user_id', user.id)
          .eq('volume_id', bookId)
          .select('volume_id')
        if (error || !data?.length) return { ok: false, error: errorText(error, "Couldn't update the status. Try again.") }
        setLibrary((prev) => prev.map((e) => (e.userId === user.id && e.bookId === bookId ? { ...e, status } : e)))
        return { ok: true }
      },
      removeFromLibrary: async (bookId) => {
        if (!user) return { ok: false, error: GENERIC_ERROR }
        const { error } = await supabase.from('library_items').delete().eq('user_id', user.id).eq('volume_id', bookId)
        if (error) return { ok: false, error: errorText(error, "Couldn't remove this book. Try again.") }
        setLibrary((prev) => prev.filter((e) => !(e.userId === user.id && e.bookId === bookId)))
        setLogs((prev) => prev.filter((l) => !(l.authorId === user.id && l.bookId === bookId)))
        return { ok: true }
      },

      addLog: async ({ bookId, body, rating = null }) => {
        if (!user) return { ok: false, error: 'Sign in to write a log.' }
        if (!entryFor(bookId)) return { ok: false, error: 'Add this book to your library to write a log.' }
        const checked = validLog({ body, rating })
        if (checked.error) return { ok: false, error: checked.error }
        const { data, error } = await supabase
          .from('logs')
          .insert({ volume_id: bookId, log: checked.text, rating: rating ?? null })
          .select(LOG_COLS)
          .single()
        if (error) return { ok: false, error: errorText(error, "Couldn't post your log. Try again.") }
        setLogs((prev) => [...prev, toLog(data, user.displayName)])
        return { ok: true }
      },
      updateLog: async (id, { body, rating = null }) => {
        const log = logs.find((l) => l.id === id)
        if (!user || !log || log.authorId !== user.id) return { ok: false, error: 'You can only edit your own logs.' }
        const checked = validLog({ body, rating })
        if (checked.error) return { ok: false, error: checked.error }
        const { data, error } = await supabase
          .from('logs')
          .update({ log: checked.text, rating: rating ?? null })
          .eq('log_id', id)
          .select(LOG_COLS)
          .single()
        if (error) return { ok: false, error: errorText(error, "Couldn't save your changes. Try again.") }
        setLogs((prev) => prev.map((l) => (l.id === id ? toLog(data, user.displayName) : l)))
        return { ok: true }
      },
      deleteLog: async (id) => {
        const log = logs.find((l) => l.id === id)
        if (!user || !log || log.authorId !== user.id) return { ok: false, error: 'You can only delete your own logs.' }
        const { data, error } = await supabase.from('logs').delete().eq('log_id', id).select('log_id')
        if (error || !data?.length) return { ok: false, error: errorText(error, "Couldn't delete this log. Try again.") }
        setLogs((prev) => prev.filter((l) => l.id !== id))
        return { ok: true }
      },
    }
  }, [user, authStatus, library, logs, libraryStatus, reloadLibrary, loadLogs])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
