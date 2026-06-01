export function rankRoutes(routes) {
  if (!routes?.length) return []

  const minDuration = Math.min(...routes.map(r => r.duration))
  const minDistance = Math.min(...routes.map(r => r.distance))

  return routes
    .map((route, index) => {
      const durationScore = route.duration / minDuration
      const distanceScore = route.distance / minDistance
      const score = durationScore * 0.7 + distanceScore * 0.3

      return {
        ...route,
        originalIndex: index,
        score,
        label: getRouteLabel(index, route, routes)
      }
    })
    .sort((a, b) => a.score - b.score)
}

function getRouteLabel(index, route, allRoutes) {
  const minDuration = Math.min(...allRoutes.map(r => r.duration))
  const minDistance = Math.min(...allRoutes.map(r => r.distance))

  if (route.duration === minDuration) return 'Nhanh nhất'
  if (route.distance === minDistance) return 'Ngắn nhất'
  return `Tuyến ${index + 1}`
}

export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} phút`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function getTurnIcon(maneuver) {
  const type = maneuver?.type
  const modifier = maneuver?.modifier

  if (type === 'arrive') return '🏁'
  if (type === 'depart') return '📍'
  if (type === 'roundabout' || type === 'rotary') return '🔄'

  switch (modifier) {
    case 'left': return '⬅️'
    case 'slight left': return '↖️'
    case 'sharp left': return '↩️'
    case 'right': return '➡️'
    case 'slight right': return '↗️'
    case 'sharp right': return '↪️'
    case 'uturn': return '🔃'
    default: return '⬆️'
  }
}
