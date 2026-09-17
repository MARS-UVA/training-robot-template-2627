import { writeMockSensorData, type SensorData } from '../hooks/useSensorData'
import { SensorDataDrawing } from './SensorDataDrawing'
import { Ros } from 'roslib'

type Props = {
  data: SensorData
  ros: Ros
}

export function SensorDataCard({ data, ros }: Props) {
  // Safe ultrasonic readings with L/F/R labels
  const ultra = data.ultrasonic
  const left = ultra.length > 0 ? ultra[0] : NaN
  const front = ultra.length > 1 ? ultra[1] : NaN
  const right = ultra.length > 2 ? ultra[2] : NaN

  const numberOrNone = (v: number) => Number.isNaN(v) ? '—' : v.toFixed(2)

  return (
    <div className="card">
      <h2>Incoming Sensor Data</h2>
      <strong>Topic:</strong> <code>/ultrasonic</code> and <code>/heading</code>
      <div className="button-row">
        <button type="button" onClick={() => {
          const randomData: SensorData = {
            ultrasonic: [Math.random() * 300, Math.random() * 300, Math.random() * 300],
            heading: Math.random() * 360,
            received: true
          }
          writeMockSensorData(ros, randomData)
        }}>
          Mock Random Sensor Data
        </button>
        <button type="button" onClick={() => {
          const zero: SensorData = {
            ultrasonic: [0, 0, 0],
            heading: 0,
            received: true
          }
          writeMockSensorData(ros, zero)
        }}>
          Mock Empty Sensor Data
        </button>
        <button type="button" onClick={() => {
          // enter a separate thread
          let interval: number
          let i = 0
          interval = setInterval(() => {
            const turn: SensorData = {
              ultrasonic: data.ultrasonic,
              heading: (data.heading + (++i * 2)) % 360,
              received: true
            }
            writeMockSensorData(ros, turn)
            if (i == 45) clearInterval(interval)
          }, 8)
        }}>
          Mock Turn 90deg
        </button>
      </div>

      <div className="data-display">
        <div className="data-text">
          <div>L/F/R: {numberOrNone(left)}, {numberOrNone(front)}, {numberOrNone(right)}</div>
          <div>heading: {data.heading.toFixed(2)}</div>
        </div>
        <div className="sensor-canvas">
          <SensorDataDrawing data={data} />
        </div>
      </div>
    </div>
  )
}
