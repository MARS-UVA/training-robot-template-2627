import rclpy
from rclpy.node import Node

import std_msgs
from std_msgs import msg
from std_msgs.msg import Float64MultiArray
from std_msgs.msg import Float64

class SensorNode(Node): 

    def __init__(self):
        super().__init__('sensor_node')
 

        self.subscription = self.create_subscription(
            Float64MultiArray,
            '/ultrasonic', 
            self.ultrasonic_callback, 
            10)
        
        self.subscription = self.create_subscription(
            Float64,
            '/heading',
            self.header_callback,
            10
        )   

    def ultrasonic_callback(self, msg):
        self.get_logger().info('\nleft: "%s"' % msg.data[0] + '\nfront: "%s"' % msg.data[1]+ '\nright: "%s"' % msg.data[2])
        
    def header_callback(self, msg):
        self.get_logger().info('header angle: "%s"' % msg.data)


def main(args=None):
    rclpy.init(args=args)
    node = SensorNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()