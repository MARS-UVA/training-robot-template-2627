import { AutonomousActionCard } from './components/AutonomousActionCard'
import { ConnectionStatus } from './components/ConnectionStatus'
import { GamepadControlCard } from './components/GamepadControlCard'
import { SensorDataCard } from './components/SensorDataCard'
import { useAutonomousAction } from './hooks/useAutonomousAction'
import { useGamepadPublisher } from './hooks/useGamepadPublisher'
import { useRos } from './hooks/useRos'
import { useSensorData } from './hooks/useSensorData'
import './App.css'

function App() {
  const { ros, status } = useRos()
  const sensorData = useSensorData(ros)
  const { leftStick, applyStick, releaseStick, gamepadName, wasdActive } =
    useGamepadPublisher(ros)
  const autonomy = useAutonomousAction(ros)

  return (
    <main className="control-station">
      <h1>ROS 2 Bridge Control Panel</h1>
      <ConnectionStatus status={status} />

      <div className="grid">
        {/* TODO: Add the SensorDataCard and use the sensorData */}

        <GamepadControlCard
          leftStick={leftStick}
          gamepadName={gamepadName}
          wasdActive={wasdActive}
          onMove={applyStick}
          onRelease={releaseStick}
        />
        <AutonomousActionCard
          status={autonomy.status}
          result={autonomy.result}
          feedback={autonomy.feedback}
          error={autonomy.error}
          onSendGoal={autonomy.sendGoal}
          onCancel={autonomy.cancelGoal}
        />
      </div>
    </main>
  )
}

export default App
