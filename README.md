This repository is for the training bots


# Setup for wired connection on Windows (should work out of the box on macOS and linux)
1. Download rndis Drivers folder from [drive](https://drive.google.com/drive/folders/1vp15AP7IleiJO3sMvx1e3Ac8UWMjBjDx?usp=drive_link)

2. Plug in raspberry pi to laptop via usb-c port

3. Open Device Manager

4. Scroll down to Ports (COM & LPT)

5. Find Pi's USB port (Usually called COM3 or similar, if you unplug the pi it disappears)

6. Right click on the port, and select update driver> browse my computer for drivers> Select the driver folder you downloaded in step 1


# Pulling code on to the pi
1. Plug pi into your laptop via usb-c

2. ssh into the pi
`ssh mars@hostname.local` where hostname is the label on the pi's ethernet port

3. `sudo nmcli conn up eduroam`

4. Navigate to the directory you want to update and `git pull`


# Building and running image
1. Navigate to directory with the Dockerfile in it and make sure it's updated
2. run `docker build -t image-name:tag .` where image-name:tag is the name of your docker image
    * if you need internet for building, follow setup for wired connection
    * if you're building for the pi on a computer with amd64 hardware, you need to include `--platform linux/arm64`
3. run `docker run -it --privileged image-name:tag` to start the container
    * This step should be done connected over wifi, not wired

connect via wifi for this step, not wired
