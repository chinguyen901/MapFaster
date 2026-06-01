const NOMINATIM = import.meta.env.VITE_NOMINATIM_BASE_URL
const USER_AGENT = 'MapFaster/1.0 (chinguyen10022000@gmail.com)'

export async function searchAddress(query, nearLat, nearLng) {
  const params = new URLSearchParams({
    q: query,
    countrycodes: 'vn',
    format: 'json',
    limit: '6',
    addressdetails: '1',
    ...(nearLat && nearLng ? { viewbox: buildViewbox(nearLat, nearLng), bounded: '0' } : {})
  })

  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'vi,en' }
  })
  if (!res.ok) throw new Error('Không thể tìm địa chỉ')
  const data = await res.json()

  return data.map(item => ({
    id: item.place_id,
    name: extractName(item),
    address: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon)
  }))
}

function buildViewbox(lat, lng) {
  const delta = 0.15
  return `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`
}

function extractName(item) {
  return item.namedetails?.name
    || item.address?.amenity
    || item.address?.road
    || item.display_name.split(',')[0]
}
