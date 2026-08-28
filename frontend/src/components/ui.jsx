import { Inbox } from 'lucide-react'
import { statusMeta } from '../utils/status.js'

export function Spinner() {
  return <div className="spinner" />
}

export function EmptyState({ icon, title, hint, action }) {
  const Icon = icon || Inbox
  return (
    <div className="empty">
      <Icon size={46} strokeWidth={1.4} />
      <h4>{title}</h4>
      {hint && <p>{hint}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}

export function StatusPill({ status }) {
  const meta = statusMeta(status)
  return (
    <span className={`pill ${meta.pill}`}>
      <span className="dot" />
      {meta.label}
    </span>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="card card-pad" style={{ borderColor: 'rgba(255,95,109,0.3)' }}>
      <p style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>Algo deu errado</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{error.message}</p>
      {onRetry && (
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}
