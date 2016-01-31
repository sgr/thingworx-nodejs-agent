var core = require('thingworx-core');
var logger = require('thingworx-utils').Logger;
var Runtime = require('thingworx-utils').Runtime;
var persist = require('thingworx-utils').Persist.persist;
var util = require('util');
var ref = require('ref');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var PropertyMonitor = require('./lib/property-monitor.js');

var libtwx = core.ffi.LibTWX;
var callbacks = core.ffi.Callbacks;
var Types = core.Types;

// Wraps TLS-related functionality
var TLS = require('./lib/config/tls.js');

var TwxThing = core.Thing;
var TwxProperty = core.Propety;
var TwxService = core.Service;
var TwxPrimitive = core.Primitive;
var TwxInfoTable = core.InfoTable;
var TwxDataShape = core.DataShape;
var ConfigCache = core.utils.ConfigurationCache;

var TWX_SDK_VERSION = libtwx.twApi_GetVersion();

var events = ['init', 'connect', 'disconnect', 'ping', 'pong'];

///////////////////////////////////////////////////////////////////////////
// various option parsers

// Parses initialization options and calls twApi_Initialize()
var setApiInitializationOptions = function (options) {
	if (typeof options != 'object') throw new Error('options must be an object');
	
	var host = options.host;
	var port = options.port;
	var appKey = options.app_key;
	var resource = options.resource || '/Thingworx/WS';
	var gatewayName = options.gateway_name || ref.NULL;
	var msgChunkSize = options.message_chunk_size || 8192
	var frameSize = options.frame_size || 8192
	var autoReconnect = (options.auto_reconnect == true ? 1 : 0) || 0;
	
	// Required options must be set
	if (host == undefined)
		throw new Error("'host' field is undefined;");
	
	if (port == undefined)
		throw new Error("'port' field is undefined;");
	
	if (appKey == undefined)
		throw new Error("'appkey' field is undefined;");
	
	var val = libtwx.twApi_Initialize(host, port, resource, appKey, gatewayName, 
                                      msgChunkSize, frameSize, autoReconnect);
	
	if (val) {
		throw new Error(util.format('Error initalizing thingworx API - returned error code %d', val));
	}
}

// Parses TLS options and calls various TW API TLS functions (see '/lib/tls.js')
var setTlsOptions = function (options) {
	if (typeof options != 'object') throw new Error('options must be an object');
	if (options.encryption != undefined) TLS.SetEncryption(options.encryption);
	if (options.fips != undefined) TLS.SetFipsMode(options.fips);
	if (options.validate_certificate != undefined) {
		TLS.SetCertificationValidation(options.validate_certificate);
	}
	if (options.allow_self_signed_certificate != undefined) {
		TLS.SetAllowSelfSignedCertificates(options.allow_self_signed_certificate);
	}
	if (options.ca_cert) TLS.SetCACertificate(options.ca_cert);
	if (options.client_cert) {
		if (options.client_cert.file) {
			TLS.SetClientCertificate(options.client_cert.file);
		}
		if (options.client_cert.file && 
			options.client_cert.passphrase) {
			TLS.SetClientKey(options.client_cert.file,
							 options.client_cert.passphrase);
		}
	}
}

// Processes logger options
var setLoggerOptions = function (options) {
	logger.init(options);
}

function Api(options) {
	
	EventEmitter.call(this);
	
	this.types = Types;
	this.version = TWX_SDK_VERSION;
	
	this.connectHandler = ref.NULL;
	this.disconnectHandler = ref.NULL;
	this.pongHandler = ref.NULL;
	this.pingHandler = ref.NULL;
	this.options = options || {};
	this.propertyMonitor = PropertyMonitor();
	
	this.setConfigOptions(this.options);
};

util.inherits(Api, EventEmitter);

Api.prototype.initialize = function (options) {
	
	// Set initialization options if any are passed in.
	if (options) setApiInitializationOptions(options);
	
	// Create event handlers
	this.connectHandler = new callbacks.EventCallback(_.bind(function (ws, msg, len) {
		this.emit('connect', msg);
	}, this));
	
	this.disconnectHandler = new callbacks.EventCallback(_.bind(function (ws, msg, len) {
		this.emit('disconnect', msg);
	}, this));
	
	this.pingHandler = new callbacks.EventCallback(_.bind(function (ws, msg, len) {
		this.emit('ping', msg);
	}, this));
	
	this.pongHandler = new callbacks.EventCallback(_.bind(function (ws, msg, len) {
		this.emit('pong', msg);
	}, this));
	
	// register event handlers as C SDK Callbacks
	libtwx.twApi_RegisterConnectCallback(this.connectHandler);
	libtwx.twApi_RegisterCloseCallback(this.disconnectHandler);
	libtwx.twApi_RegisterPingCallback(this.pingHandler);
	libtwx.twApi_RegisterPongCallback(this.pongHandler);
	
	// Create a new 'runtime' object to manage the connectivity run-time loop
	// pass it thought persist to prevent any garbage collectiion
	var runner = persist('runtime', Runtime());
	
	// Create a new PropertyMonitor object to monitor all properties for changes, and send
	// changed properties to the platform . Pass it through persist() to prevent any garbage collection.
	var propertyMonitor = persist('property monitor', PropertyMonitor());

	// Listen for connect and disconnect events - when connected, start the runtime
	// when disconnected stop the runtime.
	this.on('connect', function () {
		logger.debug('Starting NodeJS Agent runtime');
		runner.start();
	});
	
	this.on('disconnect', function (msg) {
		runner.stop();
		logger.warn('Disconnect detected - %s', msg);
		logger.debug('Stopping NodeJS Agent runtime');
	});
	
	// Start monitoring property creation
	propertyMonitor.start();
	
	// Keep handles for all callbacks until the process exits 
	// Prevents objects from being GC'ed
	process.on('exit', _.bind(function () {
		var connectHandler = this.connectHandler;
		var disconnectHandler = this.disconnectHandler;
		var pongHandler = this.pongHandler;
		var pingHandler = this.pingHandler;
	}, this));
	
	// Trigger 'init' event next tick
	process.nextTick(_.bind(function () {
		this.emit('init');
	}, this));
	
}

Api.prototype.getConfigOptions = function () {
	return this.options;
}

Api.prototype.setConfigOptions = function (options) {
	this.options = options;
	setLoggerOptions(options.logger || { level: 'info' });
	if (options.connection) setApiInitializationOptions(options.connection);
	if (options.tls) setTlsOptions(options.tls);
}

// Returns true if connected to the platform
Api.prototype.isConnected = function () {
	if (libtwx.twApi_isConnected() == '0') {
		return false;
	} else {
		return true;
	}
}

// Async version of the connect call.  Will invoke callback on successful
// connection to the platfork.
Api.prototype.connect = function (cb) {
	var timeout = 5000;
	var retries = 2;
	libtwx.twApi_Connect.async(timeout, retries, _.bind(function (err, ret) {
		if (ret || err) {
			logger.error('Error connecting - %s', err ? err : ret);
		}
		
		// Invoke callback if it exists in another tick
		if (cb) setTimeout(cb, 10);
	}, this));
}

Api.prototype.disconnect = function (cb) {
	libtwx.twApi_Disconnect.async('Agent shutting down', function (err, ret) {
		if (ret || err) {
			logger.error('Error connecting - %s', (err ? err : ret));
		}
		
		// Invoke callback if it exists in another tick
		if (cb) setTimeout(cb, 10);
	});
}

Api.setProperty = function (thing, prop, value) {
	if (typeof thing == 'string' && typeof prop == 'string') {
		var txThing = TwxThing.Get(thing);
		txThing.setProperty(prop, value);
	} else {
		throw new Error("Argument 'thing' and 'prop' must be of type string");
	}
}

Api.getProperty = function (thing, prop) {
	if (typeof thing == 'string' && typeof prop == 'string') {
		var txThing = TwxThing.Get(thing);
		return txThing.getProperty(prop);
	} else {
		throw new Error("Argument 'thing' and 'prop' must be of type string");
	}
}

Api.invokeService = function (thing, service, params) {
	if (!(typeof thing == 'string' && typeof prop == 'string')) {
		throw new Error("Argument 'thing' and 'service' must be of type string");
	}
	var txThing = TwxThing.Get(thing);
};

Api.getThingConfig = function (thingName) {
	if (thingName) return ConfigCache.GetThing(thingName);
	else return ConfigCache.GetThings();
}

var apiSingleton = undefined;
var getApi = function (options) {
	if (apiSingleton == undefined) {
		apiSingleton = new Api(options);
	} else {
		apiSingleton.setConfigOptions(options);
	}
	
	return apiSingleton;
}

module.exports = {
	Api: getApi,
	Thing: core.Thing,
	Property: core.Property,
	Service: core.Service,
	InfoTable: core.InfoTable,
	DataShape: core.DataShape,
	Primitive: core.Primitive,
	Types: core.Types
};