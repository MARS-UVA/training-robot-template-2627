DEV=$(ls /dev | grep cu.usb | head -n 1)

if [ -n "$DEV" ]; then
	echo binding to port: $DEV
	socat TCP-LISTEN:7777,bind=0.0.0.0,reuseaddr,fork /dev/"$DEV",ispeed=115200,ospeed=115200,raw,echo=0,clocal=1,crtscts=0
else
	echo Could not find device \(robot\). Existing /dev:
	ls /dev
fi