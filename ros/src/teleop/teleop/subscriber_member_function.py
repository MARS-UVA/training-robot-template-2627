import rclpy
from rclpy.node import Node

from teleop_msgs.msg import GamepadState
from geometry_msgs.msg import Twist

class MinimalSubscriber(Node):
    def __init__(self, sensitivity=1.0):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            GamepadState,
            '/gamepad_state',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning
        self.sensitivity = sensitivity
        self.twist_publisher = self.create_publisher(Twist, '/teleop/cmd_vel', 10)

    def convert_gamepad_to_twist(self, x, y):
        twist_msg = Twist()
        twist_msg.linear.x = y*self.sensitivity/10  # Forward/backward movement
        twist_msg.angular.z = -x*self.sensitivity  # Left/right turning
        return twist_msg

    def listener_callback(self, msg):
        x, y = msg.left_stick.x, msg.left_stick.y
        self.get_logger().info(f'Gamepad state received: x={x}, y={y}')
        self.twist_publisher.publish(self.convert_gamepad_to_twist(x, y))


def main(args=None):
    rclpy.init(args=args)

    minimal_subscriber = MinimalSubscriber(0.1)

    rclpy.spin(minimal_subscriber)

    # Destroy the node explicitly
    # (optional - otherwise it will be done automatically
    # when the garbage collector destroys the node object)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()