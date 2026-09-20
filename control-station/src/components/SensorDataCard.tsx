import type { SensorData } from '../hooks/useSensorData'

type Props = {
  data: SensorData
}

export function SensorDataCard({ data }: Props) {
  const maxVisualDistance = 3
  const toGap = (distance: number | undefined) => {
    if (distance === undefined || !Number.isFinite(distance)) return 0

    return Math.min(Math.max(distance, 0) / maxVisualDistance, 1) * 72
  }

  const leftDistance = data.ultrasonic[0]
  const frontDistance = data.ultrasonic[1]
  const rightDistance = data.ultrasonic[2]

  return (
    <div className="card">
      <h2>Incoming Sensor Data</h2>
      <p>
        <strong>Topic:</strong> <code>/ultrasonic</code> and <code>/heading</code>
      </p>
      <div
        className="sensor-map"
        style={
          {
            '--left-gap': `${toGap(leftDistance)}px`,
            '--front-gap': `${toGap(frontDistance)}px`,
            '--right-gap': `${toGap(rightDistance)}px`,
          } as React.CSSProperties
        }
        aria-label="Robot distance visualization"
      >
        <div className="sensor-wall sensor-wall-left" />
        <div className="sensor-wall sensor-wall-front" />
        <div className="sensor-wall sensor-wall-right" />
        <div className="sensor-robot">ROBOT</div>
      </div>
      <div className="data-display">
        <p>Heading: {data.heading}</p>
        <p>Left: {leftDistance ?? 'Waiting...'}</p>
        <p>Front: {frontDistance ?? 'Waiting...'}</p>
        <p>Right: {rightDistance ?? 'Waiting...'}</p>
      </div>
    </div>
  )
}
