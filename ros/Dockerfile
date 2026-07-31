FROM ros:jazzy
ARG USER_GID=1000
ARG USER_UID=1001

SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y python3-pip
ENV SHELL /bin/bash

COPY src /ros2_ws/src
COPY deploy.sh setup-terminal.sh /ros2_ws/
WORKDIR /ros2_ws

RUN rosdep update && rosdep install --from-paths src --ignore-src -r -y

RUN source /opt/ros/jazzy/setup.bash && colcon build --symlink-install

RUN chmod +x /ros2_ws/setup-terminal.sh /ros2_ws/deploy.sh

# [Optional] Set the default user. Omit if you want to keep the default as root.
ENTRYPOINT [ "/ros2_ws/deploy.sh" ]
