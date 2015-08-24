RFID reader demo
=======

works with the ACR122 nfc reader, possibly with others, using node-nfc lib: <https://github.com/camme/node-nfc>

outputs a json message in stdout:

	node index.js

output:

	{"type":"detect","uid":"47-22-91-0"}
	{"type":"remove","uid":"47-22-91-0"}

also, you could pipe these events into mclient:

	node index.js | mclient -n blib -t rfid -i json