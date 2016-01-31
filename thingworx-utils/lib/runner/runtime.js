var eventEmitter = require('events').EventEmitter;
var ref = require('ref');
var libtwx = require('thingworx-ffi').LibTWX;
var Runner = require('./runner.js');
var logger = require('../logger/logger.js');
var util = require('util');
var _ = require('underscore');

var runtimeSingleton = null;

// Private Runner creation function - forces one global singleton instance
var getSingleton = function () {
	if (runtimeSingleton == null) {
		runtimeSingleton = new Runtime();
	}
	
	return runtimeSingleton;
};

function Runtime() {
	
	Runner.call(this);
	
	// Add a task to tick the C API Event Loop - twApi_TaskerFunction().
	// Will tick this function continuously
	this.addTask({ name: 'api event loop', type: 'continuous' }, function (done) {
		var datetime = (new Date).getTime();
		libtwx.twApi_TaskerFunction.async(datetime, ref.NULL, function (err, suc) {
			if (err || suc)
				logger.debug('Runtime: error returned from twApi_TaskerFunction (%s)', err ? err : suc);
			
			done();	// Notify Runner that task has completed
		});
	});
	
	// Add a task to tick the C API message handler task - twMessageHandler_msgHandlerTask().
	// Will tick this function continuously, but will not call it more than once every 50 ms
	this.addTask({ name: 'message handler', type: 'continuous', throttle: 50}, function (done) {
		var datetime = (new Date).getTime();
		libtwx.twMessageHandler_msgHandlerTask.async(datetime, ref.NULL, function (err, suc) {
			if (err || suc)
				logger.debug('Runtime: error returned from twMessageHandler_msgHandlerTask (%s)', err ? err : suc);
			
			done();	// Notify Runner that task has completed
		});
	});
	
	// Add a task to check the status of connection.  Will tick this function periodicly at 100 ms
	this.addTask({ name: 'connectivity check', type: 'periodic', tick_rate: 100 }, function (done) {
		if (libtwx.twApi_isConnected() == 0) {
			this.stop();
		}

		done();	// Notify Runner that task has completed
	}, this);
}

util.inherits(Runtime, Runner);

Runtime.prototype.start = function () {
	Runner.prototype.start.call(this);
};

Runtime.prototype.stop = function () {
	Runner.prototype.stop.call(this);
}

module.exports = getSingleton;
