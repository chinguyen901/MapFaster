import { useState, useRef, useEffect } from 'react'
import useGeocoding from '../hooks/useGeocoding'
import useRouting from '../hooks/useRouting'
import { useAppStore } from '../store/useAppStore'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const { results, loading, search, clear } = useGeocoding()
  const { calculate } = useRouting()
  const setDestination = useAppStore(s => s.setDestination)
  const destination = useAppStore(s => s.destination)
  const reset = useAppStore(s => s.reset)

  useEffect(() => {
    search(query)
  }, [query, search])

  const handleSelect = (item) => {
    setDestination(item)
    setQuery(item.name)
    clear()
    setFocused(false)
    inputRef.current?.blur()
    calculate(item)
  }

  const handleClear = () => {
    setQuery('')
    clear()
    reset()
    inputRef.current?.focus()
  }

  const showDropdown = focused && (results.length > 0 || loading || query.length >= 2)

  return (
    <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-3 pb-1">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg px-3 h-14">
        <span className="text-2xl">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Nhập địa chỉ giao hàng..."
          className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder-gray-400"
        />
        {(query || destination) && (
          <button onClick={handleClear} className="text-gray-400 text-xl px-1">✕</button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div className="mt-1 bg-white rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-3 px-4 py-3 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Đang tìm...
            </div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-4 text-gray-400 text-sm text-center">
              Không tìm thấy địa chỉ phù hợp
            </div>
          )}
          {results.map(item => (
            <button
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 border-b border-gray-100 last:border-0 text-left"
            >
              <span className="text-lg mt-0.5">📌</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{item.address}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
