import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Mechanics from './pages/Mechanics.jsx'
import Pieces from './pages/Pieces.jsx'
import WorkOrders from './pages/WorkOrders.jsx'
import WorkOrderDetail from './pages/WorkOrderDetail.jsx'

function Protected({ children }) {
  const { isAuthed } = useAuth()
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthed } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthed ? <Navigate to="/" replace /> : <Login />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/ordens" element={<WorkOrders />} />
        <Route path="/ordens/:id" element={<WorkOrderDetail />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/veiculos" element={<Vehicles />} />
        <Route path="/mecanicos" element={<Mechanics />} />
        <Route path="/pecas" element={<Pieces />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
