from software_estop_srv.srv import SoftwareEstop
from std_msgs.msg import Bool
from diagnostic_msgs.msg import DiagnosticArray

import rclpy
from rclpy.node import Node


class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.estop_active = False
        self.srv = self.create_service(SoftwareEstop, 'software_estop', self.software_estop_callback)
        self.estop_publisher = self.create_publisher(Bool, '/e_stop', 10)
        self.diagnostics_subscriber = self.create_subscription(DiagnosticArray, '/diagnostics', self.diagnostics_callback, 10)
        self.estop_active_publisher = self.create_publisher(Bool, '/estop_active', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def software_estop_callback(self, request, response):
        self.get_logger().info('Incoming request\nenable: %s' % (request.enable))
        self.estop_publisher.publish(Bool(data=request.enable))
        response.success = True
        return response
    
    def diagnostics_callback(self, msg):
        for message in msg.status:
            for value in message.values:
                if value.key == 'lock locks.emergency_stop':
                    free = value.value.strip().startswith('free')
                    self.estop_active = not free
    
    def timer_callback(self):
        if self.estop_active:
            self.estop_active_publisher.publish(Bool(data=True))
        else:
            self.estop_active_publisher.publish(Bool(data=False))

def main():
    rclpy.init()
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    rclpy.shutdown()

if __name__ == '__main__':
    main()