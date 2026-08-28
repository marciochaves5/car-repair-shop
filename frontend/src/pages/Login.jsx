import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, ShieldCheck, Gauge, ClipboardList, Loader2, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') await login({ email, password })
      else await register({ email, password })
      toast.success(mode === 'login' ? 'Bem-vindo de volta!' : 'Conta criada com sucesso.')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand">
          <div className="brand-mark">
            <Wrench size={26} />
          </div>
          <div className="brand-text">
            <b>OFICINA</b>
            <span>Gestão</span>
          </div>
        </div>

        <div className="auth-hero">
          <h2>
            O pátio da sua oficina, <span>sob controle</span>.
          </h2>
          <p>
            Clientes, veículos, mecânicos, estoque de peças e ordens de serviço — tudo em um
            painel só, do orçamento à entrega.
          </p>

          <div className="auth-feats">
            <div className="auth-feat">
              <span className="fi">
                <ClipboardList size={17} />
              </span>
              Ordens de serviço com fluxo de status ponta a ponta
            </div>
            <div className="auth-feat">
              <span className="fi">
                <Package size={17} />
              </span>
              Controle de estoque com alerta de peças em baixa
            </div>
            <div className="auth-feat">
              <span className="fi">
                <Gauge size={17} />
              </span>
              Indicadores de faturamento e produtividade em tempo real
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>
          <ShieldCheck size={13} style={{ verticalAlign: -2, marginRight: 6 }} />
          Acesso protegido por JWT · perfil Administrador
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>{mode === 'login' ? 'Entrar no painel' : 'Criar conta'}</h1>
          <p className="lead">
            {mode === 'login'
              ? 'Use suas credenciais de administrador.'
              : 'A primeira conta já entra como administrador.'}
          </p>

          <div className="auth-toggle">
            <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>
              Entrar
            </button>
            <button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>
              Registrar
            </button>
          </div>

          <form className="auth-fields" onSubmit={submit}>
            <div className="field">
              <label>E-mail</label>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@oficina.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="mínimo 6 caracteres, com número"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="auth-err">{error}</div>}

            <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={busy}>
              {busy && <Loader2 size={16} className="spin-inline" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
