from rclpy.node import Node
from teleop_msgs.msg import GamepadState
from geometry_msgs.msg import Twist


class TeleopInputStreamer(Node):

    def __init__(self):
        super().__init__("teleop_input_streamer")

        self.gamepad_subscriber = self.create_subscription(
            topic="/gamepad_state",
            msg_type=GamepadState,
            callback=self.teleop_callback,
            qos_profile=10,
        )

        self.twist_publisher = self.create_publisher(Twist, "/teleop/cmd_vel", 10)

        self.current_twist = None
        self.start_keep_alive()

    def teleop_callback(self, gamepad_input: GamepadState):
        # x will be our motor turn radius, [-1, 1]
        # y will be our motor strength scalar, [-1, 1]
        direction = (gamepad_input.left_stick.x, gamepad_input.left_stick.y)

        # this just happens to adapt pretty well with the gamepad input
        twist = Twist()
        twist.linear.x = direction[1] # fwd = y
        twist.angular.z = direction[0] # turn = x

        self.twist_publisher.publish(twist)
        self.current_twist = twist

    # the board disengages motors after no input is recieved in ~1s
    # we should replay unchanged inputs every 0.5s to bypass
    def start_keep_alive(self):
        self.create_timer(0.5, self.keep_alive)

    def keep_alive(self):
        if self.current_twist is not None and self.current_twist is not Twist():
            self.twist_publisher.publish(self.current_twist)
