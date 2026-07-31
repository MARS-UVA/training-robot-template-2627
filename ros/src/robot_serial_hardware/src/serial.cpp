#include "robot_serial_hardware/serial.hpp"

#include <fcntl.h>
#include <unistd.h>
#include <termios.h>
#include <cstring>
#include <rclcpp/rclcpp.hpp>
#include <boost/asio.hpp>
#include <boost/bind/bind.hpp>

namespace robot_serial_hardware
{

Serial::Serial() : serial_(io_)
{
}

Serial::~Serial()
{
    close();
}

bool Serial::open(const std::string &port, int baudrate)
{
    try {
        serial_.open(port);
        serial_.set_option(boost::asio::serial_port_base::baud_rate(baudrate));
        serial_.set_option(boost::asio::serial_port_base::character_size(8));
        serial_.set_option(boost::asio::serial_port_base::parity(boost::asio::serial_port_base::parity::none));
        serial_.set_option(boost::asio::serial_port_base::stop_bits(boost::asio::serial_port_base::stop_bits::one));
    } catch (const boost::system::system_error &e) {
        RCLCPP_ERROR(
            rclcpp::get_logger("Serial"),
            "Failed to open serial port: %s",
            e.what()
        );
        return false;
    }

    running_ = true;
    read_thread_ = std::thread(&Serial::read_loop, this);

    return true;
}

void Serial::close()
{
    running_ = false;

    if (serial_.is_open())
        serial_.close();

    if (read_thread_.joinable())
        read_thread_.join();

}

bool Serial::write(Command & cmd)
{
    if (cmd.left < -1.0) cmd.left = -1.0;
    if (cmd.left > 1.0) cmd.left = 1.0;
    if (cmd.right < -1.0) cmd.right = -1.0;
    if (cmd.right > 1.0) cmd.right = 1.0;

    uint8_t left = static_cast<uint8_t>((cmd.left + 1.0) * 127);
    uint8_t right = static_cast<uint8_t>((cmd.right + 1.0) * 127);

    uint8_t data[3] = {0xFF, left, right};

    try {
        boost::asio::write(serial_, boost::asio::buffer(data, sizeof(data)));
    } catch (const boost::system::system_error &e) {
        if (!running_)
            return false;

        RCLCPP_ERROR(
            rclcpp::get_logger("Serial"),
            "Failed to write to serial port: %s",
            e.what()
        );
        return false;
    }

    return true;
}

void Serial::get_feedback(Feedback & feedback)
{
    std::lock_guard<std::mutex> lock(read_mutex_);
    feedback = feedback_;
}

void Serial::read_loop()
{
    uint8_t read_buffer[4 + 4 * sizeof(double)];
    while (running_)
    {
        boost::system::error_code error;
        
        size_t i = 0;
        while (i < 4)
        {
            size_t bytes_read = boost::asio::read(serial_, boost::asio::buffer(&read_buffer[i], 1), error);
            if (error)
            {
                RCLCPP_ERROR(
                    rclcpp::get_logger("Serial"),
                    "Error reading from serial port: %s",
                    error.message().c_str()
                );
                return;
            }

            if (bytes_read == 1 && read_buffer[i] == "mars"[i])
                i++;
            else
                i = 0;
        }

        size_t bytes_transferred = boost::asio::read(serial_, boost::asio::buffer(read_buffer + 4, sizeof(read_buffer) - 4), error);

        if (error)
        {
            RCLCPP_ERROR(
                rclcpp::get_logger("Serial"),
                "Error reading from serial port: %s",
                error.message().c_str()
            );
            return;
        }

        if (bytes_transferred != sizeof(read_buffer) - 4)
        {
            RCLCPP_ERROR(
                rclcpp::get_logger("Serial"),
                "Unexpected number of bytes read: %zu",
                bytes_transferred
            );
            continue;
        }

        handle_read(read_buffer);
    }
}

void Serial::handle_read(uint8_t* read_buffer)
{
    Feedback feedback;
    feedback.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
    std::memcpy(&feedback.left_ultrasonic, &read_buffer[4], sizeof(double));
    std::memcpy(&feedback.front_ultrasonic, &read_buffer[12], sizeof(double));
    std::memcpy(&feedback.right_ultrasonic, &read_buffer[20], sizeof(double));
    std::memcpy(&feedback.heading, &read_buffer[28], sizeof(double));

    {
        std::lock_guard<std::mutex> lock(read_mutex_);
        feedback_ = feedback;
    }
}

}
