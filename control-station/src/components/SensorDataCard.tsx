import { useEffect } from 'react'
import type { SensorData } from '../hooks/useSensorData'

type Props = {
  data: SensorData
}

export function SensorDataCard({ data }: Props) {
  useEffect(() => {
    const canvas = document.getElementById('robotRender') as HTMLCanvasElement | null
    if (!canvas) return
    let ctx = canvas.getContext('2d');
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // rotate canvas by heading
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((data.heading || 0) * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.fillStyle = "orange";
    ctx.fillRect(150, 150, 75, 150);
    ctx.beginPath();
    if (data.ultrasonic[0] !== undefined) {
      ctx.moveTo(150, 150 + 75);
      ctx.lineTo(150 - data.ultrasonic[0] * 4, 150 + 75);
    }
    if (data.ultrasonic[2] !== undefined) {
      ctx.moveTo(150 + 75, 150 + 75);
      ctx.lineTo(150 + 75 + data.ultrasonic[2] * 4, 150 + 75);
    }
    if (data.ultrasonic[1] !== undefined) {
      ctx.moveTo(150 + 75/2, 150);
      ctx.lineTo(150 + 75/2, 150 - data.ultrasonic[1] * 4);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.restore();
  }, [data]);

  return (
    <div className="card">
      <h2>Incoming Sensor Data</h2>
      <p>
        <strong>Topic:</strong> <code>/ultrasonic</code> and <code>/heading</code>
      </p>
      <div className="data-display">
        <p><strong>Heading:</strong> {data.heading?.toFixed(2)}</p>
        <p><strong>Ultrasonic left sensor:</strong> {data.ultrasonic[0]?.toFixed(2)}</p>
        <p><strong>Ultrasonic front sensor:</strong> {data.ultrasonic[1]?.toFixed(2)}</p>
        <p><strong>Ultrasonic right sensor:</strong> {data.ultrasonic[2]?.toFixed(2)}</p>
      </div>
      <canvas id="robotRender" width="400" height="400"></canvas>
    </div>
  )
}
