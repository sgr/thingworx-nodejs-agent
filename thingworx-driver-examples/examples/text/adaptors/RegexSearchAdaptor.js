var Adaptor = require('thingworx-driver').Adaptor;
var Adaptor = require('thingworx-driver').Adaptor;
var util = require('util');
var path = require('path');
var fs = require('fs');
var readline = require('readline');

function RegexSearchAdaptor(options) {
	Adaptor.call(this, options);
	
	this.services = [
		'searchFile'
	];
	
	this.events = [
		'search-hit'
	];
};

util.inherits(RegexSearchAdaptor, Adaptor);

RegexSearchAdaptor.prototype.startup = function (callback) {
	
	if (callback) callback();
};

RegexSearchAdaptor.prototype.shutdown = function (callback) {
	
	if (callback) callback();
};

RegexSearchAdaptor.prototype.searchFile = function (filename, regex, callback) {
	var filepath = path.resolve(filename);
	var adaptor = this;
	regex = new RegExp(regex);
	
	// Setup an interface to emit events when a line is read.  readline will consume
	// the stream created by createReadStream and emit events when each line is read
	var readStream = fs.createReadStream(filepath);
	var rl = readline.createInterface({
		input: readStream
	});
	
	rl.on('line', function (line) {
		// Execute the regex
		var matches = regex.exec(line);
		if (!matches) return;
		
		setImmediate(function () {
			adaptor.emit('search-hit', [line, matches, regex]);
			if (callback) callback(line, matches, regex);
		});
		
	});
};

module.exports = RegexSearchAdaptor;