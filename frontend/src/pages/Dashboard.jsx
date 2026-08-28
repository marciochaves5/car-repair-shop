import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Timer,
  CircleDollarSign,
  PackageX,
  Users,
  Car,
  ArrowRight,
  Wrench,
} from 'lucide-react'
import { Clients, Vehicles, Mechanics, Pieces, WorkOrders, WorkOrderPieces } from '../api/resources.js'
import { Spinner, ErrorNote, StatusPill } from '../components/ui.jsx'
import { STATUS, normalizeStatus } from '../utils/status.js'
import { money, formatDate } from '../utils/format.js'

const LOW_STOCK = 5
const STATUS_COLORS = ['#4aa8ff', '#f5a623', '#3fd17f', '#9b7cff']

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    let alive = true
    Promise.all([
      WorkOrders.list(),
      Clients.list(),
      Vehicles.list(),
      Mechanics.list(),
      Pieces.list(),
      WorkOrderPieces.list().catch(() => []),
    ])
      .then(([orders, clients, vehicles, mechanics, pieces, wop]) => {
        if (!alive) return
        setState({
          loading: false,
          error: null,
          data: {
            orders: orders || [],
            clients: clients || [],
            vehicles: vehicles || [],
            mechanics: mechanics || [],
            pieces: pieces || [],
            wop: wop || [],
          },
        })
      })
      .catch((error) => alive && setState({ loading: false, error, data: null }))
    return () => {
      alive = false
    }
  }, [])

  const derived = useMemo(() => {
    if (!state.data) return null
    const { orders, clients, vehicles, mechanics, pieces, wop } = state.data

    const byStatus = [0, 0, 0, 0]
    orders.forEach((o) => {
      byStatus[normalizeStatus(o.status)] += 1
    })

    const revenue = orders
      .filter((o) => normalizeStatus(o.status) >= 2)
      .reduce((sum, o) => sum + (Number(o.value) || 0), 0)

    const priceById = Object.fromEntries(pieces.map((p) => [p.id, Number(p.price) || 0]))
    const partsValue = wop.reduce(
      (sum, w) => sum + (priceById[w.pieceId] || 0) * (Number(w.quantityUsed) || 0),
      0,
    )

    const lowStock = pieces.filter((p) => (Number(p.quantity) || 0) <= LOW_STOCK)

    const maxCount = Math.max(1, ...byStatus)
    const chart = STATUS.map((s, i) => ({
      name: s.label,
      short: s.short,
      value: byStatus[i],
      pct: Math.round((byStatus[i] / maxCount) * 100),
      color: STATUS_COLORS[i],
    }))

    const clientById = Object.fromEntries(clients.map((c) => [c.id, c]))
    const vehicleById = Object.fromEntries(vehicles.map((v) => [v.id, v]))

    const recent = [...orders]
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      .slice(0, 6)
      .map((o) => ({
        ...o,
        clientName: clientById[o.clientId]?.name || `Cliente #${o.clientId}`,
        vehicleLabel: vehicleById[o.vehicleId]
          ? `${vehicleById[o.vehicleId].mark} ${vehicleById[o.vehicleId].model} · ${vehicleById[o.vehicleId].plate}`
          : `Veículo #${o.vehicleId}`,
      }))

    return {
      counts: {
        open: byStatus[0],
        progress: byStatus[1],
        active: byStatus[0] + byStatus[1],
        total: orders.length,
        clients: clients.length,
        vehicles: vehicles.length,
        mechanics: mechanics.length,
        pieces: pieces.length,
      },
      revenue,
      partsValue,
      lowStock,
      chart,
      recent,
      hasOrders: orders.length > 0,
    }
  }, [state.data])

  if (state.loading) return <div className="page"><Spinner /></div>
  if (state.error)
    return (
      <div className="page">
        <ErrorNote error={state.error} onRetry={() => window.location.reload()} />
      </div>
    )

  const d = derived

  return (
    <div className="page">
      <div className="kpi-grid">
        <Kpi
          icon={ClipboardList}
          accent="var(--blue)"
          value={d.counts.active}
          label="Ordens em aberto"
          foot={`${d.counts.open} aguardando · ${d.counts.progress} em andamento`}
        />
        <Kpi
          icon={Timer}
          accent="var(--amber)"
          value={d.counts.total}
          label="Ordens no total"
          foot="Histórico completo da oficina"
        />
        <Kpi
          icon={CircleDollarSign}
          accent="var(--green)"
          value={money(d.revenue)}
          label="Faturamento realizado"
          foot={`+ ${money(d.partsValue)} em peças aplicadas`}
        />
        <Kpi
          icon={PackageX}
          accent="var(--red)"
          value={d.lowStock.length}
          label="Peças em baixa"
          foot={
            d.lowStock.length
              ? d.lowStock.slice(0, 3).map((p) => p.name).join(', ')
              : 'Estoque saudável'
          }
        />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <ClipboardList size={17} color="var(--amber)" />
            <div style={{ flex: 1 }}>
              <h3>Ordens recentes</h3>
              <div className="sub">Últimas entradas no pátio</div>
            </div>
            <Link to="/ordens" className="btn btn-sm btn-ghost">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          {d.recent.length === 0 ? (
            <div className="empty">
              <ClipboardList size={40} strokeWidth={1.4} />
              <h4>Nenhuma ordem ainda</h4>
              <p>Crie a primeira ordem de serviço para começar.</p>
            </div>
          ) : (
            d.recent.map((o) => (
              <Link key={o.id} to={`/ordens/${o.id}`} className="recent-item">
                <span className="ri-no">#{o.number}</span>
                <span className="ri-main">
                  <span className="ri-title">{o.clientName}</span>
                  <span className="ri-sub">
                    {o.vehicleLabel} · entrada {formatDate(o.entryDate)}
                  </span>
                </span>
                <StatusPill status={o.status} />
              </Link>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <Wrench size={17} color="var(--amber)" />
            <div>
              <h3>Distribuição por status</h3>
              <div className="sub">Onde estão as ordens agora</div>
            </div>
          </div>
          <div className="card-pad">
            {d.hasOrders ? (
              <div className="bars">
                {d.chart.map((row) => (
                  <div className="bar-row" key={row.name}>
                    <span className="bar-label">{row.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.max(row.pct, row.value ? 6 : 0)}%`, background: row.color }}
                      />
                    </div>
                    <span className="bar-value">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-faint)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
                Sem dados para exibir.
              </p>
            )}

            <div className="divider" />
            <div className="stat-inline">
              <div>
                <div className="si-label">
                  <Users size={12} style={{ verticalAlign: -2, marginRight: 5 }} />
                  Clientes
                </div>
                <div className="si-value">{d.counts.clients}</div>
              </div>
              <div>
                <div className="si-label">
                  <Car size={12} style={{ verticalAlign: -2, marginRight: 5 }} />
                  Veículos
                </div>
                <div className="si-value">{d.counts.vehicles}</div>
              </div>
              <div>
                <div className="si-label">
                  <Wrench size={12} style={{ verticalAlign: -2, marginRight: 5 }} />
                  Mecânicos
                </div>
                <div className="si-value">{d.counts.mechanics}</div>
              </div>
              <div>
                <div className="si-label">Peças cadastradas</div>
                <div className="si-value">{d.counts.pieces}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, value, label, foot, accent }) {
  return (
    <div className="kpi" style={{ '--accent': accent }}>
      <div className="kpi-icon">
        <Icon size={20} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  )
}
