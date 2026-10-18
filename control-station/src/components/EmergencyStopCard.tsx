import type { Bool } from '../hooks/useEmergencyStop';

// import { Topic, type Ros } from 'roslib';

export function EmergencyStopCard({ data, toggle }: { data: Bool, toggle: () => void }) {
    return (
        <div className="card">
            <h2>Emergency Stop</h2>
            <p>it is stopped? { data?.data ? 'yes' : 'no' }</p>
            <button onClick={toggle}>{ !data?.data ? 'STOP!' : 'resume' }</button>
        </div>
    )
}
