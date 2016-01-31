// Example #5 - Thing with Service
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
logger.info('Running Example #5: Basic Thing with Service');

// Create a new thing
var thing = new Thing('DemoThing5');

// Create a new service
thing.addService({
	name: 'TestService',					// Service Name
	desc: 'Test Description',				// Service Description
	inputs: {								// Input DataShape
		name: 'TestString',					
		description: 'Test Description',
		type: 'string'
	},
	output_type: 'boolean',					// Output Type

	// Service Callback Handler - will be called when the service is invoked.
	service_handler : function (params) {
		var val = params.getValue('TestString');
		console.log('Service Callback: TestString = %s', val);
		
		return true;
	}
});

// Bind the thing
thing.bind();

// Connect to Thingworx
api.connect();

// When connected to Thingworx, log a message to the console
api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", thing.name);
});
