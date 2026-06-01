import { useState, useEffect, useRef } from 'react'

export default function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS')
      return
    }

    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed
        })
        setError(null)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Bạn đã từ chối quyền vị trí')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Không xác định được vị trí')
            break
          case err.TIMEOUT:
            setError('GPS quá chậm, thử lại')
            break
          default:
            setError('Lỗi GPS không xác định')
        }
      },
      options
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { position, error }
}
