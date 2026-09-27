import { useEffect, useState } from 'react'
import { Topic, Service, ServiceRequest, type Ros } from 'roslib'

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
  const [estopActive, setEstopActive] = useState(false)
  const [received, setReceived] = useState(false)

  useEffect(() => {
    if (!ros) return

    const estopSubscriber = new Topic<Bool>({
      ros,
      name: '/estop_active',
      messageType: 'std_msgs/msg/Bool',
    })

    estopSubscriber.subscribe((message) => {
      setEstopActive(message.data)
      setReceived(true)
    })

    return () => {
      estopSubscriber.unsubscribe()
    }
  }, [ros])

  const toggleEstop = () => {
    if (!ros) return

    const service = new Service<SoftwareEstopRequest, unknown>({
      ros,
      name: '/estop_robot',
      serviceType: 'software_estop_srv/srv/SoftwareEstop',
    })

    const request = new ServiceRequest<SoftwareEstopRequest>({
      enable: !estopActive,
    })

    service.callService(
      request,
      () => {
        console.log(
          `E-stop ${!estopActive ? 'engaged' : 'cleared'}`
        )
      },
      (error: unknown) => {
        console.error('Failed to call estop service:', error)
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
            color: estopActive ? 'red' : 'green',
          }}
        >
          {!received
            ? 'Unknown'
            : estopActive
            ? 'ENGAGED'
            : 'CLEARED'}
        </strong>
      </p>

      <button
        onClick={toggleEstop}
        disabled={!ros}
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
        {estopActive ? 'Clear E-Stop' : 'ENGAGE E-Stop'}
      </button>
    </div>
  )
}