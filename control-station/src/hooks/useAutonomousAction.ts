import { useCallback, useEffect, useRef, useState } from 'react'
import { Action, type Ros } from 'roslib'

/** Matches autonomy_interfaces/action/AutonomousActions.action */
export type AutonomousActionGoal = {
  index: number
}

export type AutonomousActionResult = {
  success: boolean
}

export type AutonomousActionFeedback = {
  status: string
}

export type ActionStatus =
  | 'idle'
  | 'pending'
  | 'active'
  | 'succeeded'
  | 'aborted'
  | 'canceled'

const ACTION_NAME = '/autonomous_actions'
const ACTION_TYPE = 'autonomy_interfaces/action/AutonomousActions'

export function useAutonomousAction(ros: Ros | null) {
  const actionRef = useRef<Action<
    AutonomousActionGoal,
    AutonomousActionResult,
    AutonomousActionFeedback
  > | null>(null)
  const goalIdRef = useRef<string | null>(null)

  const [status, setStatus] = useState<ActionStatus>('idle')
  const [result, setResult] = useState<AutonomousActionResult | null>(null)
  const [feedback, setFeedback] = useState<AutonomousActionFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ros) return

    actionRef.current = new Action({
      ros,
      name: ACTION_NAME,
      actionType: ACTION_TYPE,
    })

    return () => {
      if (goalIdRef.current) {
        actionRef.current?.cancelGoal(goalIdRef.current)
        goalIdRef.current = null
      }
      actionRef.current = null
    }
  }, [ros])

  const sendGoal = useCallback((index: number) => {
    const action = actionRef.current
    if (!action) return

    setStatus('pending')
    setResult(null)
    setFeedback(null)
    setError(null)

    goalIdRef.current = action.sendGoal(
      { index },
      (nextResult) => {
        setResult(nextResult)
        setStatus(nextResult.success ? 'succeeded' : 'aborted')
        goalIdRef.current = null
      },
      (nextFeedback) => {
        setFeedback(nextFeedback)
        setStatus('active')
      },
      (failed) => {
        setError(failed)
        setStatus('aborted')
        goalIdRef.current = null
      },
    )
  }, [])

  const cancelGoal = useCallback(() => {
    if (!goalIdRef.current) return
    actionRef.current?.cancelGoal(goalIdRef.current)
    goalIdRef.current = null
    setStatus('canceled')
  }, [])

  return {
    status,
    result,
    feedback,
    error,
    sendGoal,
    cancelGoal,
  }
}
