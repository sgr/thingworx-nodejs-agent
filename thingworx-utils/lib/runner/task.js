var eventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var debug = require('debug')('thingworx-utils:Task');

var taskTypes = ['periodic', 'continuous', 'once'];
var events = ['start', 'finish', 'cancel'];

function Task(task, options) {
	
	if (!(typeof task == 'function'))
		throw new Error('First argument must be function');

	options = options || {}
	
	debug('Creating new task - %s', util.inspect(options));

	this.running = false;
	this.options = options;
	this.type = options.type;
	this.name = options.name;
	this.task = task;
	this.cancelHandler = null;

	// Enforce single logger instance
	eventEmitter.call(this);
};

util.inherits(Task, eventEmitter);

Task.prototype.run = function () {
	var task = this;
	var start = new Date().getTime();
	setImmediate(function () {
		debug('Starting task %s', task.name);
		task.emit('start');
	});

	var finishedCb = function () {
		end = new Date().getTime();
		var duration = end - start;
		setImmediate(function () {
			debug('Finished task %s (took %sms)', task.name, duration);
			task.emit('finish', duration);
		});	}
	
	// call the task's function handler
	this.task(finishedCb);
}

Task.prototype.cancel = function () {
	var task = this;
	if (this.cancelHandler) this.cancelHandler();

	setImmediate(function () {
		debug('Canceling task %s', task.name);
		task.emit('cancel');
	});}

module.exports = Task;