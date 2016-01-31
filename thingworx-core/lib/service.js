'use strict';

var util = require('util');
var Binding = require('./binding.js');
var InfoTable = require('./infotable.js');
var DataShape = require('./datashape.js');
var primitive = require('./primitive.js');
var logger = require('thingworx-utils').Logger;
var ref = require('ref');
var ffi = require('ffi');
var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var _ = require('underscore');

// Debugging
var debug = require('debug')('thingworx-core:Service');

var parseOptions = function (options) {
	if (!options.hasOwnProperty('name')) throw new Error("options must include 'name' property");
	if (!options.hasOwnProperty('service_handler')) throw new Error("Options must include 'service_handler' property");
	

	this.name = options.name;
	this.description = options.desc;
	
	if (options.output_type != undefined) options.outputType = options.output_type;
	
	if (options.inputs instanceof DataShape) {
		this.inputDataShape = options.inputs
	} else if(typeof options.inputs == 'object') {
		this.inputDataShape = new DataShape(options.inputs);
	}
	
	if (typeof options.outputType == 'string') {
		var uc = options.outputType.toUpperCase();
		this.outputType = libtwx.baseTypeFromString(uc);
	} else if (typeof options.outputType == 'number') {
		this.outputType = options.outputType;
	} else {
		this.outputType = types.BaseType.Nothing;	
	}

	if (options.outputs != undefined && 
		this.outputType == types.BaseType.InfoTable) {
		if (options.outputs instanceof DataShape) {
			this.outputDataShape = options.outputs;
		} else {
			this.outputDataShape = new DataShape(options.outputs);
		}
	}
	
	this.cb = options.service_handler;
};

//function TwxService(serviceName, desc, inputs, outputType, outputs) {
function TwxService(options) {
	
	if (!(this instanceof TwxService))
		return new TwxService(service);
	
	Binding.call(this);

	this.name = undefined;
	this.description = undefined;
	this.inputDataShape = ref.NULL;
	this.outputDataShape = ref.NULL;
	this.outputType = undefined;
	this.cb = undefined;
	
	debug('in TwxService()');
	
	// Parse the options
	parseOptions.call(this, options);
	
	if (this.inputDataShape != ref.NULL) {
		debug('inputShape - %s', util.inspect(this.inputDataShape.toJson()));
	}
	
	if (this.outputDataShape != ref.NULL) {
		debug('outputShape - %s', util.inspect(this.outputDataShape.toJson()));
	}
};

util.inherits(TwxService, Binding);

TwxService.prototype.free = function () {
	
	if (this.inputDataShape != ref.NULL || this.inputDataShape != undefined) {
		this.inputDataShape.free();
		this.inputDataShape = null;
	}
	
	if (this.outputDataShape != ref.NULL || this.outputDataShape != undefined) {
		this.outputDataShape.free();
		this.outputDataShape = null;
	}
};

TwxService.prototype.invoke = function (params, context) {
	
	if (!context) {
		context = {};
	};
	
	var result = undefined;

	try {
		result = this.cb.call(context, params);
	} catch (err) {
		logger.error('Error invoking service - %s', err);
		throw err;
	}
	
	setImmediate(_.bind(function () {
		this.emit('invoke', this, params, result);
	}, this));
	
	if (result instanceof InfoTable)
		return result;
	
	if (this.outputType == types.BaseType.Nothing)
		return; // Return nothing

	if (this.outputDataShape == ref.NULL) {
		result = InfoTable.CreateFrom('result', result, this.outputType);
	} else {
		throw new Error('Infotable output not yet supported on service handlers');
		//var output = new InfoTable(this.outputDataShape);
	}
	
	return result;
};

module.exports = TwxService;