'use strict';

var util = require('util');
var _ = require('underscore');
var ref = require('ref');
var ffi = require('ffi');
var debug = require('debug')('thingworx-core:Thing');
var logger = require('thingworx-utils').Logger;

var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var callbacks = require('thingworx-ffi').Callbacks;

var TwxDataShape = require('../datashape.js');
var TwxInfoTable = require('../infotable.js');
var persist = require('thingworx-utils').Persist.persist;

///////////////////////////////////////////////////////////////////////////////
// Callback Handlers

// Property Callback Wrapper - wraps property_cb invocations from C SDK 
var propertyCallbackWrapper = function (thing, prop, infoTablePtrPtr, isWrite, userdata) {
	
	debug('Property Callback Invoked')
	
	// Determine if this is a write or read call
	isWrite = (isWrite == '0' ? false : true);
	
	// Used for callback reads    
	var read = function (prop) {
		// Memory allocated by TwxInfoTable will be owned by C SDK		
		var it = TwxInfoTable.CreateFrom(prop.name, prop.getValue(), prop.type);
		
		// copies infotable * into intoTablePtrPtr (infotable **)
		ref.writePointer(infoTablePtrPtr, 0, TwxInfoTable.toNative(it));
	};
	
	// Used for callback writes
	var write = function (prop) {
		var infoTablePtr = infoTablePtrPtr.deref();
		
		var it = TwxInfoTable.fromNative(infoTablePtr);

		// Retreive the value from the info table and use it to set the property value
		var value = TwxInfoTable.GetFirstValue(it, prop.name, prop.type);
		prop.setValue(value);
	};
	
	var TwxThing = require('../thing.js');	
	
	// Find thing associated with this callback
	thing = TwxThing.Get(thing);
	
	// Find property associated with this calback
	prop = thing.getProperty(prop);
	
	var retVal = undefined;
	
	if (isWrite) {
		retVal = write(prop);
	} else {
		retVal = read(prop);
	}
	
	// If nothing (or true) was returned from the read/write function, it was successful
	// Otherwise, something went wrong and we return an internal server error
	if (retVal == undefined || retVal == true) {
		return types.Success;
	} else {
		return types.MessageCode.InternalServerError;
	}
};

var serviceCallbackWrapper = function (thingName, serviceName, params, content, userdata) {
	
	debug("%s: Service '%s' Callback Invoked", thingName, serviceName);
	
	var TwxThing = require('../thing.js');

	// Find thing associated with this callback	
	var thing = TwxThing.Get(thingName);
	if (thing == undefined) throw new Error('cannot invoke service - thing does not exist');
	
	// Find service associated with this callback
	var service = thing.getService(serviceName);
	if (service == undefined) throw new Error('cannot invoke service - service does not exist');
	
	// Create context for service:
	var context = {
		thing: thingName,
		service: serviceName
	};

	var res = undefined;
	try {
		var input = undefined;
		if (!ref.isNull(params)) {
			input = TwxInfoTable.fromNative(params);
		}

		// Invoke service 
		res = service.invoke(input, context);
	} catch (err) {
		logger.error("[%s]: Service '%s' failed to invoke, caught error: %s", thingName, serviceName, err);
		return types.MessageCode.InternalServerError;
	}
	
	// If the service did not return an InfoTable instance (or null pointer) create one		
	if (!(res instanceof TwxInfoTable)) {
		if (res != null || res != undefined) {
			res = TwxInfoTable.toNative(TwxInfoTable.CreateFrom('result', res, service.outputType));
		} else {
			res = ref.NULL;
		}
	} else {
		res = TwxInfoTable.toNative(res);
	}
	
	// Write the info table value or null if no reference is found
	ref.writePointer(content, 0, res);
	
	return types.Success;
};

var serviceCallback = undefined;
var propertyCallback = undefined;

module.exports = {
	getServiceHandler : function() {
		if(serviceCallback == undefined) {
			serviceCallback = new callbacks.ServiceCallback(serviceCallbackWrapper)
			persist('serviceCallback', serviceCallback);
		}
		
		return serviceCallback; 
	},
	getPropertyHandler : function() {
		if(propertyCallback == undefined) {
			propertyCallback = new callbacks.PropertyCallback(propertyCallbackWrapper)
			persist('propertyCallback', propertyCallback);
		}
		
		return propertyCallback; 
	}
}