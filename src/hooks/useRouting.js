import { useCallback } from 'react'
import { fetchRoutes } from '../services/osrm'
import { rankRoutes } from '../services/routeCompare'
import { useAppStore } from '../store/useAppStore'

export default function useRouting() {
  const origin = useAppStore(s => s.origin)
  const setRoutes = useAppStore(s => s.setRoutes)
  const setLoading = useAppStore(s => s.setLoading)
  const setError = useAppStore(s => s.setError)

  const calculate = useCallback(async (destination) => {
    if (!origin) { setError('Chưa có vị trí hiện tại'); return }
    setLoading(true)
    setError(null)
    try {
      const raw = await fetchRoutes(origin, destination)
      setRoutes(rankRoutes(raw))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [origin, setRoutes, setLoading, setError])

  return { calculate }
}
