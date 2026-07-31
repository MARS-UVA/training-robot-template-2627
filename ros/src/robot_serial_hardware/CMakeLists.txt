cmake_minimum_required(VERSION 3.8)
project(robot_serial_hardware)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(hardware_interface REQUIRED)
find_package(pluginlib REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_lifecycle REQUIRED)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

add_library(
  robot_serial_hardware
  SHARED
  src/robot_serial_hardware.cpp
  src/serial.cpp
)

target_include_directories(
  robot_serial_hardware
  PUBLIC
  include
)

target_link_libraries(
  robot_serial_hardware PUBLIC
  hardware_interface::hardware_interface
  hardware_interface::mock_components
  pluginlib::pluginlib
  rclcpp::rclcpp
  rclcpp_lifecycle::rclcpp_lifecycle
)


install(
  TARGETS
  robot_serial_hardware
  DESTINATION lib
)

install(
  DIRECTORY include/
  DESTINATION include
)

install(
  FILES robot_serial_hardware.xml
  DESTINATION share/${PROJECT_NAME}
)

pluginlib_export_plugin_description_file(hardware_interface robot_serial_hardware.xml)

ament_package()
