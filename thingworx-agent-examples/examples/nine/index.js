console.log('Running Example #9: Property Watcher Example');

var util = require('util');

// Thingworx API interfaces
var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing
var types = require('thingworx-api').Types;

// Holds functions used by services
var serviceHandler = require('./service_handler.js');
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in some default settings
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('DemoThing9');

// Create a new service 
// addTeskSearchTask
//   Adds a file to be searched later by a text driver for a set of keywords
//   (see addPropertyWatcher below).
exampleThing.addService({
	name: 'addTextSearchTask',			// Service Name
	desc: 'Test Description',		    // Service Type
	inputs: [
		{
			name: 'name',				// Handle for the file
			type: 'string'
		},
		{
			name: 'filename',			// path to file (must be 
			type: 'string' 
		},
	],
	output_type: types.BaseType.Nothing,	// Output Type
	service_handler : serviceHandler.addTextSearchTask
});

// Create a new service
exampleThing.addService({
	name: 'addPropertyWatcher',			// Service Name
	desc: 'Test Description',		    // Service Type
	inputs: [
		{
			name: 'taskName',
			type: 'string'
		},
		{
			name: 'keyword',
			type: 'string'
		},
		{
			name: 'property',
			type: 'string'
		},
		{
			name: 'propertyType',
			type: 'string'
		},
		{
			name: 'propertyDescription',
			type: 'string'
		},
		{
			name: 'parserFunction',
			type: 'string'
		},
	],
	output_type: types.BaseType.Nothing,	// Output Type
	service_handler : serviceHandler.addPropertyWatcher
});

// Bind the thing
exampleThing.bind();

// Establish a connection to thingworx 
api.connect();

api.on('connect', function () {
	console.log('Connected to Thingworx as %s!', exampleThing.name);
});
