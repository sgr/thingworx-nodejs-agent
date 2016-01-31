"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');

function Driver(options) {
	
	EventEmitter.call(this);
	
	options = options || {};
	
	this.name = options.name;
	this.thing = options.thing;
	this.adaptor = options.adaptor;
	this.tick_rate = options.tick_rate;
	
	// List of services - aka API functions implemented by the driver or adaptor
	this.services = [];
	
	// Proxy all services and events implemented by the adaptor
	if (this.adaptor) {
		this.proxyServices(this.adaptor.services);
		this.proxyEvents(this.adaptor.events);
	}
};

util.inherits(Driver, EventEmitter);

Driver.prototype.start = function () {
	throw new Error("Driver#start must be implemented in child");
};

Driver.prototype.stop = function () {
	throw new Error("Driver#stop must be implemented in child");
};

Driver.prototype.proxyEvents = function (events) {
	_.each(events, function (event) {
		this.proxyEvent(event);
	}, this);
}

Driver.prototype.proxyEvent = function (event) {
	this.adaptor.on(event, function proxyEvent() {
		this.emit.apply(this, arguments);
	});
};

Driver.prototype.proxyServices = function (services) {
	_.each(services, function (service) {
		this.proxyService(service);
	}, this);
}

Driver.prototype.proxyService = function (service) {
	if (this.services[service]) throw new Error('Service already exists');
	if (this[service]) throw new Error('Service name is not allowed');
	if (!this.adaptor) throw new Error('Cannot proxy service with undefined adaptor');
	var adaptor = this.adaptor;
	
	// Will create a function on the driver that will proxy service calls to the
	// adaptor
	this[service] = function proxyService() {
		return adaptor[service].apply(adaptor, arguments);
	};
};

module.exports = Driver;