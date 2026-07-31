from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch_ros.actions import Node
from launch.conditions import IfCondition
from launch.substitutions import Command, PathJoinSubstitution, LaunchConfiguration
from launch_ros.substitutions import FindPackageShare
from launch_ros.parameter_descriptions import ParameterFile


def generate_launch_description():
    use_sim_time = LaunchConfiguration("use_sim_time")
    backend = LaunchConfiguration("robot_backend")

    use_sim_time_arg = DeclareLaunchArgument(
        "use_sim_time",
        default_value="false",
        description="Use simulation clock if true",
    )
    backend_arg = DeclareLaunchArgument(
        "robot_backend",
        default_value="serial",
        description="Backend for the robot hardware interface (serial, mock)",
    )
    args = [use_sim_time_arg, backend_arg]
    
    startup_pkg = FindPackageShare("startup")

    robot_description = Command([
        "xacro ",
        PathJoinSubstitution([
            startup_pkg,
            "robots",
            "training_robot",
            "urdf",
            "robot.urdf.xacro"
        ]),
        " robot_backend:=", backend,
    ])

    controller_config = ParameterFile(
        PathJoinSubstitution([
            startup_pkg,
            "robots",
            "training_robot",
            "config",
            "controllers.yaml"
        ]),
        allow_substs=True
    )

    zenoh = Node(
        package="rmw_zenoh_cpp",
        executable="rmw_zenohd",
        name="rmw_zenohd",
        output="screen",
        parameters=[
            {"zenoh_router_port": 7447},
            {"zenoh_router_log_level": "info"}
        ]
    )

    return LaunchDescription([
        *args,
        zenoh,
        # Publishes TF
        Node(
            package="robot_state_publisher",
            executable="robot_state_publisher",
            parameters=[
                {"robot_description": robot_description},
                {"use_sim_time": use_sim_time},
            ],
        ),

        # Starts ros2_control and hardware interface
        Node(
            package="controller_manager",
            executable="ros2_control_node",
            parameters=[
                {"robot_description": robot_description},
                controller_config
            ],
            output="screen",
        ),

        # Publishes joint states so robot_state_publisher can build the TF tree
        Node(
            package="controller_manager",
            executable="spawner",
            arguments=[
                "joint_state_broadcaster",
                "--controller-manager",
                "/controller_manager"
            ],
            output="screen",
        ),

        # Loads drive controller
        Node(
            package="controller_manager",
            executable="spawner",
            arguments=[
                "diff_drive_controller",
                "--controller-manager",
                "/controller_manager"
            ],
            output="screen",
        ),

        # Multiplex the cmd_vel topic to allow for multiple sources of velocity commands
        Node(
            package="twist_mux",
            executable="twist_mux",
            remappings=[
                ("/cmd_vel_out", "/cmd_vel"),
            ],
            parameters=[
                { "use_sim_time": use_sim_time },
                { "use_stamped": False },
                PathJoinSubstitution([
                    startup_pkg,
                    "robots",
                    "training_robot",
                    "config",
                    "twist_mux.yaml"
                ])
            ],
            output="screen",
        ),

        # Stamp twist messages with the current time so that the robot doesn't stop moving when the controller is restarted
        Node(
            package="twist_stamper",
            executable="twist_stamper",
            remappings=[
                ("/cmd_vel_in", "/cmd_vel"),
                ("/cmd_vel_out", "/diff_drive_controller/cmd_vel"),
            ],
            parameters=[
                { "frame_id": "base_link" },
            ],
            output="screen",
        ),

        # Starts the autonomy action server node
        Node(
            package="autonomy_server",
            executable="autonomy_action_server",
            output="screen",
        
        )
    ])
