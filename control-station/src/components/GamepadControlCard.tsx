import { Joystick } from './Joystick'

type Props = {
  leftStick: { x: number; y: number }
  gamepadName: string | null
  wasdActive: boolean
  onMove: (x: number, y: number) => void
  onRelease: () => void
}

export function GamepadControlCard({
  leftStick,
  gamepadName,
  wasdActive,
  onMove,
  onRelease,
}: Props) {
  return (
    <div className="card">
      <h2>Gamepad & Control Relayer</h2>
      <p>
        <strong>Topic:</strong> <code>/gamepad_state</code>
      </p>

      <div>
        {wasdActive ? (
          <p>
            <strong>WASD active:</strong> W/S forward/back, A/D left/right
          </p>
        ) : gamepadName ? (
          <p>
            <strong>Gamepad Connected:</strong> {gamepadName}
          </p>
        ) : (
          <em>Drag the stick, hold W A S D, or connect a controller.</em>
        )}
      </div>

      <div className="joystick-wrap">
        <Joystick value={leftStick} onMove={onMove} onRelease={onRelease} />
        <p className="joystick-readout">
          x {leftStick.x.toFixed(2)} · y {leftStick.y.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
