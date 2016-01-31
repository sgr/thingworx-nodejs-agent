'use strict';

var async = require('async');
var util = require('util');
var _ = require('underscore');
var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var type_utils = require('thingworx-ffi').Types.utils;
var ref = require('ref');
var ffi = require('ffi');

var debug = require('debug')('thingworx-core:DataShape');

var TwxBinding = require('./binding.js');

var events = ['entry-added'];

var TwxDataShape = function (name, inputs) {
	
	if (!(this instanceof TwxDataShape))
		return new TwxDataShape(name, inputs);
	
	TwxBinding.call(this);
	
	if (arguments.length == 1) {
		if (typeof arguments[0] == 'string') {
			name = arguments[0]
			inputs = undefined;
		}
		else {
			inputs = arguments[0];
			name = 'content';
		}
	}
	
	this.count = 0;
	this.fieldDefinitions = {};
	this.name = name;
	this.events.concat(events);
	
	if (inputs == undefined) return;

	if (inputs instanceof Object &&
		inputs.hasOwnProperty('fieldDefinitions')) {
		inputs = inputs.fieldDefinitions;
		return
	} else if (inputs instanceof Object && !Array.isArray(inputs)) {
		var arr = new Array();
		arr.push(inputs);
		inputs = arr;
	}
	
	if (inputs instanceof Array) {
		_.each(inputs, function (entry) {
			
			if (entry.name == undefined ||
				(entry.baseType == undefined && entry.type == undefined)) {
				throw new Error(util.format('Illegal Input: %s', entry));	
			}

			this.addEntry(entry.name,
			entry.baseType ? entry.baseType : entry.type, 
			entry.description);
		}, this);
	} else {
		throw new Error('Failed to parse DataShape input');
	}
};
util.inherits(TwxDataShape, TwxBinding);

TwxDataShape.prototype.addEntry = function (name, type, description) {
	if (name == undefined || type == undefined)
		throw new Error('Name and/or type missing');
	
	// Convery any string value for type to the BaseType enum value
	if (typeof type == 'number') {
		type = libtwx.baseTypeToString(type);
	}
	
	this.fieldDefinitions[name] = { name: name, baseType: type.toUpperCase(), description: description }
	this.count++;
	
	process.nextTick(_.bind(function () {
		// emit 'entry-added' event
		this.emit('entry-added', name, description, type);
	}, this));
};

TwxDataShape.prototype.getEntryIndex = function (name) {
	var ret
	var idx = 0;
	
	for (var field in this.fieldDefinitions) {
		if (field.name == name) {
			ret = idx;
			break;
		}
		idx++;
	}
	
	if (ret == undefined) {
		throw new Error(util.format("Entry '%s' does not exist", name));
	}
	return ret;
}

TwxDataShape.prototype.getEntryType = function (name) {
	var ret
	
	ret = this.fieldDefinitions[name].baseType;
	
	if (ret == undefined) {
		throw new Error(util.format("Entry '%s' does not exist", name));
	}
	return ret;
}

TwxDataShape.prototype.getEntryDescription = function (name) {
	return this.fieldDefinitions[name].description;
}

TwxDataShape.prototype.getEntryName = function (idx) {
	var ret
	
	for (var field in this.fieldDefinitions) {
		if (idx == 0) {
			ret = field;
			break;
		}
		
		idx--
	}
	
	if (ret == undefined) {
		throw new Error(util.format("Entry at index %d does not exist", idx));
	}
	return ret;
};

TwxDataShape.prototype.toJson = function () {
	return this.fieldDefinitions;
}

TwxDataShape.ToNative = function (ds) {
	if (!(ds instanceof TwxDataShape)) throw new Error('Argument must be an instance of a DataShape');
	
	var pDataShape = ref.NULL;
	var cursor = 0;
	
	while (cursor < ds.count) {
		
		var name = ds.getEntryName(cursor);
		var type = ds.getEntryType(name);
		var description = ds.getEntryDescription(name);
		
		// Ensure baseType value is used 
		if (typeof type == 'string') type = type_utils.stringToBaseType(type);
		
		if (ref.isNull(pDataShape)) {
			var shapeEntry = libtwx.twDataShapeEntry_Create(name, (description || ref.NULL), type);
			if (ref.isNull(shapeEntry)) {
				debug('Unable to create dataShapeEntry - Create returned null');
				throw new Error('Unable to create dataShapeEntry - Create returned null')
			}
			
			pDataShape = libtwx.twDataShape_Create(shapeEntry);
			if (ref.isNull(pDataShape)) {
				deubg('Unable to create dataShape - Create returned null');
				throw new Error('Unable to create dataShape - Create returned null');
			}
		} else {
			var shapeEntry = libtwx.twDataShapeEntry_Create(name, (description || ref.NULL), type);
			if (ref.isNull(shapeEntry)) {
				debug('Unable to create dataShapeEntry - Create returned null');
				throw new Error('Unable to create dataShapeEntry - Create returned null');
			}
			
			var retVal = libtwx.twDataShape_AddEntry(pDataShape, shapeEntry);
			if (retVal != 0) {
				debug('Unable to add dataShapeEntry to dataShape - AddEntry returned %d', retVal);
				throw new Error(util.format('Unable to add dataShapeEntry to dataShape - AddEntry returned %d', retVal));
			}
		}
		cursor++;
	}
	
	libtwx.twDataShape_SetName(pDataShape, ds.name);
	return pDataShape;
};

TwxDataShape.FromNative = function (ds) {
	if (!(ds instanceof Buffer)) throw new Error('Argument must be an instance of a Buffer');
	
	var dataShapeStruct = ds.deref();
	if (!(dataShapeStruct instanceof types.dataShape)) throw new Error('Buffer does not point to DataShape structure');
	
	// Loop through all entries in the Data Shape
	var size = dataShapeStruct.numEntries;
	var list = dataShapeStruct.entries;
	var name = dataShapeStruct.name;
	var entry = ref.NULL;
	
	ds = new TwxDataShape(name);
	
	// @TODO - Add error handling to 'continue' cases
	for (var i = 0; i < size; i++) {
		entry = libtwx.twList_Next(list, entry);
		if (ref.isNull(entry)) continue;
		
		var entryValue = entry.deref();
		if (!(entryValue instanceof types.listEntry)) continue;
		
		// Get Pointer to Data Shape Entry
		var pJson = libtwx.twDataShapeEntry_ToJson(entryValue.value, 'entry', ref.NULL);
		var dataShape = JSON.parse(libjson.cJSON_Print(pJson));
		libjson.cJSON_Delete(pJson);
		
		ds.addEntry(dataShape.name, type_utils.stringToBaseType(dataShape.baseType), dataShape.desc);
	}
	
	return ds;
};

module.exports = TwxDataShape;
