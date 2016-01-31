var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing;
var xml = require('xml2js');
var fs = require('fs');
var path = require('path');
var util = require('util');

console.log('Running Example #6: minimal agent w/ text search driver');

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
var exampleThing = new Thing('DemoThing12');

// Add a new property to exampleThing
exampleThing.addProperty({
	name: 'PowerLevel',
	type: 'string'
});

exampleThing.addProperty({
	name: 'PumpPressure',
	type: 'string'
});

exampleThing.addProperty({
	name: 'ErrorStatus',
	type: 'string'
});

// Bind the thing
exampleThing.bind();

exampleThing.on('property-change', function (prop) {
	console.log('Caught Property Change - %j', util.inspect(prop, { depth: null }));
});

// Establish a connection to thingworx and invoke the callback
// when connected 
api.connect();

api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
	
	var parser = new xml.Parser();
	fs.readFile(path.join(__dirname, 'example.xml'), function (err, res) {
		parser.parseString(res, function (err, res) {
			if (err) return;

			exampleThing.setProperty("PowerLevel", res.Root.Configuration[0].PowerLevel.toString());
			exampleThing.setProperty("PumpPressure", res.Root.Configuration[0].PumpPressure.toString());
			exampleThing.setProperty("ErrorStatus", res.Root.Configuration[0].ErrorStatus.toString());

		});
	});
});
