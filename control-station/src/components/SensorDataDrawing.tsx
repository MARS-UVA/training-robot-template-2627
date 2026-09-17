import { useRef, useEffect } from 'react'
import { type SensorData } from '../hooks/useSensorData'

type Props = { data: SensorData }

// Canvas dimension in CSS pixels (scaled down from 500 for dashboard fit).
// scale = CANVAS / 500 keeps all proportions identical at any canvas size.
const CANVAS = 170
const scale = CANVAS / 500 // 0.34
const C = CANVAS / 2 // center point (85, 85)

// Distance scale: a reading of 100 "units" maps to the canvas edge.
// Derived from C so "100 units = canvas edge" stays intact automatically.
const MAX_RANGE = 100
const PX_PER_UNIT = C / MAX_RANGE // 0.85 px per unit

// Wall segment: 40 * scale px long, drawn perpendicular to sensor ray
const WALL_SEG = Math.round(40 * scale) // 14
const WALL_HW = Math.round(WALL_SEG / 2) // 7
const WALL_LW = Math.max(Math.round(5 * scale), 1) // 2

// Robot body dimensions scaled from 42×62
const ROBOT_W = Math.round(42 * scale) // 14
const ROBOT_H = Math.round(62 * scale) // 21

// Helper: scale a base pixel value, floored at `min`
function scl(base: number, min: number = 1): number {
  return Math.max(Math.round(base * scale), min)
}

/** Convert heading (degrees, 0 = facing up/north, clockwise positive) to a canvas angle in radians.
 *  Canvas convention: 0 rad = east, positive = clockwise.
 *  heading 0° → canvas angle 0 → direction (0, -1) = up ✓
 */
function headingToAngle(heading: number): number {
  return heading * Math.PI / 180
}

/** Direction vector for a given heading (0 = facing up/north in canvas coords). */
function headingVec(heading: number): { x: number; y: number } {
  const a = headingToAngle(heading)
  return { x: Math.sin(a), y: -Math.cos(a) }
}

/** Clamp (x, y) to stay inside the canvas with a margin. */
function clampToCanvas(x: number, y: number, margin: number = scl(20, 5)): [number, number] {
  return [
    Math.max(margin, Math.min(CANVAS - margin, x)),
    Math.max(margin, Math.min(CANVAS - margin, y))
  ]
}

/** Draw a rounded rectangle path (fallback for browsers without native roundRect). */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** Sanitize a distance reading: clamp negative/NaN to 0.
 *  Robots sometimes report -1 for invalid readings; we draw the wall at the
 *  robot center so an invalid reading is visually obvious (wall overlaps robot).
 */
function sanitizeDist(d: number): number {
  if (Number.isNaN(d) || !Number.isFinite(d) || d < 0) return 0
  return d
}

/** Sanitize a heading value: default to 0 if NaN/invalid. */
function sanitizeHeading(h: number): number {
  if (Number.isNaN(h) || !Number.isFinite(h)) return 0
  return h
}

export function SensorDataDrawing({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Handle device pixel ratio for crisp rendering on HiDPI displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS * dpr
    canvas.height = CANVAS * dpr
    // setTransform resets any previous transform and applies DPR scaling,
    // so all drawing coordinates are in CSS-pixel space (0–170).
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, CANVAS, CANVAS)

    // --- Background & subtle grid ---
    ctx.fillStyle = '#0a0e17'
    ctx.fillRect(0, 0, CANVAS, CANVAS)

    ctx.strokeStyle = '#151c2c'
    ctx.lineWidth = 1
    for (let i = Math.round(50 * scale); i < CANVAS; i += Math.round(50 * scale)) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS, i); ctx.stroke()
    }

    // Center crosshair (subtle reference)
    const crossSize = scl(8, 2)
    ctx.strokeStyle = '#1e2636'
    ctx.beginPath()
    ctx.moveTo(C - crossSize, C); ctx.lineTo(C + crossSize, C)
    ctx.moveTo(C, C - crossSize); ctx.lineTo(C, C + crossSize)
    ctx.stroke()

    // --- Robot ---
    const heading = sanitizeHeading(data.heading)
    const angle = headingToAngle(heading)
    const fwd = headingVec(heading) // forward direction in canvas coords

    // Save/restore so the robot rotation doesn't affect wall drawing
    ctx.save()
    ctx.translate(C, C)
    ctx.rotate(angle)
    // In local coordinates the robot faces -Y (up). Rotate by `angle`
    // puts the front pointing in the correct world direction.

    // Body rectangle
    ctx.fillStyle = '#22d3ee'
    drawRoundRect(ctx, -ROBOT_W / 2, -ROBOT_H / 2, ROBOT_W, ROBOT_H, scl(4, 1))
    ctx.fill()

    // Nose / heading indicator: small triangle at the front
    const noseLen = scl(10, 2)
    const noseBase = scl(5, 2)
    ctx.fillStyle = '#67e8f9'
    ctx.beginPath()
    ctx.moveTo(0, -ROBOT_H / 2 - noseLen)
    ctx.lineTo(-noseBase, -ROBOT_H / 2)
    ctx.lineTo(noseBase, -ROBOT_H / 2)
    ctx.closePath()
    ctx.fill()

    // Center dot (visual anchor)
    const dotR = scl(3, 2)
    ctx.fillStyle = '#67e8f9'
    ctx.beginPath()
    ctx.arc(0, 0, dotR, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // --- Sensor walls & distance labels ---
    // Font sizes floored for legibility at small canvas size
    const labelFontSize = Math.max(Math.round(12 * scale), 10)
    const placeholderFontSize = Math.max(Math.round(16 * scale), 10)

    if (data.received && data.ultrasonic.length >= 3) {
      // Index 0=left, 1=front, 2=right — matches ROS side convention
      const sensorDefs = [
        { idx: 0, offDeg: -90, color: '#fb923c' }, // left sensor
        { idx: 1, offDeg: 0,  color: '#fbbf24' }, // front sensor
        { idx: 2, offDeg: 90, color: '#fb923c' }, // right sensor
      ]

      // Label offsets scaled from base values, floored for legibility
      const labelOffset = scl(14, 4)
      const headingLabelOffset = scl(45, 8)

      for (const s of sensorDefs) {
        const rawDist = sanitizeDist(data.ultrasonic[s.idx])
        // Draw the wall at its true distance — readings >100 push the wall
        // off-canvas (it gets clipped naturally at the edge).
        const distPx = rawDist * PX_PER_UNIT

        const sensorHeading = heading + s.offDeg
        const dir = headingVec(sensorHeading)

        // Wall center position along the sensor ray
        const wcx = C + distPx * dir.x
        const wcy = C + distPx * dir.y

        // Perpendicular to the ray direction
        const px = -dir.y
        const py = dir.x

        // Wall segment: short line perpendicular to the ray
        const x1 = wcx - WALL_HW * px
        const y1 = wcy - WALL_HW * py
        const x2 = wcx + WALL_HW * px
        const y2 = wcy + WALL_HW * py

        ctx.strokeStyle = s.color
        ctx.lineWidth = WALL_LW
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // --- Label positioning ---
        let lx: number
        let ly: number

        if (rawDist > MAX_RANGE) {
          // >100 reading: label stays on-canvas at the clamped edge position
          const edgePx = MAX_RANGE * PX_PER_UNIT
          lx = C + edgePx * dir.x
          ly = C + edgePx * dir.y
        } else {
          // Normal: label slightly beyond the wall along the ray
          lx = wcx + labelOffset * dir.x
          ly = wcy + labelOffset * dir.y
        }
        // Guarantee label never goes off-canvas
        const labelPos = clampToCanvas(lx, ly, scl(20, 5))
        lx = labelPos[0]
        ly = labelPos[1]

        const labelText = rawDist.toFixed(2)
        ctx.font = `bold ${labelFontSize}px system-ui, sans-serif`
        const tw = ctx.measureText(labelText).width
        const th = Math.round(labelFontSize * 1.2)
        const pad = Math.max(Math.round(3 * scale), 1) // 1-2px padding

        // Semi-transparent dark backdrop for readability
        ctx.fillStyle = 'rgba(10, 14, 23, 0.8)'
        drawRoundRect(ctx, lx - tw / 2 - pad, ly - th / 2 - pad, tw + pad * 2, th + pad * 2, scl(3, 1))
        ctx.fill()

        ctx.fillStyle = '#e2e8f0'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(labelText, lx, ly)
      }

      // --- Heading label ---
      // Placed ahead of the robot in its own forward direction, rotating with robot.
      const headingText = `H: ${heading.toFixed(2)}°`
      ctx.font = `bold ${labelFontSize}px system-ui, sans-serif`
      const htw = ctx.measureText(headingText).width
      const hth = Math.round(labelFontSize * 1.2)
      const hpad = Math.max(Math.round(3 * scale), 1)

      const headingLabelPos = clampToCanvas(
        C + headingLabelOffset * fwd.x,
        C + headingLabelOffset * fwd.y,
        scl(20, 5)
      )
      const hlx = headingLabelPos[0]
      const hly = headingLabelPos[1]

      // Semi-transparent dark backdrop for readability
      ctx.fillStyle = 'rgba(10, 14, 23, 0.8)'
      drawRoundRect(ctx, hlx - htw / 2 - hpad, hly - hth / 2 - hpad, htw + hpad * 2, hth + hpad * 2, scl(3, 1))
      ctx.fill()

      ctx.fillStyle = '#22d3ee'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(headingText, hlx, hly)
    } else if (!data.received) {
      // Graceful placeholder when no data has been received yet
      ctx.fillStyle = '#4a5568'
      ctx.font = `${placeholderFontSize}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('No sensor data', C, C)
    }
  }, [data])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: CANVAS, height: CANVAS }}
    />
  )
}
