var assert = require("assert");
var util = require('util');
var ref = require('ref');
var ffi = require('thingworx-ffi');

var libjson = ffi.LibCJSON;
var libtwx = ffi.LibTWX;

var DataShape = require('../lib/datashape.js');
var Service = require('../lib/service.js');
var types = ffi.Types;
var typeUtils = ffi.Types.utils;

describe('Service', function () {
	describe('#constructor', function () {
		
		it('should create object with JSON as input', function () {
			
			var service = new Service({
				name: 'Test Service', 
				desc: 'Test Description',
				inputs: {
					name: 'TestString',
					description: 'Test Description',
					type: types.BaseType.String
				},
				output_type: types.BaseType.Boolean,
				service_handler : function () { }
			});
			
			assert.notEqual(service, undefined);
			assert.equal(service.name, 'Test Service');
			assert.equal(service.description, 'Test Description');
			assert.notEqual(service.inputDataShape != ref.NULL);
			assert.equal(service.outputType, types.BaseType.Boolean);
		});
		
		it('should create object with DataShape as input', function () {
			var dataShape = new DataShape();
			dataShape.addEntry('TestString', types.BaseType.String, 'Test description');
			
			var service = new Service({
				name: 'Test Service', 
				desc: 'Test Description',
				inputs: dataShape,
				output_type: types.BaseType.String,
				service_handler : function () { }
			});
			
			assert.notEqual(service, undefined);
			assert.equal(service.name, 'Test Service');
			assert.equal(service.description, 'Test Description');
			assert.notEqual(service.inputDataShape != ref.NULL);
			assert.equal(service.outputType, types.BaseType.String);
		});
	});
});