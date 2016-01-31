console.log('Running Example #6: minimal agent w/ text search driver');

var os = require('os');
var util = require('util');

// Thingworx API interface
var Api = require('thingworx-api').Api;
// Thingworx Thing API interface
var Thing = require('thingworx-api').Thing
// Connection information
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('DemoThing11');

// Add a new properties to exampleThing
exampleThing.addProperty({
	name: 'CPU',
	description: 'CPU Load Average',
	type: 'string'
});

exampleThing.addProperty({
	name: 'Memory',
	description: 'Memory Load',
	type: 'string'
});

exampleThing.addProperty({
	name: 'OS',
	description: 'Operating System Type',
	type: 'string'
});

exampleThing.addProperty({
	name: 'Platform',
	description: 'Platform Type',
	type: 'string'
});

exampleThing.addProperty({
	name: 'Arch',
	description: 'OS Architecture',
	type: 'string'
});

exampleThing.addProperty({
	name: 'Uptime',
	description: 'System uptime',
	type: 'string'
});

// Bind the thing
exampleThing.bind();

exampleThing.on('property-change', function (property) {
	console.log("Caught 'property-change' event - %j", property);
});

// Establish a connection to thingworx and invoke the callback
// when connected 
api.connect();

api.on('connect', function () {
	console.log("Connected to Thingworx with Thing '%s'", exampleThing.name);
	
	exampleThing.setProperty('Platform', os.platform());
	exampleThing.setProperty('Arch', os.arch());
	exampleThing.setProperty('OS', os.type());
	
	setInterval(function () {
		
		var uptimeString = util.format('Up %d minutes', parseInt(os.uptime() / 60));
		
		var load = os.loadavg();
		var loadString = util.format("1 Min: %s%, 5 Min: %s%, 15 Min: %s%",
			Math.floor(load[0] * 100),
			Math.floor(load[1] * 100),
			Math.floor(load[2] * 100));
				
		var memString = util.format("Free Memory: %s gb, Used Memory: %s gb, Total Memory: %s gb", 
			Math.ceil(os.freemem() / 1073741824),
			Math.floor((os.totalmem() - os.freemem()) / 1073741824),
			Math.ceil(os.totalmem() / 1073741824));
		
		exampleThing.setProperty('CPU', loadString);
		exampleThing.setProperty('Memory', memString);
		exampleThing.setProperty('Uptime', uptimeString);

	}, 2000);
});
