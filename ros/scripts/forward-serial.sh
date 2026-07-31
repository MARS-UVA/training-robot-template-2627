#!/bin/sh
sudo socat PTY,link=/dev/ttyUSB0,raw,echo=0,b115200,perm=0777 TCP:localhost:7777
