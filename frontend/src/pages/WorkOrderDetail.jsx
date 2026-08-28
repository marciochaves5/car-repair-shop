import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Car,
  Wrench,
  Save,
  Trash2,
  Plus,
  Package,
  CalendarClock,
  ClipboardList,
} from 'lucide-react'
import { WorkOrders, Clients, Vehicles, Mechanics, Pieces, WorkOrderPieces } from '../api/resources.js'
import { useToast } from '../context/ToastContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, ErrorNote, StatusPill, Field } from '../components/ui.jsx'
import { STATUS, normalizeStatus } from '../utils/status.js'
import { money, formatDate, formatDateTime, toLocalInput } from '../utils/format.js'

export default function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const [client, setClient] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [mechanic, setMechanic] = useState(null)
  const [pieces, setPieces] = useState([])
  const [links, setLinks] = useState([]) // WorkOrderPiece rows for this order

  const [form, setForm] = useState(null)
  const [savingDetails, setSavingDetails] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const o = await WorkOrders.get(id)
      setOrder(o)
      setForm({
        problemDescription: o.problemDescription || '',
        service: o.service || '',
        value: o.value ?? 0,
        departureDate: o.departureDate ? toLocalInput(o.departureDate) : '',
        status: normalizeStatus(o.status),
      })

      const [c, v, m, allPieces, allLinks] = await Promise.all([
        Clients.get(o.clientId).catch(() => null),
        Vehicles.get(o.vehicleId).catch(() => null),
        Mechanics.get(o.mechanicId).catch(() => null),
        Pieces.list().catch(() => []),
        WorkOrderPieces.list().catch(() => []),
      ])
      setClient(c)
      setVehicle(v)
      setMechanic(m)
      setPieces(allPieces)
      setLinks((allLinks || []).filter((l) => Number(l.workOrderId) === Number(o.id)))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const pieceById = useMemo(() => Object.fromEntries(pieces.map((p) => [p.id, p])), [pieces])
  const partsTotal = useMemo(
    () =>
      links.reduce(
        (sum, l) => sum + (Number(pieceById[l.pieceId]?.price) || 0) * (Number(l.quantityUsed) || 0),
        0,
      ),
    [links, pieceById],
  )

  function buildPayload(overrides = {}) {
    return {
      problemDescription: form.problemDescription.trim(),
      service: form.service.trim(),
      value: parseFloat(form.value) || 0,
      departureDate: form.departureDate ? new Date(form.departureDate).toISOString() : null,
      status: form.status,
      ...overrides,
    }
  }

  async function saveDetails(e) {
    e?.preventDefault()
    setSavingDetails(true)
    try {
      await WorkOrders.update(id, buildPayload())
      toast.success('Ordem atualizada.')
      load(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingDetails(false)
    }
  }

  async function setStatus(next) {
    if (next === form.status) return
    setSavingStatus(true)
    setForm((f) => ({ ...f, status: next }))
    try {
      await WorkOrders.update(id, buildPayload({ status: next }))
      toast.success(`Status: ${STATUS.find((s) => s.value === next).label}.`)
      load(true)
    } catch (err) {
      toast.error(err.message)
      setForm((f) => ({ ...f, status: normalizeStatus(order.status) }))
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) return <div className="page"><Spinner /></div>
  if (error)
    return (
      <div className="page">
        <Link to="/ordens" className="back-link">
          <ArrowLeft size={15} /> Voltar
        </Link>
        <ErrorNote error={error} onRetry={load} />
      </div>
    )

  const currentStatus = form.status

  return (
    <div className="page">
      <Link to="/ordens" className="back-link">
        <ArrowLeft size={15} /> Ordens de serviço
      </Link>

      <div className="toolbar" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>
            Ordem <span style={{ color: 'var(--amber)' }}>#{order.number}</span>
          </h2>
          <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 4 }}>
            Entrada em {formatDateTime(order.entryDate)}
          </div>
        </div>
        <div className="toolbar-spacer" />
        <StatusPill status={currentStatus} />
        <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 size={15} /> Excluir
        </button>
      </div>

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status flow */}
          <div className="card">
            <div className="card-head">
              <ClipboardList size={16} color="var(--amber)" />
              <h3>Fluxo de atendimento</h3>
              {savingStatus && <span className="sub">salvando…</span>}
            </div>
            <div className="card-pad">
              <div className="status-flow">
                {STATUS.map((s) => {
                  const cls =
                    s.value === currentStatus ? 'current' : s.value < currentStatus ? 'done' : ''
                  return (
                    <button
                      key={s.value}
                      className={`status-step ${cls}`}
                      disabled={savingStatus}
                      onClick={() => setStatus(s.value)}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>
                Clique em uma etapa para mover a ordem. O status é salvo na hora.
              </p>
            </div>
          </div>

          {/* Editable details */}
          <form className="card" onSubmit={saveDetails}>
            <div className="card-head">
              <Wrench size={16} color="var(--amber)" />
              <h3>Diagnóstico & serviço</h3>
            </div>
            <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Problema relatado">
                <textarea
                  className="input"
                  value={form.problemDescription}
                  onChange={(e) => setForm((f) => ({ ...f, problemDescription: e.target.value }))}
                />
              </Field>
              <Field label="Serviço executado / a executar">
                <textarea
                  className="input"
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                />
              </Field>
              <div className="form-grid">
                <Field label="Valor da mão de obra / total (R$)" hint="Peças são somadas à parte, abaixo.">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  />
                </Field>
                <Field label="Data de saída">
                  <input
                    className="input"
                    type="datetime-local"
                    value={form.departureDate}
                    onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))}
                  />
                </Field>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={savingDetails}>
                  <Save size={15} /> {savingDetails ? 'Salvando…' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </form>

          {/* Parts */}
          <PartsPanel
            orderId={order.id}
            pieces={pieces}
            links={links}
            pieceById={pieceById}
            onChanged={() => load(true)}
          />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MiniCard
              icon={User}
              label="Cliente"
              value={client?.name || `#${order.clientId}`}
              sub={client ? `${client.contact}${client.email ? ' · ' + client.email : ''}` : null}
            />
            <MiniCard
              icon={Car}
              label="Veículo"
              value={vehicle ? `${vehicle.mark} ${vehicle.model}` : `#${order.vehicleId}`}
              sub={vehicle ? `${vehicle.plate} · ${vehicle.year} · ${vehicle.color}` : null}
            />
            <MiniCard
              icon={Wrench}
              label="Mecânico"
              value={mechanic?.name || `#${order.mechanicId}`}
              sub={mechanic?.specialty}
            />
          </div>

          <div className="card">
            <div className="card-head">
              <CalendarClock size={16} color="var(--amber)" />
              <h3>Resumo financeiro</h3>
            </div>
            <div className="card-pad">
              <div className="info-row">
                <span className="k">Mão de obra / total</span>
                <span className="v money">{money(form.value)}</span>
              </div>
              <div className="info-row">
                <span className="k">Peças aplicadas ({links.length})</span>
                <span className="v money">{money(partsTotal)}</span>
              </div>
              <div className="info-row">
                <span className="k" style={{ fontWeight: 700, color: 'var(--text)' }}>
                  Total estimado
                </span>
                <span className="v money pos" style={{ fontSize: 16 }}>
                  {money((parseFloat(form.value) || 0) + partsTotal)}
                </span>
              </div>
              <div className="divider" />
              <div className="info-row">
                <span className="k">Entrada</span>
                <span className="v">{formatDate(order.entryDate)}</span>
              </div>
              <div className="info-row">
                <span className="k">Saída</span>
                <span className="v">{order.departureDate ? formatDate(order.departureDate) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir ordem"
          message={`Excluir a ordem #${order.number}? Esta ação não pode ser desfeita.`}
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            try {
              await WorkOrders.remove(order.id)
              toast.success('Ordem excluída.')
              navigate('/ordens')
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

function MiniCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="mini-card">
      <div className="mc-icon">
        <Icon size={18} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="mc-label">{label}</div>
        <div className="mc-value">{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{sub}</div>}
      </div>
    </div>
  )
}

function PartsPanel({ orderId, pieces, links, pieceById, onChanged }) {
  const toast = useToast()
  const [pieceId, setPieceId] = useState('')
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)

  const available = pieces.filter((p) => !links.some((l) => l.pieceId === p.id))

  async function add(e) {
    e.preventDefault()
    if (!pieceId) return
    setBusy(true)
    try {
      await WorkOrderPieces.create({
        workOrderId: Number(orderId),
        pieceId: Number(pieceId),
        quantityUsed: Math.max(1, parseInt(qty, 10) || 1),
      })
      toast.success('Peça adicionada à ordem.')
      setPieceId('')
      setQty(1)
      onChanged()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function changeQty(link, next) {
    const q = Math.max(1, parseInt(next, 10) || 1)
    try {
      await WorkOrderPieces.update(link.workOrderId, link.pieceId, {
        workOrderId: link.workOrderId,
        pieceId: link.pieceId,
        quantityUsed: q,
      })
      onChanged()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function remove(link) {
    try {
      await WorkOrderPieces.remove(link.workOrderId, link.pieceId)
      toast.success('Peça removida da ordem.')
      onChanged()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <Package size={16} color="var(--amber)" />
        <div style={{ flex: 1 }}>
          <h3>Peças aplicadas</h3>
          <div className="sub">{links.length} item(ns) nesta ordem</div>
        </div>
      </div>
      <div className="card-pad">
        <form className="parts-add" onSubmit={add}>
          <Field label="Peça">
            <select className="select" value={pieceId} onChange={(e) => setPieceId(e.target.value)}>
              <option value="">Selecione uma peça…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {money(p.price)} ({p.quantity} em estoque)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qtd.">
            <input
              className="input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
          <button className="btn btn-primary" disabled={busy || !pieceId}>
            <Plus size={15} /> Adicionar
          </button>
        </form>

        {links.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', padding: '18px 0' }}>
            Nenhuma peça registrada nesta ordem.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Peça</th>
                  <th className="num">Unitário</th>
                  <th className="num">Qtd.</th>
                  <th className="num">Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {links.map((l) => {
                  const p = pieceById[l.pieceId]
                  const unit = Number(p?.price) || 0
                  return (
                    <tr key={l.pieceId}>
                      <td className="cell-strong">{p?.name || `Peça #${l.pieceId}`}</td>
                      <td className="num">{money(unit)}</td>
                      <td className="num" style={{ width: 90 }}>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          defaultValue={l.quantityUsed}
                          style={{ padding: '6px 8px', textAlign: 'right' }}
                          onBlur={(e) => {
                            if (Number(e.target.value) !== l.quantityUsed) changeQty(l, e.target.value)
                          }}
                        />
                      </td>
                      <td className="num money">{money(unit * l.quantityUsed)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-sm btn-icon btn-danger" onClick={() => remove(l)}>
                            <Trash2 size={13} />
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
      </div>
    </div>
  )
}
