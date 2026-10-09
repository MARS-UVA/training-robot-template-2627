import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64, Float64MultiArray
from geometry_msgs.msg import Twist, Vector3
from teleop_msgs.msg import GamepadState, StickPosition

# dist for ultrasonic
# head for heading
class Disthead(Node):
    def __init__(self):
        super().__init__('teleop_pub_sub')

        self.dist_sub_ = self.create_subscription(Float64MultiArray, '/ultrasonic', self.on_dist, 10)
        self.head_sub_ = self.create_subscription(Float64, '/heading', self.on_head, 10)

    def on_dist(self, msg):
        pass
        # self.get_logger().info('Ultrasonic: %f, %f, %f' % (msg.data[0], msg.data[1], msg.data[2]))

    def on_head(self, msg):
        pass
        # self.get_logger().info('Heading: %f' % (msg.data))

def main(args=None):
    rclpy.init(args=args)

    disthead = Disthead()

    rclpy.spin(disthead)

    disthead.destroy_node()
    rclpy.shutdown()
