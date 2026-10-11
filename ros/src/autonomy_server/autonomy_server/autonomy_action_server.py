from rclpy.action import ActionServer
from rclpy.node import Node
from autonomy_interfaces.action import AutonomousActions
from std_msgs.msg import Float64, Float64MultiArray
from geometry_msgs.msg import Twist
from rclpy.callback_groups import ReentrantCallbackGroup, MutuallyExclusiveCallbackGroup
import rclpy
import time

class AutonomyActionServer(Node):

    def __init__(self, angular_speed=0.10, linear_speed=0.02):
        super().__init__('autonomy_action_server')

        self.angular_speed = angular_speed
        self.linear_speed = linear_speed

        self.action_cb_group = ReentrantCallbackGroup()
        self.sub_cb_group = MutuallyExclusiveCallbackGroup()

        self._action_server = ActionServer(
            self,
            AutonomousActions,
            'autonomous_actions',
            callback_group=self.action_cb_group,
            execute_callback=self.execute_callback,
            cancel_callback=self.cancel_callback
        )

        self.ultrasonic_subscriber = self.create_subscription(
            msg_type=Float64MultiArray,
            topic='/ultrasonic',
            callback=self.ultrasonic_callback,
            qos_profile=10,
            callback_group=self.sub_cb_group
        )

        self.heading_subscriber = self.create_subscription(
            msg_type=Float64,
            topic='/heading',
            callback=self.heading_callback,
            qos_profile=10,
            callback_group=self.sub_cb_group
        )

        self.twist_publisher = self.create_publisher(Twist, '/autonomy/cmd_vel', 10)

        self.ultrasonic_data = [-1.0, -1.0, -1.0] # Initialize with default values for left, front, and right distances
        self.ultrasonic_data_history = [[*self.ultrasonic_data]*10]  # Last 10 ultrasonic readings
        self.heading_data = 0.0
        self.target_heading = 0.0
        self.current_goal_handle = None

    def ultrasonic_callback(self, msg):
        self.ultrasonic_data = msg.data
        self.ultrasonic_data_history.append(self.ultrasonic_data)
        if len(self.ultrasonic_data_history) > 10:
            self.ultrasonic_data_history.pop(0)
    
    def heading_callback(self, msg):
        self.heading_data = msg.data
    
    def stop_robot(self):
        twist_msg = Twist()
        self.twist_publisher.publish(twist_msg)
        self.get_logger().info('Robot stopped.')
    
    def turn(self, turn_angle=90.0, complete_action=True):
        start_heading = self.heading_data
        target_heading = (start_heading + turn_angle) % 360
        
        while rclpy.ok():
            error = (target_heading - self.heading_data + 180) % 360 - 180  # Calculate shortest angle difference
            if abs(error) < 0.75:  # Allowable error margin
                self.stop_robot()
                self.get_logger().info('Target heading reached. Stopping the robot.')
                return complete_action
            
            twist_msg = Twist()
            twist_msg.angular.z = (-1 if error > 0 else 1) * self.angular_speed
            self.twist_publisher.publish(twist_msg)

            self.get_logger().info(f'Error: {error}, Heading Data: {self.heading_data}, Target Heading: {target_heading}')

            yield False
    
    def turn_to_heading(self, target_heading, complete_action=True):
        time.sleep(0.5)
        while rclpy.ok():
            error = (target_heading - self.heading_data + 180) % 360 - 180  # Calculate shortest angle difference
            if abs(error) < 0.75:  # Allowable error margin
                self.stop_robot()
                self.get_logger().info('Target heading reached. Stopping the robot.')
                return complete_action
            
            twist_msg = Twist()
            twist_msg.angular.z = (-1 if error > 0 else 1) * self.angular_speed
            self.twist_publisher.publish(twist_msg)

            self.get_logger().info(f'Error: {error}, Heading Data: {self.heading_data}, Target Heading: {target_heading}')

            yield False
        
    def move_forward_until_obstacle(self, distance_threshold=15.0, complete_action=True):
        while rclpy.ok():
            front_distance = sum([reading[1] for reading in self.ultrasonic_data_history[-10:]]) / 10  # Calculate average of last 10 readings
            if front_distance < distance_threshold:
                self.stop_robot()
                self.get_logger().info('Obstacle detected. Stopping the robot.')
                return complete_action
            
            twist_msg = Twist()
            twist_msg.linear.x = self.linear_speed

            self.twist_publisher.publish(twist_msg)

            yield False
    
    def go_forward_a_bit(self, how_much, complete_action=True):
        i = 0
        while rclpy.ok() and i < how_much:
            twist_msg = Twist()
            twist_msg.linear.x = self.linear_speed
            self.twist_publisher.publish(twist_msg)
            i += 1
            yield False

        return complete_action
    
    def solve_maze(self):
        start_heading = self.heading_data
        directions = [start_heading,
                      (start_heading + 90) % 360,
                      (start_heading + 180) % 360,
                      (start_heading + 270) % 360]
        current_direction = 0
        
        # Move forward until there's a gap on the right
        while rclpy.ok():
            front_distance = sum([reading[1] for reading in self.ultrasonic_data_history[-10:]]) / 10  # Average front distance
            right_distance = sum([reading[2] for reading in self.ultrasonic_data_history[-10:]]) / 10  # Average right distance
            left_distance = sum([reading[0] for reading in self.ultrasonic_data_history[-10:]]) / 10  # Average left distance
#            if front_distance > 40 and right_distance > 40 and left_distance > 40:
#                self.get_logger().info('Maze solved.')
#                return True

            if front_distance < 15.0:
                self.stop_robot()
                self.get_logger().info('Obstacle detected in front.')
                if left_distance > 25.0:
                    self.get_logger().info('Gap detected on the left. Turning left.')
                    next_direction = (current_direction + 3) % 4 # Turn left
                    yield from self.turn_to_heading(directions[next_direction], complete_action=False)  # Turn left
                    current_direction = next_direction
                    yield False
                else:
                    self.get_logger().info('No gap detected on the left. Turning around.')
                    next_direction = (current_direction + 2) % 4 # Turn left
                    yield from self.turn_to_heading(directions[next_direction], complete_action=False)  # Turn left
                    current_direction = next_direction
                    yield False
            
            elif right_distance > 35.0:
                self.get_logger().info('Gap detected on the right. Turning right.')
                # Move forward a little bit before turning
                yield from self.go_forward_a_bit(5, complete_action=False)
                next_direction = (current_direction + 1) % 4 # Turn right
                yield from self.turn_to_heading(directions[next_direction], complete_action=False)
                current_direction = next_direction
                yield from self.go_forward_a_bit(95, complete_action=False)
                yield False
            
            twist_msg = Twist()
            twist_msg.linear.x = self.linear_speed
            self.twist_publisher.publish(twist_msg)

            yield False
    
    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        # Handle preempting a previously running goal safely
        if self.current_goal_handle is not None and self.current_goal_handle.is_active:
            self.get_logger().info('Preempting previous active goal.')
            self.current_goal_handle.abort() # Abort the old goal safely
        
        self.current_goal_handle = goal_handle

        feedback_msg = AutonomousActions.Feedback()
        feedback_msg.status = 'Goal is being processed...'
        goal_handle.publish_feedback(feedback_msg)

        success = False

        match goal_handle.request.index:
            case 0:  # Turn 90 degrees
                handler_func = self.turn(turn_angle=90.0)
            case 1: # Move forward until an obstacle is detected
                handler_func = self.move_forward_until_obstacle(distance_threshold=30.0)
            case 2: # Solve the maze
                handler_func = self.solve_maze()
            case _:
                self.get_logger().info('Unknown action index received.')
                return AutonomousActions.Result(success=False)

        rate = self.create_rate(100.0)
        while rclpy.ok():
            if goal_handle.is_cancel_requested:
                self.get_logger().info('Goal canceled.')
                goal_handle.canceled()
                self.stop_robot()
                return AutonomousActions.Result(success=False)
            
            if not goal_handle.is_active:
                self.get_logger().info('Goal is no longer active. Exiting execution loop.')
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
        self.get_logger().info('Canceling goal...')
        self.stop_robot()
        return rclpy.action.CancelResponse.ACCEPT
