import { useEffect } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import NavigationHeader from './components/NavigationHeader'
import BottomSheet from './components/BottomSheet'
import useGeolocation from './hooks/useGeolocation'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { position, error: geoError } = useGeolocation()
  const setOrigin = useAppStore(s => s.setOrigin)
  const isNavigating = useAppStore(s => s.isNavigating)

  useEffect(() => {
    if (position) setOrigin(position)
  }, [position, setOrigin])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {isNavigating ? (
        <NavigationHeader />
      ) : (
        <SearchBar />
      )}

      <MapView />

      <BottomSheet />

      {geoError && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-red-500 text-white text-sm rounded-xl px-4 py-3 shadow-lg">
          ⚠️ {geoError} — Vui lòng bật GPS và cấp quyền vị trí.
        </div>
      )}
    </div>
  )
}
