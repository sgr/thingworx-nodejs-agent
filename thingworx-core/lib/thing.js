'use strict';

var async = require('async');
var util = require('util');
var _ = require('underscore');
var debug = require('debug')('thingworx-core:Thing');
var logger = require('thingworx-utils').Logger;
var EventEmitter = require('events').EventEmitter;

var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var callbacks = require('thingworx-ffi').Callbacks;

var TwxBinding = require('./binding.js');
var TwxDataShape = require('./datashape.js');
var TwxInfoTable = require('./infotable.js');
var TwxPrimitive = require('./primitive.js');
var TwxProperty = require('./property.js');
var TwxService = require('./service.js');
var TwxEvent = require('./event.js');
var ThingCache = require('./utils/cache.js');
var ThingCallbackHandler = require('./thing/callback_handler.js');

var persist = require('thingworx-utils').Persist.persist;

var ref = require('ref');
var ffi = require('ffi');

///////////////////////////////////////////////////////////////////////////////
// Thing object
function TwxThing(thingName) {
	
	// Don't create a new thing if one already exists with this name
	if (TwxThing.Things[thingName]) {
		throw new Error(util.format('Cannot create new thing.  \'%s\' already exists', thingName));
	}
	
	// Force the use of new if the caller forgot to include it
	if (!(this instanceof TwxThing))
		return new TwxThing(thingName);
	
	TwxBinding.call(this);
	
	this.name = thingName;
	this.entityType = types.EntityType.Thing;		// need to remove - use type
	this.type = this.entityType;
	
	this.properties = {}
	this.services = {}
	this.events = {}
	
	this.propertyCallbacks = {};
	this.serviceCallbacks = {};
	
	this.propertyCallbackHandler = ThingCallbackHandler.getPropertyHandler();
	this.serviceCallbackHandler = ThingCallbackHandler.getServiceHandler();
	
	this.bound = false;		// True when bound, false when unbound
	this.binding = false;	// True when in the binding process, false otherwise
	
	debug('Creating new Thing: %s', this.name);
	
	// Keep track of this thing allocation
	TwxThing.Things[this.name] = this;
	ThingCache.AddThing(this.name);
	
	// Create a callback handler for bind events; keeps track of when we're bound or not
	// bound, calls the correct event handlers, emits JS events
	this.bindCallbackHandler = new callbacks.BindCallback(_.bind(function (name, isBound) {
		var bindHandler = function (thing, bound) {
			if (bound) {
				logger.debug('[%s] Bound', thing.name);
				if (!thing.binding) thing.bind();
				setImmediate(function () { thing.emit('bind') });
				thing.bound = true;
			} else {
				logger.debug('[%s] Unbound', thing.name);
				if (!thing.binding) {
					thing.unbind();
					thing.clear();
				}
				setImmediate(function () { thing.emit('unbind') });
				thing.bound = false;
			}
			
			thing.binding = false;
		};
		
		// Only process bind requests for ourselves
		if (this.name != name) return;
		bindHandler(this, isBound == 0 ? false : true);
	}, this));
	
	// Create callback handler for auth events
	this.authCallbackHandler = new callbacks.AuthCallback(_.bind(function (type, value) {
		switch (type) {
			case 'appKey':
				value = value.replace(/[a-zA-Z0-9]/g, "X"); // hide appkey value from logs
				break;

			default:
				break;
		}
		
		logger.debug('Authenticated using %s (%s)', type, value);
		var thing = this;
		setImmediate(function () { thing.emit('authenticated') });
	}, this));
	
	// Register bind and auth event handlers with C SDK
	libtwx.twApi_RegisterBindEventCallback(this.name, this.bindCallbackHandler, ref.NULL);
	libtwx.twApi_RegisterOnAuthenticatedCallback(this.authCallbackHandler, ref.NULL);
	
	// Create a property update task for this thing - will send any
	// queued property updates to the platform
	//setInterval(_.bind(propertyChangeUpdateTask, this), 1000);
	
	// Emit a 'thing-created' event 
	var thing = this;
	setImmediate(function () { staticThingEmitter.emit('thing-create', thing); });
};

util.inherits(TwxThing, TwxBinding);

TwxThing.prototype.addProperty = function (options) {
	if (!options || !options.hasOwnProperty('name')) throw new Error("Invalid options - must have 'name' property");
	
	if (this.bound) {
		logger.warn("[%s]: addProperty() called while bound, ignoring add property request for '%s'", this.name, options.name);
		return;
	}
	
	ThingCache.AddProperty(this.name, options);
}

TwxThing.prototype.addService = function (options) {
	if (!options || !options.hasOwnProperty('name')) throw new Error("options must have 'name' property");
	
	if (this.bound) {
		logger.warn("[%s]: addService() called while bound, ignoring add service request for service '%s'", this.name, options.name);
		return;
	}
	
	ThingCache.AddService(this.name, options);
};

TwxThing.prototype.addEvent = function (options) {
	if (!options || !options.hasOwnProperty('name')) throw new Error("options must have 'name' property");
	if (!options.hasOwnProperty('inputs')) throw new Error("options must have 'inputs' property");
	
	if (this.bound) {
		logger.warn("[%s]: addEvent() called while bound, ignoring add event request for '%s' event", this.name, options.name);
		return;
	}
	
	ThingCache.AddEvent(this.name, options);
}

TwxThing.prototype.setProperty = function (propertyName, propertyValue) {
	
	debug('in setProperty()');
	
	var prop = this.properties[propertyName];
	
	if (prop == undefined) {
		throw new Error('Property does not exist', prop);
	}
	
	// Set Value
	prop.setValue(propertyValue);
};

TwxThing.prototype.getProperty = function (propertyName) {
	debug('in getProperty()');
	var val = this.properties[propertyName];
	
	if (val == undefined) {
		throw new Error('Property does not exist', val);
	}
	
	return val;
};

TwxThing.prototype.getPropertyValue = function (propertyName) {
	var prop = this.properties[propertyName];
	
	if (prop == undefined) {
		throw new Error('Property does not exist', prop);
	}
	
	return prop.getValue();
};

TwxThing.prototype.getPropertyJson = function (propertyName) {
	var prop = this.properties[propertyName];
	if (prop == undefined) {
		throw new Error('Property does not exist', prop);
	}
	
	return prop.getJson();
};

TwxThing.prototype.getPropertyPrimitive = function (propertyName) {
	debug('Getting primitive for %s', propertyName);
	var prop = this.properties[propertyName];
	if (prop == undefined) {
		throw new Error('Property does not exist', prop);
	}
	return prop.getPrimitive();
};

TwxThing.prototype.getPropertyType = function (propertyName) {
	var prop = this.properties[propertyName];
	if (prop == undefined) {
		throw new Error('Property does not exist', prop);
	}
	return prop.type;
};

TwxThing.prototype.getService = function (serviceName) {
	var service = this.services[serviceName];
	if (service == undefined) {
		throw new Error('Service does not exist', service);
	}
	return service;
}

TwxThing.prototype.invokeService = function (serviceName, params) {
	var service = this.services[serviceName];
	if (service == undefined) {
		throw new Error('Service does not exist', service);
	}
	return service.invoke(params);
};

TwxThing.prototype.fireEvent = function (eventName, params, cb) {
	
	var event = this.events[eventName];
	if (event == undefined) {
		throw new Error(util.format('Event \'%s\' does not exist', eventName));
	}
	
	if (!(params instanceof TwxInfoTable || typeof params == 'object')) {
		throw new Error('Event params must be of type object or InfoTable');
	}
	
	// If needed, convert params into an infotable
	if (!(params instanceof TwxInfoTable)) {
		var it = new TwxInfoTable(event.inputs);
		for (var k in params) {
			if (params.hasOwnProperty(k)) {
				it.setValue(k, params[k]);
			}
		}
		
		params = it;
	}
	
	// params is now an infotable *
	params = TwxInfoTable.toNative(params);
	
	libtwx.twApi_FireEvent.async(this.entityType, this.name, event.name, params, -1, 0, 
		_.bind(function (err, res) {
		if (err || res) {
			logger.error("[%s]: Error firing event '%s' : %s", this.name, event.name, 
				err ? err : res);
		}
		
		// twApi_FireEvent deletes the infotable, so no need to clean up memory
		if (cb) setImmediate(cb);
	}, this));
};

TwxThing.prototype.bind = function (cb) {
	
	var c = ThingCache.GetThing(this.name);
	
	// Loop through and register properties
	_.each(c.properties, function (p) {
		
		var prop = undefined;
		
		// Check to see if the first argument is a TwxProperty instance...    
		if (p instanceof TwxProperty) {
			prop = p;
		} else {
			prop = new TwxProperty(p);
		}
		
		this.properties[prop.name] = prop;
		
		// Send all property changed events to the propertyChangeUpdateHandler function
		prop.on('change', _.bind(function (p) {
			this.emit('property-change', p);
		}, this));
		
		var pushVal = undefined;
		switch (prop.push) {
			case types.Update.Always:
				pushVal = 'always';
				break;

			case types.Update.Never:
				pushVal = 'never';
				break;

			case types.Update.Value:
			default:
				pushVal = 'value';
				break;
		}
		
		var ret = libtwx.twApi_RegisterProperty(this.entityType,
                    this.name, prop.name, prop.type, prop.description,
                    pushVal, prop.pushThreshold, this.propertyCallbackHandler, ref.NULL);
		
		if (ret) {
			logger.error("[%s]: unable to register property %s (#%d)", this.name, prop.name, ret);
		} else {
			setImmediate(_.bind(function () {
				this.emit('property-create', prop);
			}, this));
		}
	}, this);
	
	// Loop through and register all services
	_.each(c.services, function (s) {
		
		var service = undefined
		if (s instanceof TwxService) {
			service = s;
		} else {
			service = new TwxService(s);
		}
		
		this.services[service.name] = service;
		
		var ret = libtwx.twApi_RegisterService(this.entityType,
            this.name, service.name, service.description,
            service.inputDataShape.dataShapeRef || ref.NULL, service.outputType,
            service.outputDataShape.dataShapeRef || ref.NULL, this.serviceCallbackHandler, ref.NULL);
		
		if (ret) {
			logger.error("[%s]: unable to register service %s (#%d)", this.name, service.name, ret);
		}
		else {
			setImmediate(_.bind(function () {
				this.emit('service-create', service);
			}, this));
		}
	}, this);
	
	// Loop through and register all events
	_.each(c.events, function (e) {
		
		var event = undefined;
		if (e instanceof TwxEvent) {
			event = e;
		} else {
			event = new TwxEvent(e);
		}
		
		this.events[event.name] = event;
		
		var pDataShape = TwxDataShape.ToNative(event.dataShape);
		
		var ret = libtwx.twApi_RegisterEvent(this.entityType,
			this.name, event.name, event.description || ref.NULL, pDataShape);
		
		// Cleanup when un-bound
		this.on('unbind', function () {
			libtwx.twDataShape_Delete(pDataShape);
			pDataShape = null;
		});

		if (ret) {
			logger.error("[%s]: unable to register event %s (#%d)", this.name, event.name, ret);
		} else {
			setImmediate(_.bind(function () {
				this.emit('event-create', event);
			}, this));
		}
	}, this);
	
	// bind thing...
	if (!this.bound) {
		libtwx.twApi_BindThing.async(this.name, _.bind(function (err, ret) {
			if (ret) {
				logger.error("[%s]: unable to bind thing (#%d)", this.name, ret);
			}
			
			setImmediate(function () {
				if (cb) cb();
			});
		}, this));
	}
	
	this.binding = true;
};

TwxThing.prototype.unbind = function (cb) {
	// Loop through and unregister all properties
	_.each(this.properties, _.bind(function (prop) {
		var ret = libtwx.twApi_UnregisterPropertyCallback(this.name, prop.name, ref.NULL);
		if (ret) logger.error("[%s]: unable to unregister property %s (#%d)", this.name, prop.name, ret);
	}, this));
	
	// Loop through and unregister all services
	_.each(this.services, _.bind(function (service) {
		var ret = libtwx.twApi_UnregisterServiceCallback(this.name, service.name, ref.NULL);
		if (ret) logger.error("[%s]: unable to unregister service %s (#%d)", this.name, service.name, ret);
	}, this));
	
	
	// Only call UnbindThing if the request came from the edge - if it came from the platform,
	// this.bound should be false
	if (this.bound) {
		libtwx.twApi_UnbindThing.async(this.name, _.bind(function (err, ret) {
			if (err || ret) {
				logger.error("[%s]: unable to unbind thing (#%d)", this.name, err ? err : ret);
			}
		}, this));
	}
	
	this.binding = true;
};

TwxThing.prototype.clear = function () {
	this.properties = {}
	this.services = {}
	this.events = {}
	this.propertyCallbacks = {}
	this.serviceCallbacks = {}
};

// Static methods
TwxThing.Things = {}
var staticThingEmitter = new EventEmitter();

TwxThing.on = function (event, fn) {
	staticThingEmitter.on(event, fn);
};

TwxThing.Get = function (thingName) {
	
	debug('in getThing()');
	var ret = TwxThing.Things[thingName];
	if (ret == undefined) throw new Error('Thing does not exist');
	return ret;
};

module.exports = TwxThing;