// Example #3 - Minimal agent.   
// * Create a thing 
// * Create a property
// * Bind thing
// * Connect to Thingworx 
console.log('Running Example #14: Multiple Things');

// Thingworx API interface
var Api = require('thingworx-api').Api;
// Thingworx Thing API interface
var Thing = require('thingworx-api').Thing;
// Thingworx Logging Interface
var logger = require('thingworx-utils').Logger;
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = Api(config);

// Initailize the API
api.initialize();

// Create some things 
var things = {
	thingA : new Thing('thingA'),
	thingB : new Thing('thingB'),
	thingC : new Thing('thingC'),
	thingD : new Thing('thingD')
}

for (var thing in things) {
	thing = things[thing];
	thing.addProperty({
		name: 'ExampleString',
		type: 'string',
		value: 'I was created by ' + thing.name
	});
	
	thing.on('bind', function () {
		logger.info('%s has bound', this.name);
	});
	
	thing.on('property-change', function (prop) {
		logger.info('%s has had property change %j', this.name, prop);
	});
	
	// Bind the thing
	thing.bind();
}

// Connect to Thingworx
api.connect();
