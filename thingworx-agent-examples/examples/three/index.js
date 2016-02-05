// Example #3 - Minimal agent.
// * Create a thing
// * Create a property
// * Bind thing
// * Connect to Thingworx

console.log('Running Example #3: minimal agent w/ property');
var util = require('util');

// Thingworx API interface
var Api = require('thingworx-api').Api;

// Thingworx Thing API interface
var Thing = require('thingworx-api').Thing

// Connection configuration
var config = require('../config.json');

// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('HomeLight0');

// Add a new property to exampleThing; start with OFF; later, set it to ON
exampleThing.addProperty({
    	name: 'LightStatus',
    	type: ‘string',
    	value: ‘OFF’
});

// Bind the thing
exampleThing.bind();

// Establish a connection to thingworx and invoke the callback
// when connected
api.connect();

// Register for 'connect' events
api.on('connect', function () {
    	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
    	var property = exampleThing.getProperty('LightStatus');
    	console.log("Property '%s' has a value of '%s'", property.name, property.value);
});
