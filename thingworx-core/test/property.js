var assert = require("assert");
var util = require('util');
var ref = require('ref');

var Property = require('../lib/property.js');
var types = require('thingworx-ffi').Types;

describe('Property', function () {
    describe('#setValue and #getValue', function () {
        
        it('should work with integers', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'integer'
            });
            var startingValue = 100;
            prop.setValue(startingValue);
            assert.equal(startingValue, prop.getValue());
        });
        
        it('should work with floats', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'number'
            });
            var startingValue = 100.0;
            prop.setValue(startingValue);
            assert.equal(startingValue, prop.getValue());
        });
        
        it('should work with strings', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'string'
            });
            var startingValue = 'This is a test!';
            prop.setValue(startingValue);
            assert.equal(startingValue, prop.getValue());
        });
        
        it('should work with boolean', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'boolean'
            });
            var startingValue = true;
            prop.setValue(startingValue);
            assert.equal(startingValue, prop.getValue());
        });
        
        it('should work with location', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'location'
            });            var startingValue = {
                'latitude': 44.968046,
                'longitude': -94.420307,
                'elevation': 100.0
            };
            
            prop.setValue(startingValue);
            var locStruct = prop.getValue();
            
            assert.equal(startingValue.latitude, locStruct.latitude);
            assert.equal(startingValue.longitude, locStruct.longitude);
            assert.equal(startingValue.elevation, locStruct.elevation);
        });
        
        it('should work with datetime', function () {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'datetime'
            });
            
            var startingValue = new Date().getTime();
            prop.setValue(startingValue);
            assert.equal(startingValue, prop.getValue());
        });
    });

	describe('#value', function () {
		it('should work with getter', function () {
			var prop = new Property({
				name: 'TestProperty', 
				type: 'string'
			});
			var startingValue = 'This is a test';
			prop.setValue(startingValue);
			assert.equal(startingValue, prop.value);
		});
		it('should work with setter', function () {
			var prop = new Property({
				name: 'TestProperty', 
				type: 'string'
			});
			var startingValue = 'This is a test';
			
			prop.value = startingValue;
			assert.equal(startingValue, prop.getValue());
		});
	});

    describe('Events', function () {
        it("'change' should work", function (done) {
            var prop = new Property({
                name: 'TestProperty', 
                type: 'string'
            });
			
			var startingValue = 'This is a test';
			
			prop.on('change', function (result) {
				assert.notEqual(result, undefined);
				assert.equal(result.name, 'TestProperty');
				assert.equal(result.type, 'string');
				assert.equal(result.value, startingValue);
				assert.equal(result.oldValue, undefined);
                done();
            });
            
            prop.setValue(startingValue);
        });
        
    });
});