var Api = require('thingworx-api').Api;			// Thingworx API
var Thing = require('thingworx-api').Thing		// Thingworx Virtual Thing
var logger = require('thingworx-utils').Logger;	// Thingworx Logging Utility
var io;

var init = function (io) {
	io = io;
	// Capture all data emitted by the logger and send it as a mesasage to the
	// web browser via socket.io after a slight delay.
	logger.on('data', function (level, timestamp, message) {
		setTimeout(function () {
			io.emit('message', { level: level, timestamp: timestamp, message: message });
		}, 100);
	});
};

var run = function () {

	// Create a new API object
	var api = new Api({
		connection: {
			host: '127.0.0.1',
			port: '8080',
			app_key: 'b84b67c9-55c7-4ae9-8d5b-6d29c98f749d'
		},
		tls: {
			encryption : false
		}
	});
	
	// Initailize the API
	api.initialize();
	
	// Create a new thing called 'DemoThing8'
	var thing = new Thing('DemoThing8');
	
	// Add a new property to the Thing
	thing.addProperty({
		name: 'TestProperty',
		type: 'string'
	});
	
	// Bind the thing
	thing.bind();
	
	// Lisent for changes in value in the 'TestProperty' property
	thing.getProperty('TestProperty').on('change', function (property) {
		logger.info('Property Change! name: %s, new value : %s, old value: %s', 
			property.name, property.value, property.oldValue);
	});
	
	// Connect to Thingworx
	api.connect();
	
	// When connected to Thingworx, log a message to the console
	api.on('connect', function () {
		logger.info('Connected to Thingworx!');
		
		// Every two seconds change the value of 'TestProperty' to the current time
		setInterval(function () {
			thing.setProperty('TestProperty', new Date().getTime().toString());
		}, 2000);
	});
};

module.exports = {
	init: init,
	run: run
};