#!/bin/bash
#This file is for debuging in IDE locally, to  run node in root.
#You should run the following command manually
#sudo -i
#echo "cwang ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
sudo killall node
sudo -n node "$@"