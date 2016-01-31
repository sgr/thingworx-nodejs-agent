var eventEmitter = require('events').EventEmitter;
var ref = require('ref');
var async = require('async');
var libtwx = require('thingworx-ffi').LibTWX;
var types = require('thingworx-ffi').Types;
var Runner = require('thingworx-utils').Runner;
var logger = require('thingworx-utils').Logger;
var Thing = require('thingworx-core').Thing;
var Primitive = require('thingworx-core').Primitive;
var util = require('util');
var _ = require('underscore');

var debug = require('debug')('thingworx-api:property-monitor');

var singleton = null;
var propertyChangeList = [];  // List of changed properties

function PropertyListManager() {
	this._list = {};		// Object used to store a series of keys (thing names) that
							// each reference an array (properties)
	
	// A count of all properties across all things
	Object.defineProperties(this, {
		'count' : {
			'get' : function () {
				var retVal = 0;
				for (var key in this._list) {
					retVal += this._list[key].length;
				}
				return retVal;
			}
		}
	});
};

PropertyListManager.prototype.add = function (thing, property) {
	if (typeof property == 'undfined') throw new Error('Both thing and property arguments must be set');
	var thingname = thing.name;
	if (this._list[thingname] == undefined) {
		this._list[thingname] = [];
	}
	
	if (property.value == undefined) return;
	
	debug('[%s] Adding new property to propertyChangeList - %s', thing.name, util.inspect(property));
	
	var prop = {
		name: property.name, 
		value: Primitive.ToNative(new Primitive(property.type, property.value)),
		time: new Date().getTime()
	};
	
	this._list[thingname].push(prop);
};

PropertyListManager.prototype.empty = function (thing) {
	if (typeof thing == 'object' && thing.hasOwnProperty('name')) thing = thing.name;
	if (!thing) {
		this._list = {}
	} else {
		this._list[thing] = {}
	}
};

PropertyListManager.prototype.getList = function (thing) {
	if (typeof thing == 'object' && thing.hasOwnProperty('name')) thing = thing.name;
	
	if (thing == undefined)
		return this._list;
	else
		return this._list[thing];
}

PropertyListManager.prototype.getAll = function () {
	var retVal = {};
	for (var key in this._list) {
		retVal.concat(this._list[key]);
	}
	
	return retVal;
}
// Private Runner creation function - forces one global singleton instance
var getSingleton = function () {
	if (singleton == null) {
		singleton = new PropertyMonitor();
	}
	
	return singleton;
};

function PropertyMonitor() {
	
	Runner.call(this);
	
	var propertyListManager = new PropertyListManager();
	
	this.addTask({ name: 'property monitor', type: 'periodic', tick_rate: 500 }, function (done) {
		
		var numProperties = propertyListManager.count;
		
		debug('Running propertyChangeUpdateTask()');
		debug('Have %d properties in list', numProperties);
		
		var list = propertyListManager.getList();
		
		_.each(list, function (properties, thing) {
			
			debug('Updating properties for %s', thing);
			
			// If we only have one property to update, send it using twApi_WriteProperty()
			if (properties.length == 1) {
				var element = properties.shift();
				
				debug('Writing single property - %j', element);
				
				libtwx.twApi_WriteProperty.async(types.EntityType.Thing, thing, element.name, element.value, -1, 0, function (err, res) {
					if (err || res) {
						logger.error('[%s]: Error calling twApi_WriteProperty() for %s - %s',
							  thing, element.name, err ? err : res);
					}
					// When the write is done, free up memory			
					libtwx.twPrimitive_Delete(element.value);
				});
			} else if (properties.length > 1) {
				
				// If we have more than one property to update, create a property list and 
				// send it using twApi_PushProperties()
				
				debug('Updating multiple properties')
				
				// Function to create list (twList) of properties
				var createList = function (list, callback) {
					var propList = ref.NULL;
					
					// Walk through all elements and add them to the list
					while (properties.length > 0) {
						var element = properties.shift();
						debug('Updating property - %j', element)
						if (propList == ref.NULL) {
							propList = libtwx.twApi_CreatePropertyList(element.name, element.value, element.time);
						} else {
							libtwx.twApi_AddPropertyToList(propList, element.name, element.value, element.time)
						}
					}
					
					if (propList == null || propList == ref.NULL) {
						callback(new Error('Prop List is Empty'));
					} else {
						callback(null, propList)
					}
				}
				
				// Function to push a list (twList) of properties to the platform	
				var pushProperties = function (propList, callback) {
					debug('pushing properties - %j', propList);
					libtwx.twApi_PushProperties.async(types.EntityType.Thing, thing, propList, -1, 0, function (err, ret) {
						
						if (ret || err) {
							logger.error('[%s]: Error calling twApi_PushProperties() - %s', thing, err ? err : ret);
						}
						ret = libtwx.twApi_DeletePropertyList(propList);
						callback(null);
					});
				}
				
				// Run the push process next tick
				//process.nextTick(function () {
				setImmediate(function () {
					// Run as waterfall
					async.waterfall([
						async.apply(createList, propertyChangeList),
						pushProperties
					], function (err) {
						if (err)
							logger.error('[%s]: Error pushing properties: %s', thing, err);
					});
				});

			}
		}, this);
	
		done();	
	});
	
	// Listen for all property change events across all things	
	Thing.on('thing-create', function (t) {
		var thing = t;
		thing.on('property-create', function (property) {
			propertyListManager.add(thing, property);
			property.on('change', function (property) {
				propertyListManager.add(thing, property);
			});
		});
	});
}

util.inherits(PropertyMonitor, Runner);

PropertyMonitor.prototype.start = function () {
	Runner.prototype.start.call(this);
};

PropertyMonitor.prototype.stop = function () {
	Runner.prototype.stop.call(this);
}

module.exports = getSingleton;