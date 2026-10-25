import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../state/AppStateContext.js'
import { focusMain } from '../utils/focus.js'
import LogForm from './LogForm.jsx'

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

function Rating({ value }) {
  if (!value) return null
  return (
    <span className="log__rating" role="img" aria-label={`${value} out of 5`}>
      {'★'.repeat(value)}
      <span className="log__rating-off">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

function OwnLogActions({ log, onEdit, editRef }) {
  const { deleteLog } = useAppState()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const deleteRef = useRef(null)
  const restoreFocus = useRef(false)

  useEffect(() => {
    if (!confirming && restoreFocus.current) {
      restoreFocus.current = false
      deleteRef.current?.focus()
    }
  }, [confirming])

  if (confirming) {
    return (
      <div className="confirm" role="alertdialog" aria-label="Delete this log">
        <p className="confirm__text">Delete this log? This can't be undone.</p>
        {error && <p className="field__error" role="alert">{error}</p>}
        <div className="confirm__actions">
          <button type="button" className="btn btn--danger btn--small" disabled={busy} onClick={async () => {
            setBusy(true)
            const result = await deleteLog(log.id)
            if (result.ok) return focusMain()
            setBusy(false)
            setError(result.error)
          }}>Delete log</button>
          <button type="button" className="btn btn--outline btn--small" onClick={() => {
            restoreFocus.current = true
            setConfirming(false)
          }} autoFocus>Keep it</button>
        </div>
      </div>
    )
  }

  return (
    <div className="log__actions">
      <button ref={editRef} type="button" className="link-button" onClick={onEdit}>Edit</button>
      <button ref={deleteRef} type="button" className="link-button" onClick={() => setConfirming(true)}>Delete</button>
    </div>
  )
}

function LogItem({ log }) {
  const { user, updateLog } = useAppState()
  const [editing, setEditing] = useState(false)
  const own = user?.id === log.authorId
  const editRef = useRef(null)
  const restoreFocus = useRef(false)

  useEffect(() => {
    if (!editing && restoreFocus.current) {
      restoreFocus.current = false
      editRef.current?.focus()
    }
  }, [editing])

  const stopEditing = () => {
    restoreFocus.current = true
    setEditing(false)
  }

  return (
    <li className="log">
      <div className="log__head">
        <span className="log__author">{log.authorName}</span>
        {own && <span className="log__you">You</span>}
        <Rating value={log.rating} />
        <time className="log__date" dateTime={log.createdAt}>
          {dateFmt.format(new Date(log.createdAt))}
          {log.updatedAt && log.updatedAt !== log.createdAt && ' (edited)'}
        </time>
      </div>
      {editing ? (
        <LogForm
          initial={log}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            const result = await updateLog(log.id, values)
            if (result.ok) stopEditing()
            return result
          }}
          onCancel={stopEditing}
        />
      ) : (
        <>
          <p className="log__body">{log.body}</p>
          {own && <OwnLogActions log={log} editRef={editRef} onEdit={() => setEditing(true)} />}
        </>
      )}
    </li>
  )
}

export default function LogList({ logs }) {
  if (logs.length === 0) {
    return (
      <p className="logs__empty">No logs yet. Readers who add this book to their library can write the first one.</p>
    )
  }

  return (
    <ul className="logs__list">
      {logs.map((log) => (
        <LogItem key={log.id} log={log} />
      ))}
    </ul>
  )
}
