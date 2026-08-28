import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, ClipboardList, ArrowRight } from 'lucide-react'
import { WorkOrders, Clients, Vehicles, Mechanics } from '../api/resources.js'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../context/ToastContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, EmptyState, ErrorNote, Field, StatusPill } from '../components/ui.jsx'
import { STATUS, normalizeStatus } from '../utils/status.js'
import { money, formatDate, toLocalInput } from '../utils/format.js'

export default function WorkOrdersPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useCollection(() => WorkOrders.list(), [])
  const [refs, setRefs] = useState({ clients: [], vehicles: [], mechanics: [] })
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => {
    Promise.all([
      Clients.list().catch(() => []),
      Vehicles.list().catch(() => []),
      Mechanics.list().catch(() => []),
    ]).then(([clients, vehicles, mechanics]) => setRefs({ clients, vehicles, mechanics }))
  }, [])

  const clientById = useMemo(() => Object.fromEntries(refs.clients.map((c) => [c.id, c])), [refs])
  const vehicleById = useMemo(() => Object.fromEntries(refs.vehicles.map((v) => [v.id, v])), [refs])
  const mechanicById = useMemo(() => Object.fromEntries(refs.mechanics.map((m) => [m.id, m])), [refs])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...data]
      .sort((a, b) => b.number - a.number)
      .filter((o) => (statusFilter === 'all' ? true : normalizeStatus(o.status) === Number(statusFilter)))
      .filter((o) => {
        if (!q) return true
        const c = clientById[o.clientId]?.name || ''
        const v = vehicleById[o.vehicleId]
        const vLabel = v ? `${v.mark} ${v.model} ${v.plate}` : ''
        return [String(o.number), c, vLabel, o.service, o.problemDescription].some((x) =>
          String(x || '').toLowerCase().includes(q),
        )
      })
  }, [data, query, statusFilter, clientById, vehicleById])

  const nextNumber = useMemo(
    () => (data.length ? Math.max(...data.map((o) => Number(o.number) || 0)) + 1 : 1),
    [data],
  )

  const canCreate = refs.clients.length && refs.vehicles.length && refs.mechanics.length

  return (
    <div className="page">
      <div className="toolbar">
        <div className="search">
          <Search size={16} color="var(--text-faint)" />
          <input placeholder="Buscar por nº, cliente, veículo, serviço…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="seg">
          <button className={statusFilter === 'all' ? 'on' : ''} onClick={() => setStatusFilter('all')}>
            Todas
          </button>
          {STATUS.map((s) => (
            <button
              key={s.value}
              className={String(statusFilter) === String(s.value) ? 'on' : ''}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.short}
            </button>
          ))}
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={() => setCreating(true)} disabled={!canCreate}>
          <Plus size={16} /> Nova ordem
        </button>
      </div>

      {!canCreate && !loading && (
        <div className="card card-pad" style={{ marginBottom: 18, borderColor: 'rgba(245,166,35,0.3)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Para abrir uma ordem você precisa de pelo menos um <strong>cliente</strong>, um{' '}
            <strong>veículo</strong> e um <strong>mecânico</strong> cadastrados.
          </p>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title={data.length ? 'Nada com esse filtro' : 'Nenhuma ordem de serviço'}
            hint={data.length ? 'Tente outro status ou busca.' : 'Abra a primeira ordem para o pátio.'}
            action={
              !data.length && canCreate ? (
                <button className="btn btn-primary" onClick={() => setCreating(true)}>
                  <Plus size={16} /> Nova ordem
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente / Veículo</th>
                <th>Serviço</th>
                <th>Entrada</th>
                <th className="num">Valor</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const v = vehicleById[o.vehicleId]
                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/ordens/${o.id}`)}>
                    <td className="cell-strong" style={{ color: 'var(--amber)' }}>#{o.number}</td>
                    <td>
                      <div className="cell-strong">{clientById[o.clientId]?.name || `Cliente #${o.clientId}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {v ? `${v.mark} ${v.model} · ${v.plate}` : `Veículo #${o.vehicleId}`}
                      </div>
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.service}
                      </div>
                    </td>
                    <td>{formatDate(o.entryDate)}</td>
                    <td className="num money">{money(o.value)}</td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-icon" onClick={() => navigate(`/ordens/${o.id}`)} title="Abrir">
                          <ArrowRight size={14} />
                        </button>
                        <button className="btn btn-sm btn-icon btn-danger" onClick={() => setToDelete(o)} title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <WorkOrderForm
          nextNumber={nextNumber}
          refs={refs}
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false)
            refetch()
            if (created?.id) navigate(`/ordens/${created.id}`)
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Excluir ordem"
          message={`Excluir a ordem #${toDelete.number}? Esta ação não pode ser desfeita.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await WorkOrders.remove(toDelete.id)
              toast.success('Ordem excluída.')
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

function WorkOrderForm({ nextNumber, refs, onClose, onCreated }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    number: nextNumber,
    clientId: '',
    vehicleId: '',
    mechanicId: '',
    problemDescription: '',
    service: '',
    entryDate: toLocalInput(new Date()),
    departureDate: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Vehicles narrowed to the chosen client (falls back to all).
  const vehicleOptions = useMemo(() => {
    if (!form.clientId) return refs.vehicles
    return refs.vehicles.filter((v) => String(v.clientId) === String(form.clientId))
  }, [form.clientId, refs.vehicles])

  function validate() {
    const e = {}
    if (!form.number || Number(form.number) <= 0) e.number = 'Número inválido.'
    if (!form.clientId) e.clientId = 'Selecione o cliente.'
    if (!form.vehicleId) e.vehicleId = 'Selecione o veículo.'
    if (!form.mechanicId) e.mechanicId = 'Selecione o mecânico.'
    if (!form.problemDescription.trim()) e.problemDescription = 'Descreva o problema relatado.'
    if (!form.service.trim()) e.service = 'Descreva o serviço a executar.'
    if (!form.entryDate) e.entryDate = 'Informe a data de entrada.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = {
      number: parseInt(form.number, 10),
      clientId: Number(form.clientId),
      vehicleId: Number(form.vehicleId),
      mechanicId: Number(form.mechanicId),
      problemDescription: form.problemDescription.trim(),
      service: form.service.trim(),
      entryDate: new Date(form.entryDate).toISOString(),
      departureDate: form.departureDate ? new Date(form.departureDate).toISOString() : null,
    }
    try {
      const created = await WorkOrders.create(payload)
      toast.success(`Ordem #${payload.number} aberta.`)
      onCreated(created)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Nova ordem de serviço"
      icon={<ClipboardList size={18} color="var(--amber)" />}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Abrindo…' : 'Abrir ordem'}
          </button>
        </>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Número da ordem" error={errors.number}>
          <input
            className={`input ${errors.number ? 'invalid' : ''}`}
            type="number"
            value={form.number}
            onChange={set('number')}
          />
        </Field>
        <Field label="Data de entrada" error={errors.entryDate}>
          <input
            className={`input ${errors.entryDate ? 'invalid' : ''}`}
            type="datetime-local"
            value={form.entryDate}
            onChange={set('entryDate')}
          />
        </Field>

        <Field label="Cliente" error={errors.clientId}>
          <select
            className={`select ${errors.clientId ? 'invalid' : ''}`}
            value={form.clientId}
            onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value, vehicleId: '' }))}
          >
            <option value="">Selecione…</option>
            {refs.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Veículo"
          error={errors.vehicleId}
          hint={form.clientId && vehicleOptions.length === 0 ? 'Este cliente não tem veículos.' : undefined}
        >
          <select className={`select ${errors.vehicleId ? 'invalid' : ''}`} value={form.vehicleId} onChange={set('vehicleId')}>
            <option value="">Selecione…</option>
            {vehicleOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.mark} {v.model} · {v.plate}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mecânico responsável" error={errors.mechanicId}>
          <select className={`select ${errors.mechanicId ? 'invalid' : ''}`} value={form.mechanicId} onChange={set('mechanicId')}>
            <option value="">Selecione…</option>
            {refs.mechanics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.specialty}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Previsão de saída (opcional)">
          <input className="input" type="datetime-local" value={form.departureDate} onChange={set('departureDate')} />
        </Field>

        <div className="field full">
          <Field label="Problema relatado pelo cliente" error={errors.problemDescription}>
            <textarea
              className={`input ${errors.problemDescription ? 'invalid' : ''}`}
              value={form.problemDescription}
              onChange={set('problemDescription')}
              placeholder="Barulho ao frear, luz de injeção acesa…"
            />
          </Field>
        </div>
        <div className="field full">
          <Field label="Serviço a executar" error={errors.service}>
            <textarea
              className={`input ${errors.service ? 'invalid' : ''}`}
              value={form.service}
              onChange={set('service')}
              placeholder="Troca de pastilhas, diagnóstico eletrônico…"
            />
          </Field>
        </div>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  )
}
