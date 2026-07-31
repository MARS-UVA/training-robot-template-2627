from launch import LaunchDescription
from launch_xml.launch_description_sources import XMLLaunchDescriptionSource
from launch.actions import IncludeLaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    rosbridge_launch = IncludeLaunchDescription(
        XMLLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory('rosbridge_server'),
                'launch',
                'rosbridge_websocket_launch.xml'
            )
        )
    )

    # custom_node = Node(
    #     package='ros_bridge_server',
    #     executable='ros_bridge_server_node',
    #     output='screen'
    # )

    return LaunchDescription([
        rosbridge_launch,
        # custom_node
    ])
