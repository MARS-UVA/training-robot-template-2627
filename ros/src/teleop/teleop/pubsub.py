import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist, Vector3
from teleop_msgs.msg import GamepadState, StickPosition

class Teleop(Node):
    def __init__(self):
        super().__init__('teleop_pub_sub')

        self.publisher_ = self.create_publisher(Twist, '/cmd_vel', 10)
        self.subscription_ = self.create_subscription(GamepadState, '/gamepad_state', self.on_gamepad_change, 10)

    def on_gamepad_change(self, state):
        horizontal = state.left_stick.x  # horizontal
        vertical = state.left_stick.y  # vertical

        self.get_logger().info('%f, %f' % (horizontal, vertical))

        twist = Twist()
        twist.linear = Vector3()
        twist.linear.x = (vertical)

        twist.angular = Vector3(x=0.0, y=0.0, z=-horizontal) # make this
        self.publisher_.publish(twist)

def main(args=None):
    rclpy.init(args=args)

    teleop = Teleop()

    rclpy.spin(teleop)

    teleop.destroy_node()
    rclpy.shutdown()
