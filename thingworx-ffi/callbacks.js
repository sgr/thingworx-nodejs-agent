var types = require('./types.js');
var ref = require('ref');
var ffi = require('ffi');

var debug = require('debug')('thingworx-ffi');

/**
 * thingworx-ffi module.
 * @module thingworx-ffi
 */

/**
 * Callback hander for log_function callbacks
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var loggingCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback("void", ["int", "string", "string"], fn);
};

/** 
 * Callback handler for property_cb callbacks
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var propertyCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback('int', ['string', 'string', ref.refType(ref.refType(types.infoTable)), 'char', 'void *'], fn);
};

/** 
 * Callback handler for serivce_cb callbacks 
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var serviceCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback('int', ['string', 'string', ref.refType(types.infoTable), ref.refType(ref.refType(types.infoTable)), 'void *'], fn);
};

/**
 * Callback handler for bind_cb callbacks 
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var bindCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback('void', ['string', 'char', 'void *'], fn);
};

/** 
 * Callback handler for auth_cb callbacks
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var authCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback('void', ['string', 'string', 'void *'], fn);
};

/** 
 * Callback handler for eventcb callbacks
 * @param  {Function} callback
 * @return {ffi.Callback}
 */
var eventCallback = function (fn) {
	if (typeof fn != 'function') throw new Error('Callback must be function');
	return ffi.Callback('int', ['void *', 'string', 'size_t'], fn);
};

var exports = module.exports = {};

exports.LoggingCallback = loggingCallback;
exports.PropertyCallback = propertyCallback;
exports.ServiceCallback = serviceCallback;
exports.BindCallback = bindCallback;
exports.AuthCallback = authCallback;
exports.EventCallback = eventCallback;