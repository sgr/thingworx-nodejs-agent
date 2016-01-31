var Adaptor = require('thingworx-driver').Adaptor;
var util = require('util');
var path = require('path');
var fs = require('fs');
var readline = require('readline');

function PersistentRegexSearchAdaptor(options) {
	Adaptor.call(this, options);
	
	this.fileCache = {}
	
	this.services = [
		'searchFile'
	];
	
	this.events = [
		'search-hit'
	];
};

util.inherits(PersistentRegexSearchAdaptor, Adaptor);

PersistentRegexSearchAdaptor.prototype.startup = function (callback) {
	if (callback) callback();
};

PersistentRegexSearchAdaptor.prototype.shutdown = function (callback) {
	if (callback) callback();
};

PersistentRegexSearchAdaptor.prototype.searchFile = function (filename, regex, callback) {
	var filepath = path.resolve(filename);
	var adaptor = this;
	regex = new RegExp(regex);
	
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
		
		var readStream = fs.createReadStream(filepath, { start: cachedStats.size });
		var rl = readline.createInterface({
			input: readStream
		});
		
		rl.on('line', function (line) {
			// Execute the regex
			var matches = regex.exec(line);
			if (!matches) return;
			
			setImmediate(function () {
				adaptor.emit('search-hit', [line, matches, regex]);
				if (calback) callback(line, matches, regex);
			});
		
		});
		
		cachedStats.time = stats.mtime;
		cachedStats.size = stats.size;
	});
	
};

module.exports = PersistentRegexSearchAdaptor;