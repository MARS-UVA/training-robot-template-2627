import { useEffect, useState } from 'react'
import { Ros } from 'roslib'

export type ConnectionStatus = 'connected' | 'error' | 'closed' | 'connecting'

const ROSBRIDGE_URL = 'ws://localhost:9090'

export function useRos(url: string = ROSBRIDGE_URL) {
  const [ros] = useState(() => new Ros({ url }))
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    ros.on('connection', () => setStatus('connected'))
    ros.on('error', (error?: unknown) => {
      setStatus('error')
      console.error('WebSocket Error:', error)
    })
    ros.on('close', () => setStatus('closed'))

    return () => {
      ros.close()
    }
  }, [ros])

  return { ros, status }
}
