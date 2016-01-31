console.log('Running Example #15: Image Upload');

// Thingworx API interface
var Api = require('thingworx-api').Api;
// Thingworx Thing API interface
var Thing = require('thingworx-api').Thing;
// Node.js File System API
var fs = require('fs');
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('DemoThing15');

// Add a new property to exampleThing
exampleThing.addProperty({
	name: 'ExampleImage',
	type: 'image',
});

// Bind the thing
exampleThing.bind();

// Connect to Thingworx
api.connect();

// Register for 'connect' events 
api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
	var property = exampleThing.getProperty('ExampleImage');

	fs.readFile('image.png', function (err, image) {
		if (err) throw err;
		console.log(image);
		console.log('buffer length: %d', image.byteLength);
		property.value = image;
	});
});
