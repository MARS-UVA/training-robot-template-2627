import type { SensorData } from '../hooks/useSensorData'

type Props = {
  data: SensorData
}

export function SensorDataCard({ data }: Props) {
  return (
    <div className="card">
      <h2>Incoming Sensor Data</h2>
      <p>
        <strong>Topic:</strong> <code>/ultrasonic</code> and <code>/heading</code>
      </p>
      <div className="data-display">
        {/* TODO: Display the sensor data on this card */}
      </div>
    </div>
  )
}
