var assert = require("assert");
var util = require('util');
var ref = require('ref');
var ffi = require('thingworx-ffi');

var libtwx = ffi.LibTWX;
var primitive = require('../lib/primitive.js');
var types = ffi.Types;

describe('Primitive', function () {
	describe('#constructor', function () {
		it('should work with type', function () {
			var prim = new primitive(types.BaseType.String);
			assert.equal(prim.type, types.BaseType.String);
		});
		
		it('should work with type and value', function () {
			var prim = new primitive(types.BaseType.String, 'This is a test');
			
			assert.equal(prim.type, types.BaseType.String);
			assert.equal('This is a test', prim.getValue());
		});
		
		it('should work with pointer to C primitive', function () {
			var pPrim = libtwx.twPrimitive_CreateFromString('This is a test', 1);
			var prim = primitive.FromNative(pPrim);
			
			assert.equal(prim.type, types.BaseType.String);
			assert.equal(prim.value, 'This is a test');
		});
	});
	describe('#setValue', function () {
		
		it('should work with integers', function () {
			var prim = new primitive(types.BaseType.Integer);
			var startingValue = 100;
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.getValue());
		});
		
		it('should work with floats', function () {
			var prim = new primitive(types.BaseType.Number);
			var startingValue = 100.0;
			
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.getValue());
		});
		
		it('should work with strings', function () {
			var prim = new primitive(types.BaseType.String);
			var startingValue = 'This is a test';
			
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.getValue());
		});
		
		it('should work with boolean', function () {
			var prim = new primitive(types.BaseType.Boolean);
			var startingValue = true;
			
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.getValue());
		});
		
		it('should work with location', function () {
			var prim = new primitive(types.BaseType.Location);
			var startingValue = {
				latitude: 44.968046,
				longitude: -94.420307,
				elevation: 100.0
			};
			
			prim.setValue(startingValue);
			var datum = prim.getValue();
			
			assert.equal(startingValue.latitude, datum.latitude);
			assert.equal(startingValue.longitude, datum.longitude);
			assert.equal(startingValue.elevation, datum.elevation);
		});
		
		it('should work with datetime', function () {
			var prim = new primitive(types.BaseType.DateTime);
			var startingValue = new Date().getTime();
			
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.getValue());
		});
		
		it('should work with json', function () {
			var prim = new primitive(types.BaseType.JSON);
			var startingValue = {
				"firstName": "John",
				"lastName": "Smith",
				"address": {
					"streetAddress": "21 2nd Street",
					"city": "New York",
					"state": "NY",
					"postalCode": 10021
				},
				"phoneNumbers": [
					"212 555-1234",
					"646 555-4567"
				]
			};
			
			prim.setValue(startingValue);
			assert.deepEqual(startingValue, prim.getValue());
		});
		
		it("shouldn't work with invalid values", function () {
			
			assert.throws(function () {
				var intPrim = new primitive(types.BaseType.Integer);
				intPrim.setValue("This is a string - it shouldn't work")
			}, Error);
			
			assert.throws(function () {
				var floatPrim = new primitive(types.BaseType.Number);
				floatPrim.setValue("This is a string - it shouldn't work");
			}, Error);
			
			assert.throws(function () {
				var stringPrim = new primitive(types.BaseType.String);
				floatPrim.setValue(100);
			}, Error);
			
			assert.throws(function () {
				var locPrim = new primitive(types.BaseType.Location);
				locPrim.setValue("This is a string - it shouldn't work");
			}, Error);
			
			assert.throws(function () {
				var datePrim = new primitive(types.BaseType.DateTime);
				datePrim.setValue("This is a string - it shouldn't work");
			}, Error);
			
			assert.throws(function () {
				var boolPrim = new primitive(types.BaseType.Boolean);
				boolPrim.setValue("This is a string - it shouldn't work");
			}, Error);
		});
      
        /*
        it('should work with Variants', function (done) {
            var prim = new primitive(types.BaseType.Variant);
            
            var union = new types.primitiveValue();
            var datetime = 100 //new Date().getTime();
            union.datetime = datetime;
            
            console.log('UNION - ', union);
            console.log('DATE TIME - ', datetime);
            console.log('UNION DATE TIME', union.datetime);

            var startingValue = new types.primitive({
                type        : types.BaseType.Variant,
                typeFamily  : types.BaseType.Variant,
                length      : 0,
                val         : union
            });
            
            prim.setValue(startingValue.ref(), function (err, result) {
                var pPrim = result.twPrimitive.deref();
                console.log('RESULT',  result);
                console.log('STARTING VAL', startingValue);
                
                var u1 = pPrim.val.datetime;
                var u2 = startingValue.val.datetime;
                
                console.log('u1: %s\nu2: %s\n\n',util.inspect(u1) , util.inspect(u2));

                assert.equal(startingValue.type, result.type);

                assert.equal(startingValue.val.datetime, result.val.datetime);                
                done();
            });
        }); */
	});
	
	describe('#getValue', function () {
		it('should work with integers', function () {
			var prim = new primitive(types.BaseType.Integer);
			var startingValue = 100;
			prim.setValue(startingValue);
			var strResult = prim.getValue();
			assert.equal(startingValue, strResult);
		});
		
		it('should work with floats', function () {
			var prim = new primitive(types.BaseType.Number);
			var startingValue = 100.0;
			
			prim.setValue(startingValue);
			
			var strResult = prim.getValue();
			assert.equal(startingValue, strResult);
		});
		
		it('should work with strings', function () {
			var prim = new primitive(types.BaseType.String);
			var startingValue = 'This is a test';
			
			prim.setValue(startingValue);
			var val = prim.getValue();
			assert.equal(startingValue, val);
		});
		
		it('should work with boolean', function () {
			var prim = new primitive(types.BaseType.Boolean);
			var startingValue = true;
			
			prim.setValue(startingValue);
			var value = prim.getValue();
			assert.equal(startingValue, value);
		});
		
		it('should work with location', function () {
			var prim = new primitive(types.BaseType.Location);
			var startingValue = {
				latitude: 44.968046,
				longitude: -94.420307,
				elevation: 100.0
			}
			
			prim.setValue(startingValue);
			var value = prim.getValue();
			
			assert.equal(startingValue.latitude, value.latitude);
			assert.equal(startingValue.longitude, value.longitude);
			assert.equal(startingValue.elevation, value.elevation);
		});
		
		it('should work with datetime', function () {
			var prim = new primitive(types.BaseType.DateTime);
			var startingValue = new Date().getTime();
			
			prim.setValue(startingValue);
			var value = prim.getValue();
			assert.equal(startingValue, value);
		});
		
		it('should work with json', function () {
			var prim = new primitive(types.BaseType.JSON);
			var startingValue = {
				"firstName": "John",
				"lastName": "Smith",
				"address": {
					"streetAddress": "21 2nd Street",
					"city": "New York",
					"state": "NY",
					"postalCode": 10021
				},
				"phoneNumbers": [
					"212 555-1234",
					"646 555-4567"
				]
			};
			
			prim.setValue(startingValue);
			var json = prim.getValue();
			assert.deepEqual(startingValue, json);
		});
	});
	describe('#value', function () {
		it('should work with getter', function () {
			var prim = new primitive(types.BaseType.String);
			var startingValue = 'This is a test';
			prim.setValue(startingValue);
			assert.equal(startingValue, prim.value);
		});
		it('should work with setter', function () {
			var prim = new primitive(types.BaseType.String);
			var startingValue = 'This is a test';
			
			prim.value = startingValue;
			assert.equal(startingValue, prim.getValue());
		});
	});
	/*
     * not sure if #getPointer() is useful or not...
    describe('#getPointer', function () {
        it('should return a valid buffer', function () {
            var prim = new primitive(types.BaseType.String);
            var startingValue = 'This is a test';
            
            prim.setValue(startingValue);

            var pPrimitive = prim.getPointer();
            
            assert(pPrimitive instanceof Buffer);
            var value = pPrimitive.deref();
            
            strVal = ref.readCString(value.val.bytes.data, 0);
            assert.equal(startingValue, strVal);
        });
        
        it("shouldn't return an invalid buffer", function () {
            var prim = new primitive(types.BaseType.String);
            assert.throws(function () {
                var example = prim.getPointer();
            }, Error);
        });
    });
    */
    describe('Events', function () {
		it("'change' should work", function (done) {
			var prim = new primitive(types.BaseType.String, 'Starting Value');
			// Introduce some artifical delay to avoid the first changed callback
			setTimeout(function () {
				prim.on('change', function (newValue, oldValue) {
					assert.equal(newValue, 'Changed Value');
					assert.equal(oldValue, 'Starting Value');
					done();
				});

				prim.setValue('Changed Value');
			}, 10);			
		});
	});

});