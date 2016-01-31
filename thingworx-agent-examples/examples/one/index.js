// Example #1 - Barebones Connectivity   
var Api = require('thingworx-api').Api;			// Thingworx API 
var logger = require('thingworx-utils').Logger;	// Thingworx Logging Utility
// Connection configuration
var config = require('../config.json');
// Create a new API object
var api = new Api(config);

// Initailize the API
api.initialize();

// Write some data to the log
logger.info('Running Example #1: Barebones connectivity');

// Establish a connection to Thingworx 
api.connect();

// When connected to Thingworx. log a message to the console
api.on('connect', function () {
	logger.info('Connected to Thingworx!');
});
