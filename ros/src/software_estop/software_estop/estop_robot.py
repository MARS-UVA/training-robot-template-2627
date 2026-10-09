from software_estop_srv.srv import SoftwareEstop
from std_msgs.msg import Bool
from diagnostic_msgs.msg import DiagnosticArray

import rclpy
from rclpy.node import Node

from time import sleep

class EstopRobot(Node):

    def __init__(self):
        super().__init__('estop_robot')

        self.srv = self.create_service(SoftwareEstop, 'estop_robot', self.srv_callback)
        self.pub = self.create_publisher(Bool, '/e_stop', 10)
        self.sub = self.create_subscription(DiagnosticArray, '/diagnostics', self.sub_callback, 10)
        self.activity_pub = self.create_publisher(Bool, '/estop_active', 10)

        self.is_active = False

        self.pub_activity()

    def srv_callback(self, request, response):
        self.get_logger().info(f'enable?: {request.enable} success?: {request.success}')

        self.is_active = request.enable
        self.pub.publish(request.enable)

        return response

    def sub_callback(self, diagnostics):
        for status in diagnostics:
            if status.byte != 0:
                self.get_logger().info('UH OH ' + status.level + '\n' + status.name + '\n' + status.message)

    def pub_activity(self):
        while True:
            self.activity_pub.publish(self.is_active)
            sleep(1 / 2)


def main():
    rclpy.init()

    node = EstopRobot()

    rclpy.spin(node)

    rclpy.shutdown()


if __name__ == '__main__':
    main()
