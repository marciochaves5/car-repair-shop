import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Car, User } from 'lucide-react'
import { Vehicles, Clients } from '../api/resources.js'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../context/ToastContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, EmptyState, ErrorNote, Field } from '../components/ui.jsx'

const EMPTY = { plate: '', mark: '', model: '', year: new Date().getFullYear(), color: '', clientId: '' }

export default function VehiclesPage() {
  const toast = useToast()
  const { data, loading, error, refetch } = useCollection(() => Vehicles.list(), [])
  const [clients, setClients] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => {
    Clients.list().then(setClients).catch(() => setClients([]))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((v) =>
      [v.plate, v.mark, v.model, v.color, v.client?.name].some((x) =>
        String(x || '').toLowerCase().includes(q),
      ),
    )
  }, [data, query])

  return (
    <div className="page">
      <div className="toolbar">
        <div className="search">
          <Search size={16} color="var(--text-faint)" />
          <input placeholder="Buscar por placa, modelo, dono…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={() => setEditing('new')} disabled={clients.length === 0}>
          <Plus size={16} /> Novo veículo
        </button>
      </div>

      {clients.length === 0 && !loading && (
        <div className="card card-pad" style={{ marginBottom: 18, borderColor: 'rgba(245,166,35,0.3)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Cadastre ao menos um <strong>cliente</strong> antes de adicionar veículos.
          </p>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Car}
            title={query ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
            hint={query ? 'Ajuste a busca.' : 'Registre os veículos que passam pela oficina.'}
          />
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((v) => (
            <div key={v.id} className="card card-pad veh-card">
              <div className="plate-tag">{v.plate}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 12 }}>
                {v.mark} {v.model}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 2 }}>
                {v.year} · {v.color}
              </div>
              <div className="chip" style={{ marginTop: 14 }}>
                <User size={12} /> {v.client?.name || `Cliente #${v.clientId}`}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => setEditing(v)}>
                  <Pencil size={13} /> Editar
                </button>
                <button className="btn btn-sm btn-icon btn-danger" onClick={() => setToDelete(v)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <VehicleForm
          initial={editing === 'new' ? EMPTY : { ...editing, clientId: editing.clientId }}
          clients={clients}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refetch()
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Excluir veículo"
          message={`Remover o veículo de placa ${toDelete.plate}?`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await Vehicles.remove(toDelete.id)
              toast.success('Veículo removido.')
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

function VehicleForm({ initial, clients, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(initial.id)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!String(form.plate).trim()) e.plate = 'Informe a placa.'
    if (!String(form.mark).trim()) e.mark = 'Informe a marca.'
    if (!String(form.model).trim()) e.model = 'Informe o modelo.'
    if (!String(form.color).trim()) e.color = 'Informe a cor.'
    const y = Number(form.year)
    if (!y || y < 1900 || y > new Date().getFullYear() + 1) e.year = 'Ano inválido.'
    if (!form.clientId) e.clientId = 'Selecione o proprietário.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = {
      plate: String(form.plate).trim().toUpperCase(),
      mark: String(form.mark).trim(),
      model: String(form.model).trim(),
      year: parseInt(form.year, 10),
      color: String(form.color).trim(),
      clientId: Number(form.clientId),
    }
    try {
      if (isEdit) await Vehicles.update(initial.id, payload)
      else await Vehicles.create(payload)
      toast.success(isEdit ? 'Veículo atualizado.' : 'Veículo cadastrado.')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar veículo' : 'Novo veículo'}
      icon={<Car size={18} color="var(--amber)" />}
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
        <Field label="Placa" error={errors.plate}>
          <input
            className={`input ${errors.plate ? 'invalid' : ''}`}
            value={form.plate}
            onChange={set('plate')}
            placeholder="ABC1D23"
            style={{ textTransform: 'uppercase' }}
            autoFocus
          />
        </Field>
        <Field label="Proprietário" error={errors.clientId}>
          <select className={`select ${errors.clientId ? 'invalid' : ''}`} value={form.clientId} onChange={set('clientId')}>
            <option value="">Selecione…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marca" error={errors.mark}>
          <input className={`input ${errors.mark ? 'invalid' : ''}`} value={form.mark} onChange={set('mark')} placeholder="Volkswagen" />
        </Field>
        <Field label="Modelo" error={errors.model}>
          <input className={`input ${errors.model ? 'invalid' : ''}`} value={form.model} onChange={set('model')} placeholder="Golf GTI" />
        </Field>
        <Field label="Ano" error={errors.year}>
          <input
            className={`input ${errors.year ? 'invalid' : ''}`}
            type="number"
            value={form.year}
            onChange={set('year')}
          />
        </Field>
        <Field label="Cor" error={errors.color}>
          <input className={`input ${errors.color ? 'invalid' : ''}`} value={form.color} onChange={set('color')} placeholder="Preto" />
        </Field>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  )
}
