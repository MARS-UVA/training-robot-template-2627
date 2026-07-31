#!/bin/bash
cd "$(dirname -- "${BASH_SOURCE[0]}")"
colcon build --symlink-install
source setup-terminal.sh && ros2 launch src/startup/launch/startup.py "$@"
