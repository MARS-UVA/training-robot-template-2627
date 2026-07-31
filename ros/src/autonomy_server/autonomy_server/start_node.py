import rclpy
from autonomy_server.autonomy_action_server import AutonomyActionServer
from rclpy.executors import MultiThreadedExecutor

def main(args=None):
    rclpy.init(args=args)

    autonomy_action_server = AutonomyActionServer()

    executor = MultiThreadedExecutor()
    executor.add_node(autonomy_action_server)

    try:
        executor.spin()
    finally:
        executor.shutdown()
        autonomy_action_server.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
