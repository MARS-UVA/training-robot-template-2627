import rclpy
from teleop_streamer.teleop_input_streamer import TeleopInputStreamer
from rclpy.executors import MultiThreadedExecutor

def main(args=None):
    rclpy.init(args=args)

    teleop_action_server = TeleopInputStreamer()

    executor = MultiThreadedExecutor()
    executor.add_node(teleop_action_server)

    try:
        executor.spin()
    finally:
        executor.shutdown()
        teleop_action_server.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
