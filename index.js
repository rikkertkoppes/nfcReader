var nfc = require('nfc').nfc;
var n = new nfc();
var exec = require('child_process').exec;
var path = require('path');
var config = require('./config.json');

var Pusher = require('pusher');
 
var pusher = new Pusher(config);

var currentTag;
var removeDelay = 100;
var removeTimer;

function beep() {
	console.log('beep');
	exec(['aplay',path.resolve('beep-07.wav')].join(' '));
}

function handleDetect(uid) {
	var a = Array.prototype.slice.call(uid).map(function(b) {
		var s = b.toString(16);
		if (s.length < 2) {
			s = '0'+s;
		}
		return s;
	}).join('-').toUpperCase();
	clearTimeout(removeTimer);
	if (a !== currentTag) {
		currentTag = a;
	    handleEvent({
	    	type: 'detect',
	    	uid: currentTag
	    });
	    beep();
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
	//push to pusher
	pusher.trigger('camarillo', 'scan-uid', e);
	console.log(JSON.stringify(e));
}

n.on('uid', function(uid) {
	handleDetect(uid);
});

n.start();