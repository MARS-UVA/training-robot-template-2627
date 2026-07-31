import { useCallback, useRef } from 'react'

type Props = {
  value: { x: number; y: number }
  onMove: (x: number, y: number) => void
  onRelease: () => void
}

const SIZE = 180
const KNOB = 52
const TRAVEL = (SIZE - KNOB) / 2

function clampToCircle(dx: number, dy: number, max: number) {
  const mag = Math.hypot(dx, dy)
  if (mag > max && mag > 0) {
    return { x: (dx / mag) * max, y: (dy / mag) * max }
  }
  return { x: dx, y: dy }
}

export function Joystick({ value, onMove, onRelease }: Props) {
  const baseRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current
      if (!base) return
      const rect = base.getBoundingClientRect()
      const dx = clientX - (rect.left + rect.width / 2)
      const dy = clientY - (rect.top + rect.height / 2)
      const clamped = clampToCircle(dx, dy, TRAVEL)
      onMove(clamped.x / TRAVEL, -clamped.y / TRAVEL)
    },
    [onMove],
  )

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    draggingRef.current = true
    updateFromPointer(event.clientX, event.clientY)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromPointer(event.clientX, event.clientY)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onRelease()
  }

  const knobX = value.x * TRAVEL
  const knobY = -value.y * TRAVEL
  const mag = Math.min(1, Math.hypot(value.x, value.y))
  const angle = Math.atan2(knobX, -knobY) * (180 / Math.PI)

  return (
    <div
      ref={baseRef}
      className="joystick"
      style={{ width: SIZE, height: SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="application"
      aria-label="Virtual joystick"
    >
      <div className="joystick-pivot" />
      <div
        className="joystick-stem"
        style={{
          height: Math.max(mag * TRAVEL, 8),
          transform: `translate(calc(-50% + ${knobX / 2}px), calc(-50% + ${knobY / 2}px)) rotate(${angle}deg)`,
        }}
      />
      <div
        className="joystick-knob"
        style={{
          width: KNOB,
          height: KNOB,
          transform: `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`,
        }}
      />
    </div>
  )
}
