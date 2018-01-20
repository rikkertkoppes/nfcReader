var nfc = require('nfc').nfc;
var n = new nfc();
var exec = require('child_process').exec;
var path = require('path');
var config = require('./config.json');
var request = require('request');

var Pusher = require('pusher');
 
var pusher = new Pusher(config.pusher);

var currentTag;
var removeDelay = 100;
var removeTimer;
var endpoint = config.camarillo.endpoint + 'controls/';
var key = config.camarillo.key;

function handleResponse(cb) {
	return function(err, res) {
		if (err) {return console.log(err);}
		cb(JSON.parse(res.body));
	}
}

function getParts(competitionId, cb) {
	var url = endpoint + 'competitions/' + competitionId + '/parts?key='+key;
	request.get(url, handleResponse(cb));
}

function getCompetitions(cb) {
	var url = endpoint + 'competitions?key='+key;
	request.get(url, handleResponse(cb));	
}

function fetchParts(cb) {
	getCompetitions(function(competitions) {
		getParts(competitions[0]._id, cb);
	});
}

function checkPerformance(uid, parts) {
	var performances = parts.reduce(function(all, part) {
		return all.concat(part.performances.filter(function(performance) {
			return performance.member.meta.uuid == uid;
		}));
	}, []);
	console.log(performances.length);
	performances.forEach(function(performance) {
		var url = endpoint + 'parts/'+performance.partId+'/performances/'+performance.id+'/status?key='+key;
		console.log(url);
		var status = performance.meta.status === 'done_all'?'done_all':'done';
		var name = [performance.member.firstName,performance.member.infix,performance.member.lastName].join(' ');
		console.log('set',name,'to',status);
		request.put(url, {
			body: {
				status: status
			},
			json: true
		});
	});
}

function beep() {
	console.log('beep');
	exec(['aplay',path.resolve('beep-07.wav')].join(' '));
}

function handleDetect(uid, context) {
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
	    }, context);
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

function handleEvent(e, context) {
	if (e.type === 'detect') {
		//push to pusher
		pusher.trigger('camarillo', 'scan-uid', e);
		checkPerformance(e.uid, context);
	}
	console.log(JSON.stringify(e));
}

fetchParts(function(parts) {
	n.on('uid', function(uid) {
		handleDetect(uid, parts);
	});

	n.start();
});
