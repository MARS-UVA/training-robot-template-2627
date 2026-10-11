import { useEffect, useState } from 'react'
import { Topic, Service, type Ros } from 'roslib'

type Bool = {
  data: boolean
}

type SoftwareEstopRequest = {
  enable: boolean
}

interface EstopButtonProps {
  ros: Ros | null
}

export default function EstopButton({ ros }: EstopButtonProps) {
  const [estopActive, setEstopActive] = useState<boolean | null>(null)
  const [requestPending, setRequestPending] = useState(false)

  useEffect(() => {
    if (!ros) return

    const estopSubscriber = new Topic<Bool>({
      ros,
      name: '/estop_active',
      messageType: 'std_msgs/msg/Bool',
    })

    estopSubscriber.subscribe((message) => {
      setEstopActive(message.data)
    })

    return () => {
      estopSubscriber.unsubscribe()
    }
  }, [ros])

  const toggleEstop = () => {
    if (!ros || requestPending) return

    const nextState = estopActive !== true
    setRequestPending(true)

    const service = new Service<SoftwareEstopRequest, unknown>({
      ros,
      name: '/estop_robot',
      serviceType: 'software_estop_srv/srv/SoftwareEstop',
    })

    const request: SoftwareEstopRequest = {
      enable: nextState,
    }

    service.callService(
      request,
      () => {
        setEstopActive(nextState)
        setRequestPending(false)
      },
      (error) => {
        console.error('Failed to call estop service:', error)
        setRequestPending(false)
      }
    )
  }

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '300px',
      }}
    >
      <h3>E-Stop Control</h3>

      <p>
        Status:{' '}
        <strong
          style={{
            color: estopActive === null ? 'inherit' : estopActive ? 'red' : 'green',
          }}
        >
          {estopActive === null
            ? 'Unknown'
            : estopActive
            ? 'ENGAGED'
            : 'CLEARED'}
        </strong>
      </p>

      <button
        onClick={toggleEstop}
        disabled={!ros || requestPending}
        style={{
          backgroundColor: estopActive ? 'green' : 'red',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {estopActive === true ? 'Clear E-Stop' : 'ENGAGE E-Stop'}
      </button>
    </div>
  )
}