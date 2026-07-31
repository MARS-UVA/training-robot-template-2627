#!/bin/bash
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
export ZENOH_CONFIG_OVERRIDE="mode=\"client\";connect/endpoints=[\"tcp/$ROBOT_IP:7447\"]"
source /opt/ros/jazzy/setup.bash
source $(dirname -- "${BASH_SOURCE[0]}")/../ros/install/setup.bash
