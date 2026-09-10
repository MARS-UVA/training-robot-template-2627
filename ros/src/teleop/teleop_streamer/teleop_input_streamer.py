from threading import Thread
from rclpy.node import Node
from teleop_msgs.msg import GamepadState
from geometry_msgs.msg import Twist
from rclpy.callback_groups import ReentrantCallbackGroup

class TeleopInputStreamer(Node):

    def __init__(self):
        super().__init__("teleop_input_streamer")

        # allow multiple streams (not sure how feasible this is, but feels intuitive)
        self.STREAM_CALLBACK_GROUP = ReentrantCallbackGroup()

        self.twist_publisher = self.create_publisher(Twist, "/teleop/cmd_vel", 10)

        self.gamepad_subscriber = self.create_subscription(
            topic="/gamepad_state",
            msg_type=GamepadState,
            callback=self.teleop_callback,
            qos_profile=10,
            callback_group=self.STREAM_CALLBACK_GROUP,
        )
        
        self.current_twist = Twist()
        self.start_keep_alive()

    def teleop_callback(self, gamepad_input: GamepadState):
        # x will be our motor offset scalar, [-1, 1]
        # y will be our motor strength scalar, [-1, 1]
        direction = (gamepad_input.left_stick.x, gamepad_input.left_stick.y)
        
        # this just happens to adapt pretty well with the gamepad input
        twist = Twist()
        twist.linear.x = direction[0]
        twist.angular.z = direction[1]
        
        self.twist_publisher.publish(twist)
        self.current_twist = twist
        
    # the board disengages motors after no input is recieved in ~1s
    # we should replay inputs every 0.5s to keep unchanging inputs live
    def start_keep_alive(self):
        KEEP_ALIVE_RATE = self.create_rate(2.0)
        
        def keep_alive():
            previous_twist = None
            
            while True:
                is_twist_empty = self.current_twist == None or self.current_twist == Twist()
                if not is_twist_empty:
                    if self.current_twist != previous_twist:
                        previous_twist = self.current_twist
                    else:
                        self.twist_publisher.publish(self.current_twist)
                
                KEEP_ALIVE_RATE.sleep()
        
        # thread to avoid halting
        Thread(target=keep_alive).start()