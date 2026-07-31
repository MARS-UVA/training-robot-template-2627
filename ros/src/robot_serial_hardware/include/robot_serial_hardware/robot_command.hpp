#pragma once

#include <cstdint>
typedef struct Command
{
    double left;
    double right;
} Command;

typedef struct Feedback
{
    uint64_t timestamp;
    double left_ultrasonic;
    double front_ultrasonic;
    double right_ultrasonic;
    double heading;
} Feedback;
