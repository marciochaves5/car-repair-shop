import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

let seq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++seq
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }

  const Icon = { success: CheckCircle2, error: XCircle, info: Info }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => {
          const I = Icon[t.type]
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <I size={18} className={`t-icon ${t.type}`} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button className="icon-btn" onClick={() => dismiss(t.id)}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}
