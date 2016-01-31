'use strict';

var _ = require('underscore');

var TwxBindings = require('./binding.js');
var Primitive = require('./primitive.js');
var debug = require('debug')('thingworx-core:Property');

var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var ref = require('ref');
var ffi = require('ffi');
var utils = types.utils;

var events = ['change'];

// Debugging
function TwxProperty(options) {
	if (!(this instanceof TwxProperty))
		return new TwxProperty(options);
	
	TwxBindings.call(this);
	
	// Parse options structure
	var parseOptions = function (options) {
		if (!options.name)
			throw new Error('name must be set');
		if (!options.type)
			throw new Error('type must be set');
		
		this.name = options.name;
		this.type = utils.stringToBaseType(options.type);
		this.quality = options.quality || 'good';
		this.description = options.description || undefined;
		this.push = options.push || types.Update.Value;
		this.pushThreshold = options.pushThreshold || 0;
	};
	
	// Set setter/getter functions for value property
	Object.defineProperties(this, {
		'value' : {
			'get' : function () { return this.getValue(); },
			'set' : function (value) { this.setValue(value); }
		}
	});
	
	// Parse incoming options
	parseOptions.call(this, options);
	
	// Create a new Primitive container
	this.primitive = new Primitive(this.type);
	
	// Set value if it exists...
	if (options.value) this.setValue(options.value);
	
	// Listen for any 'change' events on the base primitive, and proxy them
	this.primitive.on('change', _.bind(function (newValue, oldValue) {
		this.emit('change', {
			name: this.name, 
			type: libtwx.baseTypeToString(this.type).toLowerCase(), 
			value: newValue, 
			oldValue: oldValue
		});
	}, this));
	
	this.events.push(events);
	
	debug('Creating new property - Name: %s, Type: %d', this.name, this.type);
};

require('util').inherits(TwxProperty, TwxBindings);

TwxProperty.prototype.setValue = function (value) {
	debug('SetValue() called - Setting %s to %j', this.name, value);
	this.primitive.setValue(value)
};

TwxProperty.prototype.getValue = function () {
	debug('getValue() called');
	return this.primitive.getValue();
};

/** @TODO - maybe rmove this */
TwxProperty.prototype.getPrimitive = function () {
	debug('getPrimitive() called');
	return this.primitive;
};

module.exports = TwxProperty;