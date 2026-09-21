from rclpy.action import ActionServer, CancelResponse
from rclpy.node import Node
from autonomy_interfaces.action import AutonomousActions
from std_msgs.msg import Float64, Float64MultiArray
from geometry_msgs.msg import Twist
from rclpy.callback_groups import ReentrantCallbackGroup, MutuallyExclusiveCallbackGroup
import rclpy


class AutonomyActionServer(Node):

    def __init__(self):
        super().__init__("autonomy_action_server")

        self.action_cb_group = ReentrantCallbackGroup()
        self.sub_cb_group = MutuallyExclusiveCallbackGroup()

        self._action_server = ActionServer(
            self,
            AutonomousActions,
            "autonomous_actions",
            callback_group=self.action_cb_group,
            execute_callback=self.execute_callback,
            cancel_callback=self.cancel_callback,
        )

        self.ultrasonic_subscriber = self.create_subscription(
            msg_type=Float64MultiArray,
            topic="/ultrasonic",
            callback=self.ultrasonic_callback,
            qos_profile=10,
            callback_group=self.sub_cb_group,
        )

        self.heading_subscriber = self.create_subscription(
            msg_type=Float64,
            topic="/heading",
            callback=self.heading_callback,
            qos_profile=10,
            callback_group=self.sub_cb_group,
        )

        self.twist_publisher = self.create_publisher(Twist, "/autonomy/cmd_vel", 10)

        self.ultrasonic_data = [
            -1.0,
            -1.0,
            -1.0,
        ]  # Initialize with default values for left, front, and right distances
        self.heading_data = 0.0
        self.target_heading = 0.0
        self.current_goal_handle = None

    def ultrasonic_callback(self, msg):
        self.ultrasonic_data = msg.data

    def heading_callback(self, msg):
        self.heading_data = msg.data

    def stop_robot(self):
        twist_msg = Twist()
        self.twist_publisher.publish(twist_msg)
        self.get_logger().info("Robot stopped.")

    def turn(self, turn_angle=90.0):
        start_heading = self.heading_data
        target_heading = (start_heading + turn_angle) % 360

        while rclpy.ok():
            error = (
                target_heading - self.heading_data + 180
            ) % 360 - 180  # Calculate shortest angle difference
            if abs(error) < 5:  # Allowable error margin
                self.stop_robot()
                self.get_logger().info("Target heading reached. Stopping the robot.")
                return True

            twist_msg = Twist()
            twist_msg.angular.z = (-1 if error > 0 else 1) * 0.5
            self.twist_publisher.publish(twist_msg)

            self.get_logger().info(
                f"Error: {error}, Heading Data: {self.heading_data}, Target Heading: {target_heading}"
            )

            yield False

    def move_forward_until_obstacle(self, distance_threshold=30.0):
        while rclpy.ok():
            front_distance = self.ultrasonic_data[1]
            if front_distance < distance_threshold:
                self.stop_robot()
                self.get_logger().info("Obstacle detected. Stopping the robot.")
                return True

            twist_msg = Twist()
            twist_msg.linear.x = 0.1

            self.twist_publisher.publish(twist_msg)

            yield False

    def follow_wall_right_iterator(self, fwd_threshold=30, right_threshold=20):
        while rclpy.ok():
            twist_msg = Twist()
            twist_msg.linear.x = 0.1

            front_distance, right_distance = (
                self.ultrasonic_data[1],
                self.ultrasonic_data[2],
            )
            if front_distance < fwd_threshold:
                self.stop_robot()
                return True

            if right_distance < right_threshold:
                self.stop_robot()
                return True

            self.twist_publisher.publish(twist_msg)

            yield False

    def solve_maze(self, right_threshold=100):  # follow wall right
        while rclpy.ok():
            yield from self.follow_wall_right_iterator(right_threshold=right_threshold)
            left, front, right = (
                self.ultrasonic_data[0],
                self.ultrasonic_data[1],
                self.ultrasonic_data[2],
            )
            if right < right_threshold:
                yield from self.turn(-90)
            else:
                yield from self.turn(90)
            yield False

    def execute_callback(self, goal_handle):
        self.get_logger().info("Executing goal...")

        # Handle preempting a previously running goal safely
        if self.current_goal_handle is not None and self.current_goal_handle.is_active:
            self.get_logger().info("Preempting previous active goal.")
            self.current_goal_handle.abort()  # Abort the old goal safely

        self.current_goal_handle = goal_handle

        feedback_msg = AutonomousActions.Feedback()
        feedback_msg.status = "Goal is being processed..."
        goal_handle.publish_feedback(feedback_msg)

        success = False

        match goal_handle.request.index:
            case 0:  # Turn 90 degrees
                handler_func = self.turn(turn_angle=90.0)
            case 1:  # Move forward until an obstacle is detected
                handler_func = self.move_forward_until_obstacle(distance_threshold=30.0)
            case 2:
                handler_func = self.solve_maze()
            case _:
                self.get_logger().info("Unknown action index received.")
                return AutonomousActions.Result(success=False)

        rate = self.create_rate(100.0)
        while rclpy.ok():
            if goal_handle.is_cancel_requested:
                self.get_logger().info("Goal canceled.")
                goal_handle.canceled()
                self.stop_robot()
                return AutonomousActions.Result(success=False)

            if not goal_handle.is_active:
                self.get_logger().info(
                    "Goal is no longer active. Exiting execution loop."
                )
                self.stop_robot()
                return AutonomousActions.Result(success=False)

            try:
                success = next(handler_func)
            except StopIteration as e:
                success = e.value
                break

            if success:
                break

            rate.sleep()

        self.stop_robot()

        if success:
            goal_handle.succeed()
            return AutonomousActions.Result(success=True)
        else:
            goal_handle.abort()
            return AutonomousActions.Result(success=False)

    def cancel_callback(self, goal_handle):
        self.get_logger().info("Canceling goal...")
        self.stop_robot()
        return CancelResponse.ACCEPT
