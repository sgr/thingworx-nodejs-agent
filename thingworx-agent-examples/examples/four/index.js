// Example #4 - Thing with Property
var Api = require('thingworx-api').Api;				// Thingworx API 
var Thing = require('thingworx-api').Thing;			// Thingworx Virtual Thing
var logger = require('thingworx-utils').Logger;		// Thingworx Logging Utility
// Connection configuration
var config = require('../config.json');
// Create a new API object
var api = new Api(config);

// Initailize the API
api.initialize();

// Write some data to the log
logger.info('Running Example #4: Basic Thing with Property Change');

// Create a new thing called 'DemoThing4'
var thing = new Thing('DemoThing4');

// Add a new property to the Thing
thing.addProperty({
	name: 'count',
	type: 'number',
});

// Log some info to the console whenever any property changes
thing.on('property-change', function (prop) {
	console.log("Updated property value: %j", prop);
});

// Bind the thing
thing.bind();

// Connect to Thingworx
api.connect();

// When connected to Thingworx immediately log some data to the console, and
// then increase the value of a property by one every second. 
api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", thing.name);

	var count = 0
	
	// Create a function that will be called once every second.	
	setInterval(function () {
		
		var prop = thing.getProperty('count');
		count = count + 1;	
		prop.setValue(count);

	}, 1000);
});
