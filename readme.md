RFID reader demo
=======

works with the ACR122 nfc reader, possibly with others, using node-nfc lib: <https://github.com/camme/node-nfc>

outputs a json message in stdout:

	node index.js

output:

	{"type":"detect","uid":"47-22-91-00"}
	{"type":"remove","uid":"47-22-91-00"}

also, you could pipe these events into mclient:

	node index.js | mclient -n blib -t rfid -i json

Steps to create a RaspberryPI + ACR122 compact package
===========

Combining the ACR122 with a Raspberry pi seems like a nice idea. It results in a compact setup that only needs a bit of power if you equip the raspberry pi with a wireless dongle.

The idea is as follows:

- make ACR122 work on RPi
- make the RPi discoverable over the network (using avahi)
- add mhub as a message server
- add a simple server to display a setttings / howto page
- allow configurable post hooks
- wrap the whole in a nice box

The execution is a bit more elaborate:

- setup the pi with a basic image
- boot, enable ssh
- change password
- make pi boot to console
	- `sudo raspi-config`
	- in boot options, choose console
- make pi discoverable [1]
	- `sudo apt-get update`
	- `sudo nano /etc/dhcp/dhclient.conf`
	- `send host-name "nfc-pi";` don't forget the semicolon at the end
	- `sudo apt-get install samba`
	- `sudo apt-get install winbind`
	- `sudo nano /etc/samba/foreversmb.conf`
	- `workgroup = WORKGROUP` this should be the windows network group
	- `sudo nano /etc/nsswitch.conf`
	- `hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4 wins`
	- `sudo reboot`
	! this does not work yet, not quite sure what's going on
- install git
- install nodejs
- install libnfc
- install the nfcReader package
	- `git clone https://github.com/rikkertkoppes/nfcReader.git`
	- `cd nfcReader`
	- `npm install`
- plug in the ACR122 and testrun (as root to be able to claim the USB interface)
	- `sudo node index.js`
	- this should react to nfc / rfid tags
- install mhub:
	- `sudo npm install -g mub`
- install forever
	- `sudo npm install -g forever`
	- `sudo npm install -g forever-service`
- provision mserver as a service (to autostart it on boot and restart if it crashes)
	- `sudo forever-service install mserver -s /usr/local/bin/mserver`
	- `sudo update-rc.d mserver defaults`
	- `sudo service mserver start`
	! this does not work yet, dunno what's going on


[1] More info:

- https://www.raspberrypi.org/forums/viewtopic.php?f=29&t=7795
- https://rasspberrypi.wordpress.com/2012/09/08/connect-to-rasspberry-pi-using-hostname/