var ffi = require('./ffi.js');
var types = require('./types.js');
var callbacks = require('./callbacks.js');

/**
 * thingworx-ffi module.
 * @module thingworx-ffi
 */

/** Function bindings for Thingworx C SDK */
module.exports.LibTWX = ffi.libtwx;

/** Function bindings for cJSON */
module.exports.LibCJSON = ffi.libcJSON;

/** Type bindings */
module.exports.Types = types;

/** Callback bindings */
module.exports.Callbacks = callbacks;
