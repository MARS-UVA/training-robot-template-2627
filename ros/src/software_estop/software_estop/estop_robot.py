from software_estop_srv.srv import SoftwareEstop
from std_msgs.msg import Bool
from diagnostic_msgs.msg import DiagnosticArray, DiagnosticStatus

import rclpy
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor

from time import sleep

class EstopRobot(Node):

    def __init__(self):
        super().__init__('estop_robot')

        self.srv = self.create_service(SoftwareEstop, 'estop_robot', self.srv_callback)
        self.pub = self.create_publisher(Bool, '/e_stop', 10)
        self.sub = self.create_subscription(DiagnosticArray, '/diagnostics', self.sub_callback, 10)
        self.activity_pub = self.create_publisher(Bool, '/estop_active', 10)

        self.is_active = False

        # self.pub_activity()

    def srv_callback(self, request, response):
        self.get_logger().info(f'enable?: {request.enable}')

        self.is_active = request.enable
        msg = Bool()
        msg.data = request.enable

        try:
            self.pub.publish(msg)
            self.activity_pub.publish(msg)
            response.success = True

        except Exception as e:
            self.get_logger().info(f'callback failed: {str(e)}')
            response.success = False

        return response

    def sub_callback(self, diagnostics):
        pass
        # for status in diagnostics.status:
        #     if status.level != DiagnosticStatus.OK:
        #         self.get_logger().info('UH OH ' + str(status.level) + '\n' + status.name + '\n' + status.message)

    # def pub_activity(self):
    #     while True:
    #         msg = Bool()
    #         msg.data = self.is_active
    #         self.activity_pub.publish(msg)
    #         sleep(1 / 2)


def main():
    rclpy.init()

    node = EstopRobot()

    # use a MultiThreadedExecutor so the service callback 
    # can run on a separate thread even if the main thread is busy
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

    # rclpy.spin(node)
    # node.destroy_node()
    # rclpy.shutdown()

if __name__ == '__main__':
    main()
