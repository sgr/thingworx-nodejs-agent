var util = require('util');
var assert = require("assert");
var ffi = require('thingworx-ffi');

// Setup Exports...
var exports = module.exports = {};

// C SDK Object Wrappers
exports.Property	= require('./lib/property.js');
exports.Primitive	= require('./lib/primitive.js');
exports.DataShape	= require('./lib/datashape.js');
exports.InfoTable	= require('./lib/infotable.js');
exports.Service     = require('./lib/service.js');
exports.Event		= require('./lib/event.js');
exports.Thing		= require('./lib/thing.js');
exports.Types		= ffi.Types;
exports.types		= exports.Types;

// Thing Configuration Cache - holds JSON configuration data
// used to represent things. 
var cache = require('./lib/utils/cache.js');
exports.utils = {};
exports.utils.ConfigurationCache = {
	GetThings: cache.GetThings,
	GetThing: cache.GetThing,
	GetProperties: cache.GetProperties,
	GetProperty: cache.GetProperty,
	GetServices: cache.GetServices,
	GetService: cache.GetService,
	GetEvents: cache.GetEvents,
	GetEvent: cache.GetEvent
};

exports.ffi			= {};
exports.ffi.LibTWX	= ffi.LibTWX;
exports.ffi.LibJSON	= ffi.LibCJSON;
exports.ffi.Callbacks = ffi.Callbacks;