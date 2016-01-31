'use strict';
var util = require('util');
var _ = require('underscore');

var TwxBinding = require('./binding.js');
var TwxInfoTable = require('./infotable.js');

var libtwx = require('thingworx-ffi').LibTWX;
var libjson = require('thingworx-ffi').LibCJSON;
var types = require('thingworx-ffi').Types;
var type_utils = require('thingworx-ffi').Types.utils;
var ref = require('ref');
var ffi = require('ffi');

var debug = require('debug')('thingworx-core:Primitive');

var events = ['change'];

// Primitive Wrapper Class
function TwxPrimitive(type, value) {
	
	// Convert any incoming pointers to primitives
	if (arguments[0] instanceof Buffer) {
		return TwxPrimitive.FromNative(arguments[0]);
	}
	
	// Convert string type to baseType
	if (typeof arguments[0] == 'string') {
		type = type_utils.stringToBaseType(arguments[0]);
	}
	
	if (!(this instanceof TwxPrimitive))
		return new TwxPrimitive(type, value);
	
	TwxBinding.call(this);
	
	this._value = value || undefined;
	this.type = type;
	
	// Set setter/getter function for value
	Object.defineProperties(this, {
		'value' : {
			'get' : function () { return this.getValue(); },
			'set' : function (value) { this.setValue(value); }
		}
	})
	
	// Add supported events to the list
	this.events.concat(events);
	
	if (value != undefined) {
		this.setValue(value);
	}
}

util.inherits(TwxPrimitive, TwxBinding);

TwxPrimitive.prototype.getValue = function () {
	
	debug('getValue() called');
	
	if (this._value == undefined) {
		if (this.type == types.BaseType.JSON ||
		   this.type == types.BaseType.Location) {
			// Return an empty object
			return {};
		} else {
			return undefined;
		}
	}
	
	if (this.type == types.BaseType.InfoTable) {
		return TwxInfoTable.Copy(this._value);
	} else {	
		return this._value;
	}
};

TwxPrimitive.prototype.setValue = function (value) {
	debug('SetValue called with %s', value);
	
	var oldValue = this._value;
	
	// If the value hasn't changed, don't bother
	if (oldValue == value) return;
	
	// Clean up the value - catches any invalid cases
	value = cleanValue(this.type, value);
	
	if (this.type == types.BaseType.InfoTable) {
		// This is an easy way to do a deep copy of one object to another
		// Need to investigate a shallow-copy technique
		this._value = TwxInfoTable.Copy(value);
	} else {
		this._value = value;
	}
	
	var newValue = this._value;

	// Invoke the changed event next tick
	setImmediate(_.bind(function () {
		// Emit callback
		this.emit('change', newValue, oldValue);
	}, this));
};

TwxPrimitive.ToNative = function (primitive) {
	if (!primitive instanceof TwxPrimitive) throw new Error('argument must be instance of Primitive');
	
	var type = primitive.type;
	var value = primitive.value;
	var t = types.BaseType;
	
	if (typeof type == 'string') {
		type = type_utils.stringToBaseType(type);
	}
	
	var pPrimitive = ref.NULL;
	
	// Edge-case: If you call ToNative on a primitive who's value is never set,
	// it will get an empty primtive 
	if (value == undefined)
		type = t.Nothing;
	
	switch (type) {

		case t.Nothing:
			pPrimitive = libtwx.twPrimitive_Create();
			break;

		case t.Number:
			if (!(typeof value == 'number')) {
				throw new Error('Value must be number');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromNumber(value);
			break;

		case t.Boolean:
			if (!(typeof value == 'boolean')) {
				throw new Error('Value must be boolean');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromBoolean(value == true ? 1 : 0);
			break;

		case t.Location:
			if (!(value instanceof Object)) {
				throw new Error('Value must be object');
			}
			
			if (value.latitude == undefined) {
				value.latitude = 0.0;
			}
			
			if (value.longitude == undefined) {
				value.longitude = 0.0;
			}
			
			if (value.elevation == undefined) {
				value.elevation = 0.0;
			}
			
			var location = new types.location({
				latitude: value.latitude,
				longitude: value.longitude,
				elevation: value.elevation
			});
			
			pPrimitive = libtwx.twPrimitive_CreateFromLocation(location.ref());
			break;
        
		case t.DateTime:
			if (!(typeof value == 'number')) {
				throw new Error('Value must be number');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromDatetime(value);
			break;

		case t.Integer:
			if (!(typeof value == 'number')) {
				throw new Error('Value must be number');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromInteger(value);
			break;

		case t.InfoTable:
			var it;
			if (value instanceof TwxInfoTable) {
				it = TwxInfoTable.toNative(value);
			} else if (value instanceof Buffer) {
				it = value;
			} else {
				console.log('value: %s', util.inspect(value, { depth: null }));
				throw new Error('value must be TwxInfoTable or Buffer');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromInfoTable(it);
			break;

		case t.Variant:
			/*
			var v
			if (value instanceof TwxPrimitive) {
				v = value.twPrimitive;
			} else if (value instanceof Buffer) {
				v = value;
			} else {
				throw new Error('Value must be TwxPrimitive or Buffer');
			}
			
			pPrimitive = libtwx.twPrimitive_CreateFromPrimitive(v);
			*/
			break;

		case t.JSON:
			var cJson = libjson.cJSON_Parse(JSON.stringify(value));
			
			pPrimitive = libtwx.twPrimitive_CreateFromJson(cJson, ref.NULL, t.JSON);
			break;

		case t.String:
		case t.XML:
		case t.Query:
		case t.Hyperlink:
		case t.Imagelink:
		case t.Password:
		case t.HTML:
		case t.Text:
		case t.Tags:
		case t.GUID:
		case t.PropertyName:
		case t.ServiceName:
		case t.EvevntName:
		case t.ThingName:
		case t.ThingShapeName:
		case t.ThingTemplateName:
		case t.DataShapeName:
		case t.MashupName:
		case t.MenuName:
		case t.BaseTypeName:
		case t.UserName:
		case t.GroupName:
		case t.CategoryName:
		case t.StyleDefinitionName:
		case t.StyleDefinition:
		case t.ModelTagVocabularyName:
		case t.DataTagVocabularyName:
		case t.NetworkName:
		case t.MediaEntityName:
		case t.ApplicationKeyName:
		case t.LocationTableName:
		case t.DashboardName:
		case t.OrganizationName:
			if (typeof value != 'string') throw new Error('Value must be string');
			pPrimitive = libtwx.twPrimitive_CreateFromString(value, 1);
			break;

		case t.Blob:
		case t.Image:
			if (!(value instanceof Buffer)) {
				throw new Error('Value must be Buffer');
			}
			
			// Create a 'char *' pointer to the Buffer
			var pValue = ref.ref(value);
			
			// Create the blob
			pPrimitive = libtwx.twPrimitive_CreateFromBlob(pValue, value.length, (this.type == t.Image ? 1 : 0), 1);
			break;
		default:
			var err = 'Unable to set value for type %d - unsuppored currently';
			debug(err, this.type);
			throw new Error(util.format(err, this.type));
			break;
	}
	
	if (ref.isNull(pPrimitive)) {
		throw new Error('Unable to convert to native primitive');
	}
	
	return pPrimitive;
};

TwxPrimitive.FromNative = function (primitive) {
	if (!primitive instanceof Buffer) throw new Error('Argument must be instance of Buffer');
	
	var t = types.BaseType;
	
	// dereference pointer to access contents of primitive struct
	var pPrimitive = primitive.deref();
	
	var value = null;
	var type = pPrimitive.type;
	
	switch (pPrimitive.type) {

		case t.Number:
			value = pPrimitive.val.number;
			break;

		case t.Boolean:
			var cVal = pPrimitive.val.boolean;
			value = (cVal == 0 ? false : true);
			break;

		case t.Location:
			value = {}
			var pValue = pPrimitive.val.location;
			value.latitude = pValue.latitude;
			value.longitude = pValue.longitude;
			value.elevation = pValue.elevation;
			break;
        
		case t.DateTime:
			value = pPrimitive.val.datetime;
			break;

		case t.Blob:
		case t.Image:
			if (pPrimitive.val.bytes.data.isNull()) {
				value = undefined;
			} else {
				value = ref.readPointer(pPrimitive.val.bytes.data, 0,
										pPrimitive.val.bytes.len);
			}
			break;

		case t.JSON:
			var cJSON = libtwx.twPrimitive_ToJson('result', pPrimitive, ref.NULL);
			var json = libjson.cJSON_Print(cJSON);
			libjson.cJSON_Delete(cJSON);
			value = JSON.parse(json).result;
			break;

		case t.Variant:
			value = TwxPrimitive.FromNative(pPrimitive.val.variant);
			break;

		case t.Integer:
			value = pPrimitive.val.integer;
			break;

		case t.InfoTable:
			if (ref.isNull(pPrimitive.val.infotable)) {
				value = undefined;
			} else {
				value = TwxInfoTable.fromNative(pPrimitive.val.infotable);
			}
			break;

		case t.String:
		case t.XML:
		case t.Query:
		case t.Hyperlink:
		case t.Imagelink:
		case t.Password:
		case t.HTML:
		case t.Text:
		case t.Tags:
		case t.GUID:
		case t.PropertyName:
		case t.ServiceName:
		case t.EvevntName:
		case t.ThingName:
		case t.ThingShapeName:
		case t.ThingTemplateName:
		case t.DataShapeName:
		case t.MashupName:
		case t.MenuName:
		case t.BaseTypeName:
		case t.UserName:
		case t.GroupName:
		case t.CategoryName:
		case t.StyleDefinitionName:
		case t.StyleDefinition:
		case t.ModelTagVocabularyName:
		case t.DataTagVocabularyName:
		case t.NetworkName:
		case t.MediaEntityName:
		case t.ApplicationKeyName:
		case t.LocationTableName:
		case t.DashboardName:
		case t.OrganizationName:
			if (pPrimitive.val.bytes.data.isNull()) {
				value = undefined;
			} else {
				// Treat as C-style string - will read untill frist NULL byte
				value = ref.readCString(pPrimitive.val.bytes.data, 0);
			}
			break;

		case t.Nothing:
			break;

		default:
			debug('Unable to get value for type %d - unsupported', this.type);
			throw new Error(util.format('Unable to get value for type %d - unsupported', this.type));
			break;
	}
	
	return new TwxPrimitive(type, value);
};

var cleanValue = function (type, value) {
	var t = types.BaseType;
	var valueType = typeof value;
	var ret = false;
	switch (type) {

		case t.Number:
		case t.Integer:
			switch (valueType) {
				case 'number':
					ret = true;
					break;
				case 'string':
					var tmp = (type == t.Number ? parseFloat(value) : parseInt(value));
					if (!isNaN(tmp)) {
						value = tmp;
						ret = true;
					}
					break;
				case 'boolean':
					value = (value == true ? 1 : 0);
					break;
				default:
					ret = false;
					break;
			}
			break;

		case t.Boolean:
			switch (valueType) {
				case 'boolean':
					ret = true;
					break;
				case 'string':
					if (value.toLowerCase() == 'true') {
						value = true;
						ret = true;
					} else if (value.toLowerCase() == 'false') {
						value = false;
						ret = true;
					}
					break
				default:
					ret = false;
					break;
			}
			break;

		case t.Location:
			switch (valueType) {
				case 'object':
					if (value.hasOwnProperty('latitude') &&
					    value.hasOwnProperty('longitude')) {
						ret = true;
					}
					break;
				default:
					ret = false;
					break;
			}
			break;
        
		case t.DateTime:
			if (value instanceof Date) {
				value = value.value;
			} else {
				switch (valueType) {
					case 'number':
						ret = true;
						break;
					case 'string':
						var date = Date.parse(value);
						if (!isNaN(date)) {
							value = date
							ret = true;
						}
						break;
					default:
						break;
				}
			}
			break;

		case t.Blob:
		case t.Image:
			if (value instanceof Buffer) {
				ret = true;
			}
			break;

		case t.JSON:
			if (typeof value != 'object') {
				value = { value: value }
			}
			ret = true;
			break;

		case t.Variant:
			if (!(value instanceof TwxPrimitive)) {
				value = new TwxPrimitive(type, value);
			}
			ret = true;
			break;

		case t.InfoTable:
			if (value instanceof TwxInfoTable) {
				ret = true;
			}
			break;

		case t.String:
		case t.XML:
		case t.Query:
		case t.Hyperlink:
		case t.Imagelink:
		case t.Password:
		case t.HTML:
		case t.Text:
		case t.Tags:
		case t.GUID:
		case t.PropertyName:
		case t.ServiceName:
		case t.EvevntName:
		case t.ThingName:
		case t.ThingShapeName:
		case t.ThingTemplateName:
		case t.DataShapeName:
		case t.MashupName:
		case t.MenuName:
		case t.BaseTypeName:
		case t.UserName:
		case t.GroupName:
		case t.CategoryName:
		case t.StyleDefinitionName:
		case t.StyleDefinition:
		case t.ModelTagVocabularyName:
		case t.DataTagVocabularyName:
		case t.NetworkName:
		case t.MediaEntityName:
		case t.ApplicationKeyName:
		case t.LocationTableName:
		case t.DashboardName:
		case t.OrganizationName:
			ret = true;
			switch (valueType) {
				case 'number':
				case 'boolean':
					value = value.ToString();
					break;
				case 'string':
					break;
				default:
					ret = false;
					break;
			}
			break;

		case t.Nothing:
			value = undefined;
			ret = true
			break;

		default:
			break;
	}
	
	if (!ret) {
		throw new Error(util.format('Unable to write to primitive of type %s with value \'%s\'', 
			libtwx.baseTypeToString(type), value));
	}
	
	return value;
}

module.exports = TwxPrimitive;