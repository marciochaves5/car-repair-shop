import { useCallback, useEffect, useState } from 'react'

// Loads a list resource and exposes a refetch handle.
export function useCollection(loader, deps = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return Promise.resolve(loader())
      .then((res) => setData(Array.isArray(res) ? res : res ?? []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { data, setData, loading, error, refetch: load }
}
