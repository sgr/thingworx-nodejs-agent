var assert = require("assert");
var ffi = require('thingworx-ffi');
var util = require('util');
var ref = require('ref');

var libjson = ffi.LibCJSON
var libtwx = ffi.LibTWX;

var DataShape = require('../lib/datashape.js');
var types = ffi.Types;
var typeUtils = ffi.Types.utils;

describe('DataShape', function () {
    describe('#constructor', function () {
        
        it('should create object with JSON object as input', function () {
            var dataShapeInputs = {
                name: 'TestString',
                description: 'Test description',
                type: types.BaseType.String
            };
            
            var dataShape = new DataShape(dataShapeInputs);
            assert.notEqual(dataShape, undefined);
        });
                
        
        it('should create object with array of JSON objects as input', function () {
            var dataShapeInputs = [
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
            
            var dataShape = new DataShape(dataShapeInputs);
            assert.notEqual(dataShape, undefined);
        });
        
        it('should create object with no input', function () {
            var dataShape = new DataShape();
            assert.notEqual(dataShape, undefined);
        });        
        
        it("shouldn't create object with invalid JSON as input", function () {
            var dataShapeInputs = [
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
                var dataShapeRef = new DataShape(dataShapeInputs);
            }, Error);
        });

        it("shouldn't create object with non-json as input", function () {
            assert.throws(function () {
                var dataShape = new DataShape(-1);
            }, Error);

            assert.throws(function () {
                var dataShape = new DataShape(3242313432.0);
            }, Error);

            assert.throws(function () {
                var dataShape = new DataShape(false);
            }, Error);

            assert.throws(function () {
                var dataShape = new DataShape('name', 'Hello!');
            }, Error)
        });
    });
    
    describe('#addEnry', function () {
        it('should be able to add entries to empty DataShape', function () {
            var dataShape = new DataShape();
            
            dataShape.addEntry('String', types.BaseType.String, 'Empty Description');
            dataShape.addEntry('Int', types.BaseType.Integer, 'Empty Description');
            
            var json = dataShape.toJson();
            
            assert.notEqual(json.String, undefined);
            assert.notEqual(json.Int, undefined);
        });
        
		it('should be able to add entries to DataShape created with json', function () {
            var dataShapeInputs = [
                {
                    name: 'OriginalString',
                    description: 'Test description',
                    type: types.BaseType.String
                },
                {
                    name: 'OriginalInteger',
                    description: 'Test description',
                    type: types.BaseType.Integer
                },
            ];

            var dataShape = new DataShape(dataShapeInputs);
            
            dataShape.addEntry('NewString', types.BaseType.String, 'Empty Description');
            dataShape.addEntry('NewInteger', types.BaseType.Integer, 'Empty Description');
            
            var json = dataShape.toJson();
            
            assert.notEqual(json.OriginalString, undefined);
            assert.notEqual(json.OriginalInteger, undefined);
            assert.notEqual(json.NewString, undefined);
			assert.notEqual(json.NewInteger, undefined);
        });
    });
    
    describe('#toJson', function () {
        it("should return valid JSON", function () {
            var dataShapeInputs = [
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
            
            var dataShape = new DataShape(dataShapeInputs);
            var json = dataShape.toJson();
                        
            assert.equal(json.TestString.name, dataShapeInputs[0].name);
            assert.equal(json.TestString.description, dataShapeInputs[0].description);
            assert.equal(json.TestString.baseType, typeUtils.baseTypeToString(dataShapeInputs[0].type));
            
            assert.equal(json.TestInteger.name, dataShapeInputs[1].name);
            assert.equal(json.TestInteger.description, dataShapeInputs[1].description);
            assert.equal(json.TestInteger.baseType, typeUtils.baseTypeToString(dataShapeInputs[1].type));
            /*
            var it = libtwx.twInfoTable_CreateFromString('Test', 'Test2', 1);
            var stringIt = libtwx.twInfoTable_ToJson(it);
            var string = libjson.cJSON_Print(stringIt);
            console.log('Test String - %s', string);
             */
        });
    });
});