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

// Thingworx Property Monitor
// var PropertyMonitor = require('./lib/property-monitor.js');

// Connection configuration
var config = require('../config.json');

// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('TestThing2');

// List of properties implemmented by exampleThing
var properties = {
	LightStatus: 'string',
	LightLocation: 'location'
};

// Add all properties to exampleThing
for (key in properties) {
	exampleThing.addProperty({
		name: key,
		type: properties[key]
	});
}

var dataCollectionTask = function () {
	var location = exampleThing.getPropertyValue('LightLocation');
	location.latitude = 42.295169;
	location.longitude = -71.214685;
	location.elevation = 0;
	exampleThing.setProperty('LightStatus', 'OFF');
	exampleThing.setProperty('LightLocation', location);
};

// Bind the thing
exampleThing.bind();

// Establish a connection to thingworx and invoke the callback
// when connected
api.connect();

setInterval(dataCollectionTask, 5000);

// Register for 'connect' events
api.on('connect', function () {
    	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
    	var property = exampleThing.getProperty('LightStatus');
    	console.log("Property '%s' has a value of '%s'", property.name, property.value);
});
