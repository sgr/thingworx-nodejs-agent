"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Adaptor(options) {
	
	EventEmitter.call(this);
	
	options = options || {};	
	this.name = options.name;
};

util.inherits(Adaptor, EventEmitter);

Adaptor.prototype.startup = function () {
	throw new Error("Adaptor#startup must be implemented in child");
};

Adaptor.prototype.shutdown = function () {
	throw new Error("Adaptor#shtudown must be implemented in child");
};

module.exports = Adaptor;