import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { Pieces } from '../api/resources.js'
import { useCollection } from '../hooks/useCollection.js'
import { useToast } from '../context/ToastContext.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { Spinner, EmptyState, ErrorNote, Field } from '../components/ui.jsx'
import { money } from '../utils/format.js'

const EMPTY = { name: '', quantity: 0, price: 0 }
const LOW = 5

export default function PiecesPage() {
  const toast = useToast()
  const { data, loading, error, refetch } = useCollection(() => Pieces.list(), [])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((p) => String(p.name || '').toLowerCase().includes(q))
  }, [data, query])

  const stats = useMemo(() => {
    const totalValue = data.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0)
    const low = data.filter((p) => (Number(p.quantity) || 0) <= LOW).length
    const units = data.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    return { totalValue, low, units }
  }, [data])

  return (
    <div className="page">
      {!loading && !error && data.length > 0 && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Kpi icon={TrendingUp} accent="var(--green)" value={money(stats.totalValue)} label="Valor imobilizado em estoque" />
          <Kpi icon={Package} accent="var(--blue)" value={stats.units} label="Unidades em estoque" />
          <Kpi icon={AlertTriangle} accent="var(--red)" value={stats.low} label={`Itens no nível crítico (≤ ${LOW})`} />
        </div>
      )}

      <div className="toolbar">
        <div className="search">
          <Search size={16} color="var(--text-faint)" />
          <input placeholder="Buscar peça…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="toolbar-spacer" />
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Plus size={16} /> Nova peça
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title={query ? 'Nenhuma peça encontrada' : 'Estoque vazio'}
            hint={query ? 'Ajuste a busca.' : 'Cadastre as peças que a oficina utiliza.'}
            action={
              !query && (
                <button className="btn btn-primary" onClick={() => setEditing('new')}>
                  <Plus size={16} /> Nova peça
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
                <th>Peça</th>
                <th className="num">Preço unitário</th>
                <th className="num">Em estoque</th>
                <th className="num">Valor total</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const qty = Number(p.quantity) || 0
                const low = qty <= LOW
                return (
                  <tr key={p.id}>
                    <td className="cell-strong">{p.name}</td>
                    <td className="num">{money(p.price)}</td>
                    <td className="num">
                      <span className={`pill ${low ? 'pill-danger' : 'pill-finished'}`}>
                        <span className="dot" />
                        {qty} un.
                      </span>
                    </td>
                    <td className="num money">{money((Number(p.price) || 0) * qty)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-icon" onClick={() => setEditing(p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-sm btn-icon btn-danger" onClick={() => setToDelete(p)}>
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

      {editing && (
        <PieceForm
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
          title="Excluir peça"
          message={`Remover "${toDelete.name}" do catálogo?`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            try {
              await Pieces.remove(toDelete.id)
              toast.success('Peça removida.')
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

function Kpi({ icon: Icon, value, label, accent }) {
  return (
    <div className="kpi" style={{ '--accent': accent }}>
      <div className="kpi-icon">
        <Icon size={20} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

function PieceForm({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(initial.id)

  function validate() {
    const e = {}
    if (!String(form.name).trim()) e.name = 'Informe o nome da peça.'
    if (Number(form.quantity) < 0 || Number.isNaN(Number(form.quantity))) e.quantity = 'Quantidade inválida.'
    if (Number(form.price) < 0 || Number.isNaN(Number(form.price))) e.price = 'Preço inválido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    const payload = {
      name: String(form.name).trim(),
      quantity: parseInt(form.quantity, 10) || 0,
      price: parseFloat(form.price) || 0,
    }
    try {
      if (isEdit) await Pieces.update(initial.id, payload)
      else await Pieces.create(payload)
      toast.success(isEdit ? 'Peça atualizada.' : 'Peça cadastrada.')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar peça' : 'Nova peça'}
      icon={<Package size={18} color="var(--amber)" />}
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
        <Field label="Nome da peça" error={errors.name}>
          <input
            className={`input ${errors.name ? 'invalid' : ''}`}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
            placeholder="Pastilha de freio dianteira"
          />
        </Field>
        <Field label="Quantidade em estoque" error={errors.quantity}>
          <input
            className={`input ${errors.quantity ? 'invalid' : ''}`}
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </Field>
        <Field label="Preço unitário (R$)" error={errors.price}>
          <input
            className={`input ${errors.price ? 'invalid' : ''}`}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </Field>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  )
}
