import type { Bool } from '../hooks/useEmergencyStop';

import { Topic, type Ros } from 'roslib';

export function EmergencyStopCard({ data }: { data: Bool }) {
    // TODO: send enable=true|false to estop service when button is clicked

    return (
        <div className="card">
            <h2>Emergency Stop</h2>
            <p>is stopped: </p>
            <button>STOP!</button>
        </div>
    )
}
