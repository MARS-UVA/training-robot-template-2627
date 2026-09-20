import rclpy
from rclpy.node import Node

from geometry_msgs.msg import Twist

from teleop_msgs.msg import GamepadState


class TeleopNode(Node): 

    def __init__(self):
        super().__init__('teleop_node')

        self.linear_speed = 0.5    
        self.angular_speed = 1.0   

        self.subscription = self.create_subscription(
            GamepadState,
            '/gamepad_state', 
            self.listener_callback, 
            10)

        self.cmd_vel_pub = self.create_publisher(Twist, '/teleop/cmd_vel', 10)

    def listener_callback(self, msg):
        twist = Twist()
        twist.linear.x = self.linear_speed * msg.left_stick.y
        twist.angular.z = -self.angular_speed * msg.left_stick.x
        self.cmd_vel_pub.publish(twist)


def main(args=None):
    rclpy.init(args=args)
    node = TeleopNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()