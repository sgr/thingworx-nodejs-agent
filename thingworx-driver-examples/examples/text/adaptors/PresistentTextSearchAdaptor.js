var Adaptor = require('thingworx-driver').Adaptor;
var util = require('util');
var path = require('path');
var fs = require('fs');
var readline = require('readline');

function PersistentTextSearchAdaptor(options) {
	Adaptor.call(this, options);
	
	this.fileCache = {}

	this.services = [
		'searchFile'
	];

	this.events = [
		'search-hit'
	];
};

util.inherits(PersistentTextSearchAdaptor, Adaptor);

PersistentTextSearchAdaptor.prototype.startup = function (callback) {
	if (callback) callback();
};

PersistentTextSearchAdaptor.prototype.shutdown = function (callback) {
	if (callback) callback();
};

PersistentTextSearchAdaptor.prototype.searchFile = function (filename, token, callback) {
	var filepath = path.resolve(filename);
	var adaptor = this;
	
	fs.stat(filepath, function (err, stats) {
		var cachedStats = adaptor.fileCache[filepath];

		if (!cachedStats) {
			cachedStats = { time: 0, size: 0 }
			adaptor.fileCache[filepath] = cachedStats;
		} else if (cachedStats.size == stats.size) {
			return;
		}
		
		// Check to see if the file rolled over
		if (stats.size < cachedStats.size) {
			cachedStats.size = 0;	
		}

		console.log(stats);
		console.log(cachedStats);

		var readStream = fs.createReadStream(filepath, { start: cachedStats.size });
		var rl = readline.createInterface({
			input: readStream
		});
		
		rl.on('line', function (line) {
			if (line.indexOf(token) != -1) {
				setImmediate(function () {
					adaptor.emit('search-hit', [line, token]);
					if(callback) callback(line, token);
				});
			}
		});
		
		cachedStats.time = stats.mtime;
		cachedStats.size = stats.size;
	});
	
};

module.exports = PersistentTextSearchAdaptor;