import { useState, useCallback, useRef } from 'react'
import { searchAddress } from '../services/geocoding'
import { useAppStore } from '../store/useAppStore'

export default function useGeocoding() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const origin = useAppStore(s => s.origin)
  const debounceRef = useRef(null)

  const search = useCallback((query) => {
    if (!query || query.length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchAddress(query, origin?.lat, origin?.lng)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [origin])

  const clear = useCallback(() => setResults([]), [])

  return { results, loading, search, clear }
}
