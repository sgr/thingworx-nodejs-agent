// Example #2 - Minimal agent.   
var Api = require('thingworx-api').Api;			// Thingworx API
var Thing = require('thingworx-api').Thing		// Thingworx Virtual Thing
var logger = require('thingworx-utils').Logger;	// Thingworx Logging Utility
// Connection configuration
var config = require('../config.json');
// Create a new API object
var api = new Api(config);

// Initailize the API
api.initialize();

// Write some data to the log
logger.info('Running Example #2: Barebones, minimal agent');

// Create a new Thing called 'DemoThing2'
var exampleThing = new Thing('DemoThing2');

// Bind the thing
exampleThing.bind();

// Establish a connection to Thingworx 
api.connect();

// When connected to Thingworx. log a message to the console
api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
});
