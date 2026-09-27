import { AutonomousActionCard } from './components/AutonomousActionCard'
import { ConnectionStatus } from './components/ConnectionStatus'
import { GamepadControlCard } from './components/GamepadControlCard'
import { SensorDataCard } from './components/SensorDataCard'
import { useAutonomousAction } from './hooks/useAutonomousAction'
import { useGamepadPublisher } from './hooks/useGamepadPublisher'
import { useRos } from './hooks/useRos'
import { useSensorData } from './hooks/useSensorData'
import './App.css'
import { useEstopActiveData, useEstopCaller } from './hooks/useEstopData'
import { EstopControlCard } from './components/EstopControlCard'

function App() {
  const { ros, status } = useRos()
  const sensorData = useSensorData(ros)
  const estopData = useEstopActiveData(ros)
  const estopCaller = useEstopCaller(ros)
  const { leftStick, applyStick, releaseStick, gamepadName, wasdActive } =
    useGamepadPublisher(ros)
  const autonomy = useAutonomousAction(ros)

  return (
    <main className="control-station">
      <h1>ROS 2 Bridge Control Panel</h1>
      <ConnectionStatus status={status} />

      <div className="grid">
        <SensorDataCard data={sensorData} />

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

        <EstopControlCard data={estopData} caller={estopCaller} />
      </div>
    </main>
  )
}

export default App
