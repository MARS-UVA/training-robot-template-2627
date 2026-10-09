import type { SensorData } from '../hooks/useSensorData'

type Props = {
  data: SensorData
}

let translated = false;
let canvas: HTMLCanvasElement | null = document.getElementById('sensor-visual') as HTMLCanvasElement | null;
let ctx: CanvasRenderingContext2D | null = null;
let previousHeading: number = 0;

const w = 48;
const h = 80;
const uslm = 1.5;

export function SensorDataCard({ data }: Props) {
  if (!canvas) {
    canvas = document.getElementById('sensor-visual') as HTMLCanvasElement | null;
    if (canvas) {
      ctx = canvas.getContext("2d");
    }
  }

  if (ctx) {
    ctx.clearRect(-2000, -2000, 4000, 4000);

    ctx.fillStyle = "#ddd";
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // left ultrasonic
    let hue = Math.floor(Math.max(Math.min(data.ultrasonic[0] * 5 - 20, 120), 0));
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(-data.ultrasonic[0] * uslm - w / 2, -8, data.ultrasonic[0] * uslm, 16);

    // right ultrasonic
    hue = Math.floor(Math.max(Math.min(data.ultrasonic[2] * 5 - 20, 120), 0));
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(w / 2, -8, data.ultrasonic[2] * uslm, 16);

    // front ultrasonic
    hue = Math.floor(Math.max(Math.min(data.ultrasonic[1] * 5 - 20, 120), 0));
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(-8, -h / 2 - data.ultrasonic[1] * uslm, 16, data.ultrasonic[1] * uslm);

    ctx.rotate((Math.PI / 180) * (data.heading - previousHeading));

    if (!translated) {
        ctx.translate(200, 200);
        translated = true;
    }
  }

  previousHeading = data.heading;

  return (
    <div className="card">
      <h2>Incoming Sensor Data</h2>
      <p>
        <strong>Topic:</strong> <code>/ultrasonic</code> and <code>/heading</code>
      </p>
      <div className="data-display">
        {/* TODO: Display the sensor data on this card */}
        <p>ultrasonic: { data.ultrasonic.map(v => v.toFixed(3)).join(', ') }</p>
        <p>heading: { data.heading }</p>
      </div>
      <canvas id="sensor-visual" width="400" height="400"></canvas>
    </div>
  )
}
