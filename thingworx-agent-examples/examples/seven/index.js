// Example #7 - Thing with Text Driver
var Api = require('thingworx-api').Api;				// Thingworx API 
var Thing = require('thingworx-api').Thing;			// Thingworx Virtual Thing
var logger = require('thingworx-utils').Logger;		// Thingworx Logging Utility

var Drivers = require('thingworx-driver-examples').Drivers;		// Example Text Drivers
var Adaptors = require('thingworx-driver-examples').Adaptors;	// Example Text Adaptors

var path = require('path');							// Node path API
var util = require('util');							// Node util API

console.log('Running Example #6: minimal agent w/ text search driver');
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var thing = new Thing('DemoThing7');

// Add a new property to the thing
thing.addProperty({
	name: 'Pressure',
	type: 'number'
});

// Bind the thing
thing.bind();

// Log some info to the console whenever this property changes
var pressure = thing.getProperty('Pressure');
pressure.on('change', function (prop) {
	logger.info("Updated property value for pressure: %s", pressure.getValue());
});

// Connect to Thingworx
api.connect();

// When connected to Thingworx, log a message to the console
api.on('connect', function () {
	logger.info("Connected to Thingworx with Thing '%s'", thing.name);
	
	// Create a new Text Search Driver
	var textDriver = new Drivers.Text({
		name: 'TextDriver',
		thing: 'ExampleThing',
		adaptor: new Adaptors.Text.PersistentTextSearch()
	});
	
	// Tell the text driver to search the file 'example.txt' for any lines that contain
	// the string 'Current Pressure'.
	textDriver.monitorFile(path.join(__dirname, 'example.txt'), 'Current Pressure', function (line, token) {
		// Whenever the text driver finds a match, run the code below
		var value = line.split(':')[1];		// Split on colon
		value = value.match(/[0-9]+/g)[0];	// Remove non digit characters
		pressure.setValue(value);			// Set the value of the 'Pressure' property
	});
	
	logger.info('Starting Text Search Driver');
	textDriver.start();
});
