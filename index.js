
var nfc = require('nfc').nfc;
var n = new nfc();

var currentTag;
var removeDelay = 100;
var removeTimer;

function handleDetect(uid) {
	var a = Array.prototype.slice.call(uid).map(function(b) {
		return b.toString(16);
	}).join('-').toUpperCase();
	clearTimeout(removeTimer);
	if (a !== currentTag) {
		currentTag = a;
	    handleEvent({
	    	type: 'detect',
	    	uid: currentTag
	    });
	}
	removeTimer = setTimeout(handleRemove,removeDelay);
}

function handleRemove() {
	handleEvent({
		type: 'remove',
		uid: currentTag
	})
	currentTag = undefined;
}

function handleEvent(e) {
	console.log(JSON.stringify(e));
}

n.on('uid', function(uid) {
	handleDetect(uid);
});

n.start();