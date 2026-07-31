cmake_minimum_required(VERSION 3.8)
project(teleop_msgs)

if(NOT CMAKE_CXX_STANDARD)
  set(CMAKE_CXX_STANDARD 14)
endif()

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# 1. Find the interface generation package
find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)

# 2. Declare the message files
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/GamepadState.msg"
  "msg/StickPosition.msg"
)

# 3. Export dependencies so downstream packages can find them
ament_package()
