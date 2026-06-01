export function getBoundsFromRoute(route) {
  const coords = route.geometry?.coordinates ?? []
  if (!coords.length) return null
  const lats = coords.map(c => c[1])
  const lngs = coords.map(c => c[0])
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ]
}

export function coordsToLatLngs(geojsonCoords) {
  return geojsonCoords.map(([lng, lat]) => [lat, lng])
}
