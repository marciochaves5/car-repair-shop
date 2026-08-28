import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'

export default function ConfirmDialog({ title, message, confirmLabel = 'Excluir', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  async function handle() {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={title}
      icon={<AlertTriangle size={18} color="var(--red)" />}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handle} disabled={busy}>
            {busy ? 'Aguarde…' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{message}</p>
    </Modal>
  )
}
