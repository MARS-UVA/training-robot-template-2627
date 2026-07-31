#include "robot_serial_hardware/robot_serial_hardware.hpp"

#include <cmath>
#include <cstring>

#include "pluginlib/class_list_macros.hpp"
#include "rclcpp/rclcpp.hpp"

#include "robot_serial_hardware/robot_command.hpp"

namespace robot_serial_hardware
{

hardware_interface::CallbackReturn RobotSerialHardware::on_init(
    const hardware_interface::HardwareInfo & info)
{
    if (hardware_interface::SystemInterface::on_init(info) != hardware_interface::CallbackReturn::SUCCESS)
        return hardware_interface::CallbackReturn::ERROR;

    heading_pub_ = get_node()->create_publisher<std_msgs::msg::Float64>(
        "/heading",
        rclcpp::QoS(10)
    );

    // TODO: create a publisher to publish /ultrasonic sensor data

    auto port = info.hardware_parameters.at("port");
    auto baud = std::stoi(info.hardware_parameters.at("baudrate"));

    RCLCPP_INFO(
        rclcpp::get_logger("RobotSerialHardware"),
        "Opening serial port %s @ %d",
        port.c_str(),
        baud
    );

    if (serial_.open(port, baud))
    {
        RCLCPP_INFO(
            rclcpp::get_logger("RobotSerialHardware"),
            "Serial port opened successfully"
        );
        return hardware_interface::CallbackReturn::SUCCESS;
    }
    else
    {
        RCLCPP_ERROR(
            rclcpp::get_logger("RobotSerialHardware"),
            "Failed to open serial port"
        );
        return hardware_interface::CallbackReturn::ERROR;
    }
}


hardware_interface::CallbackReturn RobotSerialHardware::on_activate(const rclcpp_lifecycle::State &)
{
    RCLCPP_INFO(
        rclcpp::get_logger("RobotSerialHardware"),
        "Activating hardware"
    );

    for (const auto & [name, descr] : joint_command_interfaces_)
    {
        set_command(name, 0.0);
    }
    return hardware_interface::CallbackReturn::SUCCESS;
}



hardware_interface::CallbackReturn RobotSerialHardware::on_deactivate(const rclcpp_lifecycle::State &)
{
    RCLCPP_INFO(
        rclcpp::get_logger("RobotSerialHardware"),
        "Stopping hardware"
    );

    Command stop;

    stop.left = 0;
    stop.right = 0;

    serial_.write(stop);

    serial_.close();

    return hardware_interface::CallbackReturn::SUCCESS;
}

hardware_interface::return_type RobotSerialHardware::write(const rclcpp::Time &, const rclcpp::Duration &)
{
    Command cmd;
    cmd.left = (get_command("front_left_wheel_joint/velocity")
    + get_command("rear_left_wheel_joint/velocity")) / 2.0;
    
    cmd.right = (get_command("front_right_wheel_joint/velocity")
    + get_command("rear_right_wheel_joint/velocity")) / 2.0;

    serial_.write(cmd);

    return hardware_interface::return_type::OK;
}

hardware_interface::return_type RobotSerialHardware::read(const rclcpp::Time &, const rclcpp::Duration &)
{

    Feedback feedback;

    serial_.get_feedback(feedback);

    std_msgs::msg::Float64 heading_msg;
    heading_msg.data = feedback.heading;
    heading_pub_->publish(heading_msg);

    std_msgs::msg::Float64MultiArray ultrasonic_msg;
    // TODO: populate the ultrasonic_msg with the feedback data sent by the serial and publish the message

    return hardware_interface::return_type::OK;
}

}

PLUGINLIB_EXPORT_CLASS(
    robot_serial_hardware::RobotSerialHardware,
    hardware_interface::SystemInterface
)
