import { useState, useRef } from 'react'
import RoutePanel from './RoutePanel'
import { useAppStore } from '../store/useAppStore'

const SNAP_COLLAPSED = 110
const SNAP_EXPANDED = 420

export default function BottomSheet() {
  const [height, setHeight] = useState(SNAP_COLLAPSED)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const startH = useRef(0)
  const isNavigating = useAppStore(s => s.isNavigating)
  const routes = useAppStore(s => s.routes)

  const expanded = height >= (SNAP_COLLAPSED + SNAP_EXPANDED) / 2

  // Auto-expand when routes arrive
  const prevRoutesLen = useRef(0)
  if (routes.length !== prevRoutesLen.current) {
    prevRoutesLen.current = routes.length
    if (routes.length > 0 && height < SNAP_EXPANDED) {
      setHeight(SNAP_EXPANDED)
    }
  }

  const onPointerDown = (e) => {
    setDragging(true)
    startY.current = e.clientY ?? e.touches?.[0]?.clientY
    startH.current = height
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    const y = e.clientY ?? e.touches?.[0]?.clientY
    const delta = startY.current - y
    const newH = Math.min(SNAP_EXPANDED, Math.max(80, startH.current + delta))
    setHeight(newH)
  }

  const onPointerUp = () => {
    setDragging(false)
    setHeight(expanded ? SNAP_EXPANDED : SNAP_COLLAPSED)
  }

  const toggleExpand = () => setHeight(expanded ? SNAP_COLLAPSED : SNAP_EXPANDED)

  if (isNavigating) return null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl flex flex-col transition-[height] duration-200"
      style={{ height, touchAction: 'none' }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={toggleExpand}
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <RoutePanel />
      </div>
    </div>
  )
}
