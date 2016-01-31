var Adaptor = require('thingworx-driver').Adaptor;
var util = require('util');
var path = require('path');
var fs = require('fs');
var readline = require('readline');

function TextSearchAdaptor(options) {
	Adaptor.call(this, options);
	
	this.services = [ 
		'searchFile'
	];
	
	this.events = [
		'search-hit'
	];
};

util.inherits(TextSearchAdaptor, Adaptor);

TextSearchAdaptor.prototype.startup = function (callback) {	
	if (callback) callback();
};

TextSearchAdaptor.prototype.shutdown = function (callback) {
	if (callback) callback();
};

TextSearchAdaptor.prototype.searchFile = function (filename, token, callback) {
	var filepath = path.resolve(filename);
	var adaptor = this;
	
	// Setup an interface to emit events when a line is read.  readline will consume
	// the stream created by createReadStream and emit events when each line is read
	var readStream = fs.createReadStream(filepath);
	var rl = readline.createInterface({
		input: readStream
	});
	
	rl.on('line', function (line) {
		if (line.indexOf(token) != -1) {
			setImmediate(function () {
				adaptor.emit('search-hit', [line, token]);
				if (callback) callback(line, token);
			});
		}
	});
};

module.exports = TextSearchAdaptor;