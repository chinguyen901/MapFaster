import { useAppStore } from '../store/useAppStore'
import { getTurnIcon, formatDistance } from '../services/routeCompare'

export default function NavigationHeader() {
  const routes = useAppStore(s => s.routes)
  const selectedRouteIndex = useAppStore(s => s.selectedRouteIndex)
  const currentStepIndex = useAppStore(s => s.currentStepIndex)
  const stopNavigation = useAppStore(s => s.stopNavigation)
  const nextStep = useAppStore(s => s.nextStep)

  const steps = routes[selectedRouteIndex]?.legs?.[0]?.steps ?? []
  const step = steps[currentStepIndex]
  const nextStepData = steps[currentStepIndex + 1]

  if (!step) return null

  const distToNext = step.distance
  const instruction = step.name && step.name !== ''
    ? step.name
    : 'Tiếp tục đi thẳng'

  return (
    <div
      className="absolute top-0 left-0 right-0 z-40 text-white"
      style={{ background: 'var(--color-nav-bg)' }}
    >
      {/* Main instruction */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-3">
        <div className="text-4xl leading-none">
          {getTurnIcon(step.maneuver)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {formatDistance(distToNext)}
          </div>
          <div className="text-lg font-bold truncate">{instruction}</div>
        </div>
        <button
          onClick={stopNavigation}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-base flex-shrink-0"
          aria-label="Kết thúc dẫn đường"
        >
          ✕
        </button>
      </div>

      {/* Next step preview */}
      {nextStepData && (
        <div className="flex items-center gap-3 px-4 py-2 bg-black/20 border-t border-white/10">
          <span className="text-lg opacity-70">{getTurnIcon(nextStepData.maneuver)}</span>
          <span className="text-sm text-gray-300 truncate">
            Sau đó: {nextStepData.name || 'tiếp tục'}
          </span>
          <button
            onClick={nextStep}
            className="ml-auto text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
          >
            Tiếp →
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-green-400 transition-all duration-300"
          style={{ width: `${steps.length ? ((currentStepIndex + 1) / steps.length) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}
