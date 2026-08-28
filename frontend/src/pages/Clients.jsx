import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users, Phone } from 'lucide-react'
import { Clients } from '../api/resources.js'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../context/ToastContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, EmptyState, ErrorNote, Field } from '../components/ui.jsx'
import { maskCpf, initials } from '../utils/format.js'

const EMPTY = { name: '', cpf: '', contact: '', email: '' }

export default function ClientsPage() {
  const toast = useToast()
  const { data, loading, error, refetch } = useCollection(() => Clients.list(), [])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // object | 'new' | null
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((c) =>
      [c.name, c.cpf, c.contact, c.email].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [data, query])

  return (
    <div className="page">
      <div className="toolbar">
        <div className="search">
          <Search size={16} color="var(--text-faint)" />
          <input
            placeholder="Buscar por nome, CPF, contato…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus size={16} /> Novo cliente
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={query ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            hint={query ? 'Ajuste a busca e tente de novo.' : 'Cadastre o primeiro cliente da oficina.'}
            action={
              !query && (
                <button className="btn btn-primary" onClick={() => setEditing('new')}>
                  <Plus size={16} /> Novo cliente
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Contato</th>
                <th>E-mail</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span className="user-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                        {initials(c.name)}
                      </span>
                      <span className="cell-strong">{c.name}</span>
                    </div>
                  </td>
                  <td className="cell-mono">{maskCpf(c.cpf)}</td>
                  <td>
                    <span className="chip">
                      <Phone size={12} /> {c.contact || '—'}
                    </span>
                  </td>
                  <td style={{ color: c.email ? 'var(--text)' : 'var(--text-faint)' }}>
                    {c.email || '—'}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-icon" onClick={() => setEditing(c)} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-icon btn-danger"
                        onClick={() => setToDelete(c)}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ClientForm
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
          title="Excluir cliente"
          message={`Remover "${toDelete.name}"? Veículos e ordens vinculados podem impedir a exclusão.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await Clients.remove(toDelete.id)
              toast.success('Cliente excluído.')
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

function ClientForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(initial.id)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Informe o nome.'
    const digits = String(form.cpf).replace(/\D/g, '')
    if (digits.length !== 11) e.cpf = 'CPF deve ter 11 dígitos.'
    if (!form.contact.trim()) e.contact = 'Informe um contato.'
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'E-mail inválido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = {
      name: form.name.trim(),
      cpf: String(form.cpf).replace(/\D/g, ''),
      contact: form.contact.trim(),
      email: form.email?.trim() || null,
    }
    try {
      if (isEdit) await Clients.update(initial.id, payload)
      else await Clients.create(payload)
      toast.success(isEdit ? 'Cliente atualizado.' : 'Cliente cadastrado.')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Novo cliente'}
      icon={<Users size={18} color="var(--amber)" />}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Nome completo" error={errors.name}>
          <input className={`input ${errors.name ? 'invalid' : ''}`} value={form.name} onChange={set('name')} autoFocus />
        </Field>
        <Field label="CPF" error={errors.cpf}>
          <input
            className={`input ${errors.cpf ? 'invalid' : ''}`}
            value={maskCpf(form.cpf)}
            onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </Field>
        <Field label="Contato / telefone" error={errors.contact}>
          <input
            className={`input ${errors.contact ? 'invalid' : ''}`}
            value={form.contact}
            onChange={set('contact')}
            placeholder="(11) 90000-0000"
          />
        </Field>
        <Field label="E-mail (opcional)" error={errors.email}>
          <input
            className={`input ${errors.email ? 'invalid' : ''}`}
            value={form.email || ''}
            onChange={set('email')}
            placeholder="cliente@email.com"
          />
        </Field>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  )
}
