import { useEffect, useState } from 'react'
import { Topic, type Ros } from 'roslib'

type Float64MultiArray = { data: number[] }
type Float64 = { data: number }

export type SensorData = {
  ultrasonic: number[]
  heading: number
  received: boolean
}

export function useSensorData(ros: Ros | null) {
  const [data, setData] = useState<SensorData>({
    ultrasonic: [],
    heading: 0,
    received: false,
  })

  useEffect(() => {
    if (!ros) return

    // TODO: Create subscriber to /ultrasonic
    const ultrasonicSubscriber = new Topic<Float64MultiArray>({
      ros,
      name: '/ultrasonic',
      messageType: 'std_msgs/msg/Float64MultiArray',
    })

    const headingSubscriber = new Topic<Float64>({
      ros,
      name: '/heading',
      messageType: 'std_msgs/msg/Float64',
    })

    headingSubscriber.subscribe((message) => {
      setData((prev) => ({ ...prev, heading: message.data, received: true }))
    })

    ultrasonicSubscriber.subscribe((message) => {
      setData((prev) => ({ ...prev, ultrasonic: message.data, received: true }))
    })

    return () => {
      headingSubscriber.unsubscribe()
      ultrasonicSubscriber.unsubscribe()
    }
  }, [ros])

  return data
}
