from rclpy.node import Node
from std_msgs.msg import Bool
from emergency_stop_interfaces.srv import EmergencyStop
from diagnostic_msgs.msg import DiagnosticArray


class EmergencyStopService(Node):

    def __init__(self):
        super().__init__("emergency_stop_service")

        self.is_locked = False
        self.lock_publisher = self.create_publisher(Bool, "/e_stop", 10)
        self.status_publisher = self.create_publisher(Bool, "/e_stop_status", 10)

        self.diagnostics_subscriber = self.create_subscription(
            DiagnosticArray, "/diagnostics", self.diagnostic_callback, 10
        )

        self.e_stop_service = self.create_service(
            srv_type=EmergencyStop,
            srv_name="/emergency_stop",
            callback=self.service_callback,
        )

        self.create_timer(0.5, self.publish_lock_status)

    def diagnostic_callback(self, msg: DiagnosticArray):
        statuses = msg.status
        for status in statuses:
            if "twist_mux" in status.name:
                for kv in status.values:
                    if kv.key == "lock locks.emergency_stop":
                        self.is_locked = "locked" in kv.value
                        return

        pass

    def service_callback(self, req, res):
        msg = Bool()
        msg.data = bool(req.set_lock_to)
        self.lock_publisher.publish(msg)
        res.success = True
        return res

    def publish_lock_status(self):
        pub = Bool()
        pub.data = bool(self.is_locked)
        self.status_publisher.publish(pub)
