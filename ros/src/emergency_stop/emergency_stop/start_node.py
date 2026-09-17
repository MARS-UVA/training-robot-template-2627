import rclpy
from emergency_stop.emergency_stop_service import EmergencyStopService
from rclpy.executors import MultiThreadedExecutor

def main(args=None):
    rclpy.init(args=args)

    emergency_stop_service = EmergencyStopService()

    executor = MultiThreadedExecutor()
    executor.add_node(emergency_stop_service)

    try:
        executor.spin()
    finally:
        executor.shutdown()
        emergency_stop_service.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
