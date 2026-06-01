import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useAppStore } from '../store/useAppStore'
import { getBoundsFromRoute, coordsToLatLngs } from '../utils/mapHelpers'

const COLORS = {
  best: '#00C853',
  alt: '#9E9E9E',
  altHover: '#616161'
}

export default function MapView() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const userMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeLayersRef = useRef([])

  const origin = useAppStore(s => s.origin)
  const destination = useAppStore(s => s.destination)
  const routes = useAppStore(s => s.routes)
  const selectedRouteIndex = useAppStore(s => s.selectedRouteIndex)
  const selectRoute = useAppStore(s => s.selectRoute)

  // Init map
  useEffect(() => {
    if (mapInstance.current) return
    mapInstance.current = L.map(mapRef.current, {
      center: [10.7769, 106.7009],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance.current)

    L.control.attribution({ position: 'bottomleft', prefix: '© OSM' }).addTo(mapInstance.current)
  }, [])

  // User location marker
  useEffect(() => {
    if (!mapInstance.current || !origin) return
    const latlng = [origin.lat, origin.lng]

    if (!userMarkerRef.current) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;background:#1A73E8;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(26,115,232,0.6)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
      userMarkerRef.current = L.marker(latlng, { icon, zIndexOffset: 1000 }).addTo(mapInstance.current)
      mapInstance.current.setView(latlng, 15)
    } else {
      userMarkerRef.current.setLatLng(latlng)
    }
  }, [origin])

  // Destination marker
  useEffect(() => {
    if (!mapInstance.current) return
    if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }
    if (!destination) return

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;background:#FF6D00;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(255,109,0,0.6)"><div style="transform:rotate(45deg);width:100%;height:100%"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    })
    destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon })
      .addTo(mapInstance.current)
      .bindPopup(`<b>${destination.name}</b>`, { className: 'route-popup' })
  }, [destination])

  // Draw routes
  useEffect(() => {
    if (!mapInstance.current) return
    routeLayersRef.current.forEach(l => l.remove())
    routeLayersRef.current = []
    if (!routes.length) return

    routes.forEach((route, i) => {
      const coords = coordsToLatLngs(route.geometry.coordinates)
      const isBest = i === 0
      const isSelected = i === selectedRouteIndex

      const line = L.polyline(coords, {
        color: isBest ? COLORS.best : COLORS.alt,
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1 : 0.55,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance.current)

      line.on('click', () => selectRoute(i))
      routeLayersRef.current.push(line)
    })

    const bounds = getBoundsFromRoute(routes[0])
    if (bounds) mapInstance.current.fitBounds(bounds, { padding: [80, 20] })
  }, [routes, selectedRouteIndex, selectRoute])

  // Update selected route style
  useEffect(() => {
    routeLayersRef.current.forEach((line, i) => {
      const isBest = i === 0
      const isSelected = i === selectedRouteIndex
      line.setStyle({
        color: isBest ? COLORS.best : (isSelected ? COLORS.altHover : COLORS.alt),
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1 : 0.55
      })
    })
  }, [selectedRouteIndex])

  return (
    <div className="absolute inset-0 top-[64px]">
      <div ref={mapRef} className="w-full h-full" />

      {/* Recenter button */}
      {origin && (
        <button
          onClick={() => mapInstance.current?.setView([origin.lat, origin.lng], 16)}
          className="absolute bottom-[220px] right-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-xl"
          aria-label="Về vị trí của tôi"
        >
          📍
        </button>
      )}
    </div>
  )
}
