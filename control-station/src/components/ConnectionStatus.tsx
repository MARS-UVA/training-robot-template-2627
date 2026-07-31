import type { ConnectionStatus as Status } from '../hooks/useRos'

const STATUS_LABEL: Record<Status, string> = {
  connecting: 'Connecting…',
  connected: 'Connected to ROS 2 Bridge',
  error: 'Connection Error',
  closed: 'Connection Closed',
}

type Props = {
  status: Status
}

export function ConnectionStatus({ status }: Props) {
  const connected = status === 'connected'

  return (
    <div className={`status-card ${connected ? 'connected' : 'disconnected'}`}>
      {STATUS_LABEL[status]}
    </div>
  )
}
