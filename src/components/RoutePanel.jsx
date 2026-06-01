import { useAppStore } from '../store/useAppStore'
import { formatDuration, formatDistance } from '../services/routeCompare'

export default function RoutePanel() {
  const routes = useAppStore(s => s.routes)
  const selectedRouteIndex = useAppStore(s => s.selectedRouteIndex)
  const selectRoute = useAppStore(s => s.selectRoute)
  const startNavigation = useAppStore(s => s.startNavigation)
  const isLoading = useAppStore(s => s.isLoading)
  const error = useAppStore(s => s.error)
  const destination = useAppStore(s => s.destination)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Đang tính đường đi...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 px-2">
        <p className="text-sm text-red-500 text-center">{error}</p>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-sm text-gray-400 text-center">
          Nhập địa chỉ để tìm đường nhanh nhất
        </p>
        <div className="flex gap-4 text-2xl mt-1">
          <span>🛵</span><span>📦</span><span>⚡</span>
        </div>
      </div>
    )
  }

  if (!routes.length) return null

  const selected = routes[selectedRouteIndex] ?? routes[0]

  return (
    <div className="flex flex-col gap-3">
      {/* Destination summary */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-orange-500 text-lg">📌</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Điểm đến</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{destination.name}</p>
        </div>
      </div>

      {/* Route cards */}
      <div className="flex flex-col gap-2">
        {routes.map((route, i) => {
          const isSelected = i === selectedRouteIndex
          const isBest = i === 0
          return (
            <button
              key={i}
              onClick={() => selectRoute(i)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              {/* Route color dot */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isBest ? 'bg-green-500' : 'bg-gray-400'}`} />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {formatDuration(route.duration)}
                  </span>
                  {isBest && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                      ĐỀ XUẤT
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-medium ml-auto">
                    {route.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDistance(route.distance)}
                </p>
              </div>

              {isSelected && <span className="text-blue-500 text-lg">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Start button */}
      <button
        onClick={startNavigation}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-md transition-colors"
      >
        🚀 BẮT ĐẦU DẪN ĐƯỜNG
      </button>

      {/* Selected route summary */}
      <div className="flex justify-center gap-6 text-sm text-gray-500 pb-1">
        <span>🛣️ {formatDistance(selected.distance)}</span>
        <span>⏱️ {formatDuration(selected.duration)}</span>
        <span>↩️ {selected.legs?.[0]?.steps?.length ?? 0} bước</span>
      </div>
    </div>
  )
}
