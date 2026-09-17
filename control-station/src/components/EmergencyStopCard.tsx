import { useState } from 'react'
import { Ros, Service } from 'roslib'

type EmergencyStop = {
	mux_locked: boolean
}

type Props = {
	ros: Ros
}

export function EmergencyStopCard({ ros }: Props) {
	let [isMuxLocked, setMuxLocked] = useState(false)
	let [pending, setPending] = useState(false)

	return (
		<div className="card">
			<h2>Emergency Stop</h2>
			<strong>Service:</strong> <code>/emergency_stop</code>
			<br />
			<br />
			<strong>Topic:</strong> <code>/e_stop</code>, locks <code>/cmd_vel</code>
			<br />
			<div className="button-row">
				<button type="button" disabled={pending} onClick={() => {
					const eStopService = new Service<EmergencyStop>({
						ros,
						name: '/emergency_stop',
						serviceType: 'emergency_stop_interfaces/srv/EmergencyStop',
					})

					setPending(true)
					eStopService.callService({ mux_locked: !isMuxLocked }, () => {
						setMuxLocked(!isMuxLocked)
						setPending(false)
					}, () => {
						setPending(false)
					})
				}}>
					{isMuxLocked ? "Unlock" : "Lock"} /cmd_vel
				</button>
			</div>
		</div>
	)
}
