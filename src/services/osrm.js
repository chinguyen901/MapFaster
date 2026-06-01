const BASE = import.meta.env.VITE_OSRM_BASE_URL

export async function fetchRoutes(origin, destination) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  const url = `${BASE}/route/v1/driving/${coords}?alternatives=3&steps=true&geometries=geojson&overview=full&annotations=false`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM lỗi: ${res.status}`)
  const data = await res.json()
  if (data.code !== 'Ok') throw new Error('Không tìm được đường đi')
  return data.routes
}
