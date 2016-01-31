var Driver = require('thingworx-driver').Driver;
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

function XMLDriver(options) {
	Driver.call(this, options);
		
	this.watchers = {}
};

util.inherits(XMLDriver, Driver);

XMLDriver.prototype.monitorFile = function (filename, token, callback) {
	filename = path.resolve(filename);
	var driver = this;
	if (this.watchers[filename]) throw new Error('File is already being monitored');
	var watcher = fs.watch(filename);
	watcher.on('change', _.debounce(function () {
		driver.searchFile(filename, token, callback);
	}, 50, true));
	
	this.watchers[filename] = watcher;
};

XMLDriver.prototype.start = function () {
	var driver = this;
	setImmediate(function () {
		driver.emit('start');
	});
};

XMLDriver.prototype.stop = function () {
	
	// Clean up any file watchers
	for (var file in this.watchers) {
		if (this.watchers.hasOwnProperty(file)) {
			var watcher = this.watchers[file]
			watcher.close();
			delete this.watchers[file];
		}
	}
	
	var driver = this;
	setImmediate(function () {
		driver.emit('start');
	});
};

module.exports = XMLDriver;