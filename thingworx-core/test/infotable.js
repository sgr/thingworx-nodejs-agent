var assert = require("assert");
var util = require('util');
var ref = require('ref');
var ffi = require('thingworx-ffi');

var libjson = ffi.LibCJSON;
var libtwx = ffi.LibTWX;

var InfoTable = require('../lib/infotable.js');
var types = ffi.Types;
var typeUtils = ffi.Types.utils;

describe('InfoTable', function () {
	describe('#constructor', function () {
		
		it('should create object with JSON object as input', function () {
			var dataShape = {
				name: 'TestString',
				description: 'Test description',
				type: types.BaseType.String
			};
			
			var infoTable = new InfoTable(dataShape);
			assert.notEqual(infoTable, undefined);
		});
		
		it('should create object with array of JSON objects as input', function () {
			
			var dataShape = [
				{
					name: 'TestString',
					description: 'Test description',
					type: types.BaseType.String
				},
				{
					name: 'TestInteger',
					description: 'Test description',
					type: types.BaseType.Integer
				},
			];
			
			var infoTable = new InfoTable(dataShape);
			assert.notEqual(infoTable, undefined);
		});
		
		it("shouldn't create an object with no input", function () {
			
			assert.throws(function () {
				var infoTable = new InfoTable();
			}, Error);
		});
		
		it("shouldn't create object with invalid JSON as input", function () {
			var dataShape = [
				{
					illegalAttribute: 'TestString',
					description: 'Test description',
					type: types.BaseType.String
				},
				{
					name: 'TestInteger',
					description: 'Test description',
					illegalAttribute: types.BaseType.Integer
				},
			];
			assert.throws(function () {
				var infoTable = new InfoTable(dataShape);
			}, Error);
		});
		
		it("shouldn't create object with non-json as input", function () {
			assert.throws(function () {
				var infoTable = new InfoTable(-1);
			}, Error);
			
			assert.throws(function () {
				var infoTable = new InfoTable(3242313432.0);
			}, Error);
			
			assert.throws(function () {
				var infoTable = new InfoTable(false);
			}, Error);
			
			assert.throws(function () {
				var infoTable = new InfoTable('Hello!');
			}, Error)
		});
		
	});
	
	describe('#getValue/#setValue', function () {
		
		it('should work with no arguments', function () {
			var infoTable = InfoTable.CreateFrom('Test', 'Test', types.BaseType.String);
			var val = infoTable.getValue();
			assert.equal(val, 'Test');

			infoTable.setValue('Test 2');
			assert.equal(infoTable.getValue(), 'Test 2');
		});

		it('should work with name argument', function () {
			var infoTable = InfoTable.CreateFrom('Test', 'TestValue', types.BaseType.String);
			assert.equal(infoTable.getValue('Test'), 'TestValue');

			infoTable.setValue('Test', 'Value 2');
			assert.equal(infoTable.getValue('Test'), 'Value 2');
		});

		it('should work with name and row argument', function () {
			var dataShape = [
				{
					name: 'TestString',
					description: 'Test description',
					type: types.BaseType.String
				},
				{
					name: 'TestInteger',
					description: 'Test description',
					type: types.BaseType.Integer
				},
			];
			
			var val1 = 'Test';
			var val2 = 100;
			
			var infoTable = new InfoTable(dataShape);
			infoTable.setValue('TestString', 0, val1);
			infoTable.setValue('TestInteger', 0, val2);
			
			infoTable.setValue('TestString', 1, val1);
			infoTable.setValue('TestInteger', 1, val2);

			assert.equal(infoTable.getValue('TestString'), val1);
			assert.equal(infoTable.getValue('TestInteger'), val2);

			assert.equal(infoTable.getValue('TestString', 1), val1);
			assert.equal(infoTable.getValue('TestInteger', 1), val2);
		});
	});

	describe('#CreateFrom', function () {
		it('should create infotable using name, type and value as inputs', function () {
			
			var infoTable = InfoTable.CreateFrom('Test', 'Test', types.BaseType.String);
			assert.notEqual(infoTable, undefined);
			assert.equal(infoTable.getValue(), 'Test');
		});
		
		it('should create infotable using name, and value as inputs', function () {
			
			var infoTable = InfoTable.CreateFrom('Test', 'Test');
			assert.notEqual(infoTable, undefined);
			assert.equal(infoTable.getValue(), 'Test');
		});
		
		it('should create info table from boolean', function () {
			var infoTable = InfoTable.CreateFrom(false);
			assert.notEqual(infoTable, undefined);
			assert.equal(infoTable.getValue(), false);
		});
		
		it('should create info table from number', function () {
			var infoTable = InfoTable.CreateFrom(100.0);
			assert.notEqual(infoTable, undefined);
			assert.equal(infoTable.getValue(), 100.0);
		});
		
		it('should create info table from string', function () {
			var infoTable = InfoTable.CreateFrom('Test');
			assert.notEqual(infoTable, undefined);
			assert.equal(infoTable.getValue(), 'Test');
		});
		
		it('should create info table from location', function () {
			var infoTable = InfoTable.CreateFrom({
				latitude: 44.968046,
				longitude: -94.420307,
				elevation: 100.0
			});
			assert.notEqual(infoTable, undefined);
			var val = infoTable.getValue();
			assert.equal(val.latitude, 44.968046);
			assert.equal(val.longitude, -94.420307);
			assert.equal(val.elevation, 100.0);
		});
		
		it('should create info table from json', function () {
			var input = {
				array: [
					{
						name: 'TestString',
						description: 'Test description',
						type: types.BaseType.String
					},
					{
						name: 'TestInteger',
						description: 'Test description',
						type: types.BaseType.Integer
					},
				]
			}
			var infoTable = InfoTable.CreateFrom(input);

			assert.notEqual(infoTable, undefined);
			
			var val = infoTable.getValue();
			assert.deepEqual(val, input);
		});
		
		it("shouldn't work for invaid inputs", function () {
			assert.throws(function () {
				var infoTable = InfoTable.CreateFrom([]);
			}, Error);
			assert.throws(function () {
				var infoTable = InfoTable.CreateFrom(null);
			}, Error);
			assert.throws(function () {
				var infoTable = InfoTable.CreateFrom({});
			}, Error);
			assert.throws(function () {
				var infoTable = InfoTable.CreateFrom();
			}, Error);
		});
	});
});
