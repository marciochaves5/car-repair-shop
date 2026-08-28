import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Package,
  ClipboardList,
  LogOut,
  Menu,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from '../utils/format.js'

const NAV = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/ordens', label: 'Ordens de serviço', icon: ClipboardList },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/veiculos', label: 'Veículos', icon: Car },
  { to: '/mecanicos', label: 'Mecânicos', icon: Wrench },
  { to: '/pecas', label: 'Peças & estoque', icon: Package },
]

const TITLES = {
  '/': 'Painel de controle',
  '/ordens': 'Ordens de serviço',
  '/clientes': 'Clientes',
  '/veiculos': 'Veículos',
  '/mecanicos': 'Mecânicos',
  '/pecas': 'Peças & estoque',
}

export default function Layout() {
  const { email, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const title =
    TITLES[pathname] ||
    (pathname.startsWith('/ordens/') ? 'Detalhe da ordem' : 'Oficina')

  return (
    <div className="app-shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Wrench size={22} />
          </div>
          <div className="brand-text">
            <b>OFICINA</b>
            <span>Gestão</span>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">Operação</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} className="nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-avatar">{initials(email || 'AD')}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Administrador</div>
              <div className="u-mail">{email}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1>{title}</h1>
          </div>
          <div className="topbar-spacer" />
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
