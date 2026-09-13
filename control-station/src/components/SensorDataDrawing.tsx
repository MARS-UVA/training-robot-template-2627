import { type SensorData } from '../hooks/useSensorData'

type Props = {
	data: SensorData
}

export function SensorDataDrawing(data: Props) {

	function RobotCanvas() {
		const canvas = <canvas width={500} height={500} />

		return canvas
	}

	return <div>
		<RobotCanvas></RobotCanvas>
	</div>;
}