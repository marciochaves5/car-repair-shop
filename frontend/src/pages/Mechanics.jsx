import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Wrench, BadgeCheck } from 'lucide-react'
import { Mechanics } from '../api/resources.js'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../context/ToastContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, EmptyState, ErrorNote, Field } from '../components/ui.jsx'
import { initials } from '../utils/format.js'

const EMPTY = { name: '', specialty: '', contact: '' }

export default function MechanicsPage() {
  const toast = useToast()
  const { data, loading, error, refetch } = useCollection(() => Mechanics.list(), [])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((m) =>
      [m.name, m.specialty, m.contact].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [data, query])

  return (
    <div className="page">
      <div className="toolbar">
        <div className="search">
          <Search size={16} color="var(--text-faint)" />
          <input placeholder="Buscar mecânico ou especialidade…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus size={16} /> Novo mecânico
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wrench}
            title={query ? 'Nenhum mecânico encontrado' : 'Nenhum mecânico cadastrado'}
            hint={query ? 'Ajuste a busca.' : 'Cadastre a equipe da oficina.'}
            action={
              !query && (
                <button className="btn btn-primary" onClick={() => setEditing('new')}>
                  <Plus size={16} /> Novo mecânico
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((m) => (
            <div key={m.id} className="card card-pad mech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span className="user-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                  {initials(m.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{m.contact}</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <span className="pill pill-progress">
                  <BadgeCheck size={13} /> {m.specialty}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => setEditing(m)}>
                  <Pencil size={13} /> Editar
                </button>
                <button className="btn btn-sm btn-icon btn-danger" onClick={() => setToDelete(m)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <MechanicForm
          initial={editing === 'new' ? EMPTY : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refetch()
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Excluir mecânico"
          message={`Remover "${toDelete.name}" da equipe?`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await Mechanics.remove(toDelete.id)
              toast.success('Mecânico removido.')
              refetch()
            } catch (err) {
              toast.error(err.message)
              throw err
            }
          }}
        />
      )}
    </div>
  )
}

function MechanicForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(initial.id)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Informe o nome.'
    if (!form.specialty.trim()) e.specialty = 'Informe a especialidade.'
    if (!form.contact.trim()) e.contact = 'Informe um contato.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      contact: form.contact.trim(),
    }
    try {
      if (isEdit) await Mechanics.update(initial.id, payload)
      else await Mechanics.create(payload)
      toast.success(isEdit ? 'Mecânico atualizado.' : 'Mecânico cadastrado.')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar mecânico' : 'Novo mecânico'}
      icon={<Wrench size={18} color="var(--amber)" />}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Salvando…' : isEdit ? 'Salvar' : 'Cadastrar'}
          </button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Nome" error={errors.name}>
          <input className={`input ${errors.name ? 'invalid' : ''}`} value={form.name} onChange={set('name')} autoFocus />
        </Field>
        <Field label="Especialidade" error={errors.specialty}>
          <input
            className={`input ${errors.specialty ? 'invalid' : ''}`}
            value={form.specialty}
            onChange={set('specialty')}
            placeholder="Motor, suspensão, elétrica…"
          />
        </Field>
        <Field label="Contato" error={errors.contact}>
          <input
            className={`input ${errors.contact ? 'invalid' : ''}`}
            value={form.contact}
            onChange={set('contact')}
            placeholder="(11) 90000-0000"
          />
        </Field>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  )
}
