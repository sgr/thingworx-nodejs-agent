var util = require('util');
var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing;
var CommandDriver = require('thingworx-driver-experiments').CommandDriver;

console.log('Running Example #10: Command Driver');
// Connection configuration
var config = require('../config.json');
// Create a new API reference and pass in a settings structure
// connection
var api = new Api(config);

// Initailize the API
api.initialize();

// Create a new thing
var exampleThing = new Thing('DemoThing10');

// Create a new service to run commands
exampleThing.addService({
	name: 'runCommand',					// Service Name
	desc: 'Test Description',		    // Service Type
	inputs: [
		{
			name: 'command',			// name of the command - must be in PATH
			type: 'string'
		}
	],
	output_type: 'nothing',				// Output Type
	service_handler : function (params) {
		var cmd = params.getValue('command');
		var commandDriver = new CommandDriver();

		commandDriver.run(cmd, [], function () {
			this.on('complete', function (code, result) {
				console.log("Command '%s' completed with an exit code of %s", cmd, result);
			});
		});
		setImmediate(function () { commandDriver.start() });
	}
});

// Bind the thing
exampleThing.bind();

// Establish a connection to thingworx and invoke the callback
// when connected 
api.connect();

api.on('connect', function () {
	console.log('Connected to Thingworx');
});
