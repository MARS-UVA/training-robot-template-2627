import type {
  ActionStatus,
  AutonomousActionFeedback,
  AutonomousActionResult,
} from '../hooks/useAutonomousAction'

type Props = {
  status: ActionStatus
  result: AutonomousActionResult | null
  feedback: AutonomousActionFeedback | null
  error: string | null
  onSendGoal: (index: number) => void
  onCancel: () => void
}

const STATUS_LABEL: Record<ActionStatus, string> = {
  idle: 'Idle',
  pending: 'Sending goal…',
  active: 'Running',
  succeeded: 'Succeeded',
  aborted: 'Aborted',
  canceled: 'Canceled',
}

export function AutonomousActionCard({
  status,
  result,
  feedback,
  error,
  onSendGoal,
  onCancel,
}: Props) {
  const busy = status === 'pending' || status === 'active'

  return (
    <div className="card">
      <h2>Autonomous Actions</h2>
      <p>
        <strong>Action:</strong> <code>/autonomous_actions</code>
      </p>
      <p>
        Status: <strong>{STATUS_LABEL[status]}</strong>
      </p>
      {feedback ? <p>Feedback: {feedback.status}</p> : null}
      {result ? <p>Result success: {String(result.success)}</p> : null}
      {error ? <p className="action-error">{error}</p> : null}

      <div className="button-row">
        <button type="button" disabled={busy} onClick={() => onSendGoal(0)}>
          Turn 90°
        </button>
        <button type="button" disabled={busy} onClick={() => onSendGoal(1)}>
          Drive until obstacle
        </button>
        <button type="button" disabled={!busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
