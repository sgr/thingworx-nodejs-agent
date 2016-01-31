var ffi = require('thingworx-ffi');
var eventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var eol = require('os').EOL;

var libtwx = ffi.LibTWX;
var libjson = ffi.LibJSON;
var callbacks = ffi.Callbacks;
var types = ffi.Types;

var LogLevel = types.LogLevel;
var loggerSingleton = null;

var logStream = undefined;

// Events supported by Logger
var events = ['data', 'trace', 'info', 'warn', 'err', 'force', 'audit'];

var LogLevelToString = function (l) {
	switch (l) {
		case LogLevel.Trace:
			return "Trace";
			break;
		case LogLevel.Debug:
			return "Debug";
			break;
		case LogLevel.Info:
			return "Info";
			break;
		case LogLevel.Warn:
			return "Warn";
			break;
		case LogLevel.Error:
			return "Error";
			break;
		case LogLevel.Force:
			return "Force";
			break;
		case LogLevel.Audit:
			return "Audit";
			break;
		default:
			break;
	}
};

var StringToLogLevel = function (l) {
	switch (l.toLowerCase()) {
		case "trace":
			return LogLevel.Trace;
			break;
		case "debug":
			return LogLevel.Debug;
			break;
		case "info":
			return LogLevel.Info;
			break;
		case "warn":
			return LogLevel.Warn;
			break;
		case "error":
			return LogLevel.Error;
			break;
		case "force":
			return LogLevel.Force;
			break;
		case "audit":
			return LogLevel.Audit;
			break;
		default:
			throw new Error("Unablet to convert log level");
			break;
	}
};

// Private Logger creation function - forces one global singleton instance
var getLoggerSingleton = function () {
	if (loggerSingleton == null) {
		loggerSingleton = new Logger();
	}
	
	return loggerSingleton;
}

// Logging callback function invoked via C SDK
var loggerCallback = function (level, timestamp, message) {
	
	var t = types.LogLevel;
	var l = undefined;
	
	switch (level) {
		case t.Trace:
			l = 'trace';
			break;

		case t.Debug:
			l = 'debug'
			break;

		case t.Info:
			l = 'info'
			break;

		case t.Warn:
			l = 'warn'
			break;

		case t.Error:
			// Can't use the 'Error' event - EventEmitter uses it internally,
			// and causes node to exit when emitted!!
			l = 'err'
			break;

		case t.Force:
			l = 'force'
			break;

		case t.Audit:
			l = 'audit';
			break;

		default:
			break;
	}
	
	setImmediate(_.bind(function () {
		
		var lvl = LogLevelToString(level);

		this.emit(l, lvl, timestamp, message);
		this.emit('data', lvl, timestamp, message);
		
		console.log('[%s] %s', lvl, message);		
		
		if (logStream) {
			logStream.write(util.format('[%s] %s : %s%s', lvl, timestamp, message, eol))
		}
	}, this));
};

// Logging object
var Logger = function () {
	// Enforce single logger instance
	eventEmitter.call(this);
	
	this.initialized = false;
};

util.inherits(Logger, eventEmitter);

// Called to initialize the logger
Logger.prototype.init = function (options) {
	
	// If already init'ed, clean up the log stream
	if (this.initialized) {
		if (logStream) {
			logStream.end();
			logStream = undefined;
		}
	}
	
	this.initialized = true;

	// Bind the logging callback
	this.loggingCallback = new callbacks.LoggingCallback(_.bind(loggerCallback, this));
	libtwx.twLogger_SetFunction(this.loggingCallback);
	
	// Set all options
	options = options || {}
	
	this.setLevel(options.level || 'info');
	this.setVerbose(options.verbose || false);
	
	if (options.filename) {
		logStream = fs.createWriteStream(options.filename, { flags : 'a' });
	}
	
	process.on('exit', _.bind(function (code) {
		this.loggingCallback
	}, this));
	

};

// Logging methods
/////////////////////////////////////////////////
Logger.prototype.trace = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Trace, util.format.apply(util, arguments), function () { });
};

Logger.prototype.debug = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Debug, util.format.apply(util, arguments), function () { });
};

Logger.prototype.info = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Info, util.format.apply(util, arguments), function () { });
};

Logger.prototype.warn = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Warn, util.format.apply(util, arguments), function () { });
};

Logger.prototype.error = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Error, util.format.apply(util, arguments), function () { });
};

Logger.prototype.force = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Force, util.format.apply(util, arguments), function () { });
};

Logger.prototype.audit = function () {
	if (!this.initialized) return;
	libtwx.twLog.async(LogLevel.Audit, util.format.apply(util, arguments), function () { });
};

Logger.prototype.setVerbose = function (verbose) {
	if (!this.initialized) return;
	this.verbose = verbose;
	libtwx.twLogger_SetIsVerbose(this.verbose == false ? 0 : 1);
};

Logger.prototype.setLevel = function (level) {
	if (!this.initialized) return;
	if (!(typeof level == 'string')) throw new Error('Argument must be string');
	this.level = StringToLogLevel(level);
	libtwx.twLogger_SetLevel(this.level);
};

module.exports = getLoggerSingleton();
