var eventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var Task = require('./task.js');

var runnerSingleton = null;

var events = ['start', 'stop', 'error', 'run', 'cancel'];

var Runner = function () {
	this.running = false;
	this.taskList = [];	
	eventEmitter.call(this);
};

util.inherits(Runner, eventEmitter);

Runner.prototype.start = function () {
	if (this.running) return;
	this.running = true;

	// Make a task run continiously 	
	var continuous = function (task) {
		var runFunc = null;
		if (task.options.throttle) {
			runFunc = _.throttle(_.bind(task.run, task), task.options.throttle, { leading: false, trailing: true });
		} else {
			runFunc = _.bind(task.run, task);
		}
		
		// When the task has finished, run again		
		task.once('finish', function () {
			continuous(task);
		});
		
		// Handle cancel requests
		var handle = setImmediate(runFunc);
		task.cancelHandler = function () {
			clearImmediate(handle);
		};
	}
	
	// Make a task run periodicly
	var periodic = function (task, delay) {
		if (!task) throw new Error('task cannot be undefined');
		if (!task.options.tick_rate) throw new Error('task must have tick_rate option'); 

		var runFunc = _.bind(task.run, task);
		var tickRate = task.options.tick_rate;
				
		// Once the task has finished, figure out when it should be run again
		task.once('finish', function (duration) {
			var delay = (tickRate - duration) > 0 ? tickRate - duration : undefined;
			periodic(task, delay);
		});
		
		// If delay is set, use setTimeout to schedule the task
		if (delay) {
			var handle = setTimeout(runFunc, delay);
			task.cancelHandler = function () {
				clearTimeout(handle);
			};
		}
		// Otherwise use setImmediate
		else {
			var handle = setImmediate(runFunc);
			task.cancelHandler = function () {
				clearImmediate(handle);
			};
		}
	}
	
	// Make a task run once	
	var once = function (task) {
		var runFunc = _.bind(task.run, task);
		var delay = task.options.delay;
		
		if (delay) {
			var handle = setTimeout(runFunc, delay);
			task.cancelHandler = function () {
				clearTimeout(handle);
			};
		} else {
			setImmediate(runFunc);
			task.cancelHandler = function () {
			/* Empty */	
			};
		}
	}
	
	_.each(this.taskList, function (task) {
		switch (task.type) {
			case 'periodic':
				periodic(task);
				break;

			case 'continuous':
				continuous(task);
				break;

			case 'once':
				once(task);
				break;

			default:
				break;
		}
	});
};

Runner.prototype.addTask = function (options, task, context) {
	if (this.running) throw new Error('Cannot add task when Runner is running - call stop()');
	var t = new Task(_.bind(task, context), options);
	this.taskList.push(t);
};

Runner.prototype.stop = function () {
	if (!this.running) return;
	this.running = false;
	
	_.each(this.taskList, function (task) {
		task.cancel();
	});
	
	setImmediate(_.bind(function () {
		this.emit('stop');
	}, this));
};

module.exports = Runner;
