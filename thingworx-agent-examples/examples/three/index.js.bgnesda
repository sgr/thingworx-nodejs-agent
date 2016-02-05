// Example #3 - Minimal agent.   
// * Create a thing 
// * Create a property
// * Bind thing
// * Connect to Thingworx 
console.log('Running Example #3: minimal agent w/ property');

// Thingworx API interface
var Api = require('thingworx-api').Api;
// Thingworx Thing API interface
var Thing = require('thingworx-api').Thing;
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a Thing
var thing = new Thing('TestThing');

// List of properties implemented by the sensor
var properties = {
	temperature: 'number',
	lightstatus: 'string',
};

// Add all sensor properties to the Thing
for (key in properties) {
	thing.addProperty({
		name: key,
		type: properties[key]
	});
}

var dataCollectionTask = function () {
	
	// Return random data between within the range of min/max
	var getRandomData = function (min, max) {
		return Math.random() * (max - min) + min;
	}
	
	
	fs = require('fs');
	fs.readFile('/home/pi/python_agent/LightStatus', 'utf8', function(err,data) {
		if (err) {
			return console.log(err);
		}
		thing.setProperty('lightstatus', data);
	});
	// Update all properties with random data
	thing.setProperty('temperature', getRandomData(50, 75));
};

// Bind the thing
thing.bind();

// Connect to Thingworx
api.connect();

setInterval(dataCollectionTask, 5000);

// Register for 'connect' events 
//api.on('connect', function () {
//	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
//	var property = exampleThing.getProperty('ExampleString');
//	console.log("Property '%s' has a value of '%s'", property.name, property.value);
//});
