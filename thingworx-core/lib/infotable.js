'use strict';

var async = require('async');
var util = require('util');
var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var ref = require('ref');
var ffi = require('ffi');

var TwxBinding = require('./binding.js');
var TwxDataShape = require('./datashape.js');
var TwxPrimitive = require('./primitive.js');

var _ = require('underscore');

// Debugging
var debug = require('debug')('thingworx-core:InfoTable');

var convertToNativeInfoTable = function (it) {
	if (!(it instanceof TwxInfoTable)) {
		throw new Error('Argument must be an instance of a TwxInfoTable');
	}
	
	var TwxPrimitive = require('./primitive.js');
		
	// Helper functiion for creating primitives
	var createPrimitive = function (type, value) {
		// @HACK
		var prim = new TwxPrimitive(type, value);
		if (value != undefined) prim.setValue(value);
		return prim;
	}
	
	var ds = TwxDataShape.ToNative(it.dataShape);
	var pIt = libtwx.twInfoTable_Create(ds);
	var rows = it.rows.length;
	var entries = it.dataShape.count;		// Get number of expected entries
	
	// Loop through all rows and entries in the order they're defined
	// by the dataShape
	for (var row = 0; row < rows; row++) {
		var itr = undefined;
		var cursor = 0;
		
		while (cursor < entries) {
			var entryName = it.dataShape.getEntryName(cursor);
			var entryType = it.dataShape.getEntryType(entryName);
			var entryValue = it.rows[row][entryName];
			
			var prim = undefined;
			if (entryValue != undefined) {
				if (entryType== 'INFOTABLE' && 
					!(entryValue instanceof TwxInfoTable)) {
					console.log('entry value - %s', util.inspect(entryValue, { depth: null }));
					entryValue = new TwxInfoTable(entryValue);
				}
				prim = createPrimitive(entryType, entryValue);
			} else {
				// Create an empty primitive
				prim = createPrimitive();
			}
			if (itr == undefined) {
				itr = libtwx.twInfoTableRow_Create(TwxPrimitive.ToNative(prim));
				if (ref.isNull(itr)) throw new Error('Failed to create infoTableRow');
			} else {
				var retVal = libtwx.twInfoTableRow_AddEntry(itr, TwxPrimitive.ToNative(prim));
			}
			
			cursor++;
		}
		
		var retVal = libtwx.twInfoTable_AddRow(pIt, itr);
		if (retVal) {
			throw new Error('Failed to add row to InfoTable - %s', retVal);
		}

	}
	
	return pIt;
};

var convertToJSInfoTable = function (pIt) {
	if (!(pIt instanceof Buffer)) {
		throw new Error('Argument must be an instance of a Buffer');
	}
	
	if (ref.isNull(pIt)) {
		throw new Error('Cannot convert using null pointer');
	}
	
	var it = pIt.deref();
	if (!(it instanceof types.infoTable)) {
		throw new Error('Buffer does not point to InfoTable');
	}
	
	// get data shape in json
	var pJson = libtwx.twDataShape_ToJson(it.dataShape, ref.NULL);
	var ds = JSON.parse(libjson.cJSON_Print(pJson));
	libjson.cJSON_Delete(pJson);
	
	// Create new js InfoTable
	var infoTable = new TwxInfoTable(ds);
	
	// Get JSON representation of native infotable
	var pJsonIt = libtwx.twInfoTable_ToJson(pIt);
	if (ref.isNull(pJsonIt)) throw new Error('twInfoTable_ToJson returned null');
	
	var jsonIt = JSON.parse(libjson.cJSON_Print(pJsonIt));
	libjson.cJSON_Delete(pJsonIt);
	
	for (var i = 0; i < jsonIt.rows.length; i++) {
		_.each(jsonIt.rows[i], function (value, key) {
			infoTable.setValue(key, i, value);
		});
	}
	
	return infoTable;
};

var TwxInfoTable = function (inputs) {
	
	this.rows = [];
	this.dataShape = undefined;
	
	if (inputs instanceof TwxDataShape) {
		this.dataShape = inputs;
	} else if (inputs instanceof Buffer) {
		if (!ref.isNull(inputs)) {
			var it = inputs.deref();
			this.dataShape = TwxDataShape.FromNative(it.dataShape)
		} else {
			throw new Error('Cannot use null/empty infotable as inputs');
		}
	} else if (inputs instanceof Object) {
		if (inputs.hasOwnProperty('rows') &&
			inputs.hasOwnProperty('datashape')) {
			this.dataShape = new TwxDataShape(inputs.datashape);
			this.rows = inputs.rows;
		} else {
			this.dataShape = new TwxDataShape(inputs);
		}
	} else if (inputs == undefined) {
		throw new Error('Cannot create info table without data shape input');
	} else {
		throw new Error('Unknown argument error');
	}
};

util.inherits(TwxInfoTable, TwxBinding);


TwxInfoTable.prototype.getValue = function (name, row) {
	if (name == undefined) return TwxInfoTable.GetFirstValue(this);
	if (row == undefined) row = 0;
	
	var r = this.rows[row];
	
	if (r) {
		return r[name];
	}
};


TwxInfoTable.prototype.toJson = function () {
	var json = {};
	var ds = this.dataShape.toJson();
	json.rows = this.rows;
	json.dataShape = ds;
	return json;
};

TwxInfoTable.prototype.setValue = function (name, row, value) {
	
	// Use arguments object to parse incoming arguments
	switch (arguments.length) {
		case 1:
			value = arguments[0];
			row = 0;
			if (this.rows == undefined || this.rows.length == 0) {
				name = Object.keys(this.dataShape.fieldDefinitions)[0];
			} else {
				name = this.rows[0][Object.keys(this.rows[0])[0]];
			}
			break;

		case 2:
			value = arguments[1];
			row = 0;
			name = arguments[0];
			break;

		case 3:
			name = arguments[0];
			row = arguments[1];
			value = arguments[2];
			break;
	}
	
	if (this.rows[row] == undefined) {
		this.rows[row] = {};

		var keys = Object.keys(this.dataShape.fieldDefinitions);
		for (var idx = 0; idx < keys.length; idx++) {
			this.rows[row][keys[idx]] = undefined;
		}
	}
	
	this.rows[row][name] = value;
};

TwxInfoTable.fromNative = function (it) {
	return convertToJSInfoTable(it);
}

TwxInfoTable.toNative = function (it) {
	return convertToNativeInfoTable(it);
}


TwxInfoTable.Copy = function (it) {
	
	// Create new infoTable
	var ret = new TwxInfoTable(it.dataShape);
	
	// Copy all InfoTable values
	for (var row in it.rows) {
		for (var entry in it.rows[row]) {
			ret.setValue(entry, row, it.rows[row][entry]);
		}
	}
	
	return ret;
};

// Static functions
TwxInfoTable.CreateFrom = function (name, value, type) {
	var it;
	var t = types.BaseType;
	
	if (name == undefined) {
		throw new Error('First argument cannot be undefined');
	}
	
	if (value == undefined) {
		value = name;
		name = 'content';
	}
	
	if (type == undefined) {
		if (typeof value == 'number') {
			type = t.Number;
		}
		else if (typeof value == 'boolean') {
			type = t.Boolean;
		}
		else if (typeof value == 'string') {
			type = t.String;
		}
		else if (typeof value == 'object') {
			
			// Don't allow empty arrays
			if (Array.isArray(value) &&
                value.length == 0) {
				throw new Error('Invald argument');
			}
			
			// Dont allow empty objects
			if (Object.keys(value).length == 0) {
				throw new Error('Invalid argument');
			}
			
			// Look for location values...
			if (value.latitude != undefined &&
                value.longitude != undefined &&
                value.elevation != undefined) {
				type = t.Location;
			}
			else {
				// assume JSON
				//value = JSON.stringify(value);
				type = t.JSON;
			}
		}
		else throw new Error("Unable to coerce type - try adding 'type' argument");
	}
	
	// Convert string types to BaseType
	if (typeof type == 'string') {
		type = types.utils.stringToBaseType(type);
	}
	
	it = new TwxInfoTable([{ name: name, type: type }]);
	it.setValue(name, value);
	return it;

}

TwxInfoTable.GetFirstValue = function (infoTable, name, type) {
	var row = infoTable.rows[0];
	return row[Object.keys(row)[0]];
}

module.exports = TwxInfoTable;