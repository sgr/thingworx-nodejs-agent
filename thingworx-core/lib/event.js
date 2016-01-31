var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var logger = require('thingworx-utils').Logger;
var type_utils = require('thingworx-ffi').Types.utils;
var ref = require('ref');
var ffi = require('ffi');
var util = require('util');

var debug = require('debug')('thingworx-core:Event');

var TwxBinding = require('./binding.js');
var TwxDataShape = require('./datashape.js');
var TwxInfoTable = require('./infotable.js');

function TwxEvent(options) {
	
	if (!(this instanceof TwxEvent))
		return new TwxEvent(options);
	
	TwxBinding.call(this);

	options = options || {};
	if (!options.name) throw new Error('Event must have name parameter');
	if (!options.inputs) throw new Error('Event must have inputs parameter');
	
	this.name = options.name;
	this.inputs = options.inputs;	
	this.dataShape = new TwxDataShape(this.name, options.inputs);
	this.description = options.description;
};

util.inherits(TwxEvent, TwxBinding);

module.exports = TwxEvent;