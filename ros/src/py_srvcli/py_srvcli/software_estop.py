from software_estop_srv.srv import SoftwareEstop

import rclpy
import std_msgs
from std_msgs.msg import Bool
from rclpy.node import Node
from diagnostic_msgs.msg import DiagnosticArray


class EstopService(Node):

    def __init__(self):
        super().__init__('estop_service')
        self.srv = self.create_service(SoftwareEstop, 'estop_robot', self.e_stop)
        self.pub = self.create_publisher(Bool, '/e_stop', 10)
        self.keepStopPub = self.create_publisher(Bool, '/e_stop_active', 500)
        #client 
        self.client = self.create_client(SoftwareEstop, 'estop_robot')
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service...')
        self.subscription = self.create_subscription(
                    DiagnosticArray,
                    '/diagnostics', 
                    self.keepStop, 
                    500)
        

    def estop(self, request, response):
        msg = Bool()
        msg.data = request.data
        self.pub.publish(msg)
        return response
    
    def keepStop(self, status):
        stats = status.status
        if stats["locks"]["emergency_stop"] == "locked":
            msg = Bool()
            msg.data = True
            self.keepStopPub.publish(msg)
        else:
            msg = Bool()
            msg.data = False
            self.keepStopPub.publish(msg)
        
            

def main():
    rclpy.init()

    estop_service = EstopService()

    rclpy.spin(estop_service)

    rclpy.shutdown()


if __name__ == '__main__':
    main()