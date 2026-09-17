import { useState } from 'react'
import { Ros, Topic } from 'roslib'

type Bool = {
	data: boolean
}

type Props = {
	ros: Ros
}

export function EmergencyStopCard({ ros }: Props) {
	let [isMuxLocked, setMuxLocked] = useState(false)

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
					const eStopPublisher = new Topic<Bool>({
						ros,
						name: '/e_stop',
						messageType: 'std_msgs/msg/Bool',
					})

					eStopPublisher.publish({ data: !isMuxLocked })
					setMuxLocked(!isMuxLocked)
				}}>
					{isMuxLocked ? "Unlock" : "Lock"} /cmd_vel
				</button>
			</div>
		</div>
	)
}
