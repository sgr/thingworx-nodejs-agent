'use strict';

var util = require('util');
var eventEmitter = require('events').EventEmitter;
var debug = require('debug')('thingworx-core:Binding');

function TwxBinding() {
	
	eventEmitter.call(this);

    this.events = [];
};

util.inherits(TwxBinding, eventEmitter);

module.exports = TwxBinding;