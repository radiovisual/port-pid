'use strict';
var condense = require('selective-whitespace');
var eachAsync = require('each-async');
var netstats = require('netstats');
var platform = process.platform;
require('native-promise-only');

var pids = {
	all: [],
	tcp: [],
	udp: []
};

module.exports = function (port, opts) {
	if (typeof port !== 'number') {
		throw new TypeError('Expected a port number');
	}

	opts = opts || {};

	return new Promise(function (resolve) {
		netstats(port).then(function (stats) {
			process(stats).then(function (ps) {
				resolve(ps);
			});
		}).catch(function () {
			resolve(pids);
		});
	});
};

function process(arr) {
	var pidindex = 1;
	var items = arr.slice(1);

	if (platform === 'win32') {
		items = arr;
	}

	return new Promise(function (resolve, reject) {
		eachAsync(items, function (item, index, done) {
			var values = condense(item).split(' ');
			var pid = parseInt(values[pidindex], 10);

			if (platform === 'win32') {
				pid = values.pop();
			}

			if (values.length > 1) {
				if (values.indexOf('TCP') !== -1) {
					pushTo(pids.tcp, pid);
					pushTo(pids.all, pid);
				} else if (values.indexOf('UDP') !== -1) {
					pushTo(pids.udp, pid);
					pushTo(pids.all, pid);
				}
			}
			done();
		}, function (err) {
			if (err) {
				reject(err);
			}
			resolve(pids);
		});
	});
}

function pushTo(target, item) {
	if (item !== '' && !isNaN(item) && item !== 0 && target.indexOf(item) === -1) {
		target.push(item);
	}
}

// Example output to parse:

// [MAC] $ lsof -i :8017
/*
 COMMAND   PID    USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
 nc      20661 michael    3u  IPv4 0x3b190d9d07c2c3db      0t0  TCP *:8017 (LISTEN)
 nc      21145 michael    3u  IPv4 0x3b190d9d054773db      0t0  TCP *:8017 (LISTEN)
 Python  21221 michael    3u  IPv4 0x3b190d9ceb8dfd7b      0t0  UDP localhost:8017
 */

// [WIN] $ netstat.exe -a -n -o | findstr :9000

/*
 TCP    0.0.0.0:9000           0.0.0.0:0              LISTENING       5220
 TCP    127.0.0.1:9000         127.0.0.1:62376        ESTABLISHED     5220
 TCP    127.0.0.1:9000         127.0.0.1:62379        ESTABLISHED     5220
 TCP    127.0.0.1:62288        127.0.0.1:9000         TIME_WAIT       0
 TCP    127.0.0.1:62299        127.0.0.1:9000         TIME_WAIT       0
 TCP    127.0.0.1:62376        127.0.0.1:9000         ESTABLISHED     7604
 TCP    127.0.0.1:62378        127.0.0.1:9000         ESTABLISHED     7604
 UDP    127.0.0.1:9000         *:*                                    1240
 */
