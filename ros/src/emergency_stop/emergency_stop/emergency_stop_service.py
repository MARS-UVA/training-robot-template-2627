from rclpy.node import Node
from std_msgs.msg import Bool
from emergency_stop_interfaces.srv import EmergencyStop


class EmergencyStopService(Node):

    def __init__(self):
        super().__init__("emergency_stop_service")

        self.e_stop_publisher = self.create_publisher(Bool, "/e_stop", 10)

        self.e_stop_service = self.create_service(
            srv_type=EmergencyStop, srv_name="/emergency_stop", callback=self.e_stop_callback
        )

    def e_stop_callback(self, req, res):
        msg = Bool()
        msg.data = req.mux_locked
        self.e_stop_publisher.publish(msg)
        res.mux_locked_status = True
        return res
