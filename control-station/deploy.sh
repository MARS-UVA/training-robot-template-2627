#!/bin/bash
ROBOT_IP="${1:-$(hostname -I | awk '{print $1}')}"

cd "$(dirname -- "${BASH_SOURCE[0]}")"
source setup-terminal.sh $ROBOT_IP
tmux new-session "ros2 launch src/ros_bridge_server.launch.py" \; split-window -h "npm run dev -- --host 0.0.0.0 --port 5173"
