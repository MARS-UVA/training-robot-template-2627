import { useCallback, useEffect, useRef, useState } from 'react'
import { Topic, Service, type Ros } from 'roslib'

export type EstopActiveData = {
  data: boolean
}

export type EstopDataRequest = {
  enable: boolean
}

export type EstopDataResponse = {
  success: boolean
}

export function useEstopActiveData(ros: Ros | null) {
  const [data, setData] = useState<EstopActiveData | null>(null)

  useEffect(() => {
    if (!ros) return

    const estopActiveSubscriber = new Topic<EstopActiveData>({
      ros,
      name: '/estop_active',
      messageType: 'std_msgs/msg/Bool',
    })

    estopActiveSubscriber.subscribe((message) => {
      setData((prev) => ({ ...prev, data: message.data }))
    })

    return () => {
      estopActiveSubscriber.unsubscribe()
    }
  }, [ros])

  return data
}

export function useEstopCaller(ros: Ros | null) {
    const serviceRef = useRef<Service<EstopDataRequest, EstopDataResponse> | null>(null)
    useEffect(() => {
        if (!ros) return
  
        serviceRef.current = new Service<EstopDataRequest, EstopDataResponse>({
            ros,
            name: '/software_estop',
            serviceType: 'software_estop_srv/srv/SoftwareEstop',
        })
    
        return () => {
            serviceRef.current = null
        }
    }, [ros])

    const caller = useCallback((enable: boolean) => {
        serviceRef.current?.callService({ enable: enable }, (response: EstopDataResponse) => {
            console.log('E-Stop response success:', response.success)
        }, (error: string) => {
            console.error('E-Stop service call failed:', error)
        })
    }, [])

    return caller
}