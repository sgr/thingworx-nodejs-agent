// Example #6 - Thing with Event
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
logger.info('Running Example #6: Basic Thing with Event');

// Create a new thing called 'DemoThing6'
var thing = new Thing('DemoThing6');

// Add a new event to the Thing
thing.addEvent({
	name: 'TestEvent',					// Event Name
	description: 'Test Description',	// Event Description
	inputs: {							// Event DataShape
		name: 'TestString',					
		description: 'Test Description',
		type: 'string'
	}
});

// Bind the thing
thing.bind();

// Connect to Thingworx
api.connect();

// When connected to Thingworx, log a message to the console
api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", thing.name);

	setTimeout(function () { thing.fireEvent('TestEvent', { 'TestString': 'Test' }) }, 1000);
});
