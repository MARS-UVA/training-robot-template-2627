import { useState } from 'react'
import { Ros, Service, Topic } from 'roslib'

type EmergencyStop = {
	set_lock_to: boolean
}

type Bool = {
	data: boolean
}

type Props = {
	ros: Ros
}

export function EmergencyStopCard({ ros }: Props) {
	const [isLocked, setMuxLocked] = useState(false)
	const [subscriberExists, setSubscriberExists] = useState(false)

	const eStopStatus = new Topic<Bool>({
		ros,
		name: '/e_stop_status',
		messageType: 'std_msgs/msg/Bool'
	})

	if (!subscriberExists) {
		eStopStatus.subscribe((msg) => {
			setMuxLocked(msg.data)
		})
		setSubscriberExists(true)
	}

	return (
		<div className="card">
			<h2>Emergency Stop</h2>
			<strong>Service:</strong> <code>/emergency_stop</code>
			<br />
			<br />
			<strong>Topic:</strong> <code>/e_stop</code>, locks <code>/cmd_vel</code>
			<br />
			<div className="button-row">
				<button type="button" onClick={() => {
					const eStopService = new Service<EmergencyStop>({
						ros,
						name: '/emergency_stop',
						serviceType: 'emergency_stop_interfaces/srv/EmergencyStop',
					})

					eStopService.callService({ set_lock_to: !isLocked }, (res) => { console.log(res) })
				}}>
					{isLocked ? "Unlock" : "Lock"} /cmd_vel
				</button>
			</div>
		</div>
	)
}
