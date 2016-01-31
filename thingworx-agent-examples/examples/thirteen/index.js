var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing;
var InfoTable = require('thingworx-api').InfoTable;
var logger = require('thingworx-utils').Logger;
// Connection configuration
var config = require('../config.json');
// Configure Logger

// Initialize the API
var api = Api(config);

api.initialize();

// Create a Thing
var thing = new Thing('SteamSensorThing');

// List of properties implemented by the sensor
var properties = {
	temperature: 'number',
	temperature_limit: 'number',
	pressure: 'number',
	fault_status: 'boolean',
	inlet_valve: 'boolean',
	total_flow: 'integer',
	location: 'location'
};

// Add all sensor properties to the Thing
for (key in properties) {
	thing.addProperty({
		name: key,
		type: properties[key]
	});
}

// Add sensor services to the Thing
thing.addService({
	name: 'AddNumbers',
	desc: "Add's two numbers together",
	inputs: [
		{
			name: 'a',
			type: 'number'
		},
		{
			name: 'b',
			type: 'number'
		}
	],
	output_type: 'number',
	service_handler : function (params) {
		var a = params.getValue('a');
		var b = params.getValue('b');
		return a + b;
	}
});

thing.addService({
	name: 'GetSteamSensorReadings',
	desc: 'Returns a series of steam sensor readings in an info table',
	outputs: [{
			name: 'sensor_name',
			type: 'string'
		},
		{
			name: 'temperature',
			type: 'number'
		},
		{
			name: 'pressure',
			type: 'number'
		},
		{
			name: 'fault_status',
			type: 'boolean'
		},
		{
			name: 'inlet_valve',
			type: 'boolean'
		},
		{
			name: 'total_flow',
			type: 'integer'
		}],
	output_type: 'infotable',
	service_handler : function () {
		
		// Create a series of sensors with random values
		var sensors = {
			alpha: {
				sensor_name: 'sensor alpha',
				temperature: 100.0,
				pressure: 50.0,
				fault_status: false,
				inlet_valve: false,
				total_flow: 300
			},
			beta: {
				sensor_name: 'sensor beta',
				temperature: 50.0,
				fault_status: true,
				inlet_valve: false,
				total_flow: 1
			},
			gamma: {
				sensor_name: 'sensor gamma',
				pressure: 700.0,
				fault_status: true,
				inlet_valve: true,
				total_flow: -200
			}
		};
		
		// Create a datashape to represent a sensor
		var dataShape = [
			{
				name: 'sensor_name',
				type: 'string'
			},
			{
				name: 'temperature',
				type: 'number'
			},
			{
				name: 'pressure',
				type: 'number'
			},
			{
				name: 'fault_status',
				type: 'boolean'
			},
			{
				name: 'inlet_valve',
				type: 'boolean'
			},
			{
				name: 'total_flow',
				type: 'integer'
			}
		];
		
		// Create a new info table
		var it = new InfoTable(dataShape);
		
		// Add all sensor values to the infotable
		var count = 0
		for (var sensor in sensors) {
			for (var property in sensors[sensor]) {
				var s = sensors[sensor];
				var val = s[property]
				it.setValue(property, count, val);
			}
			count++;
		}
		
		return it;
	}
});

thing.addService({
	name: 'GetBigString',
	description: 'A very large string',
	output_type: 'string',
	service_handler: function () {
		var big_string = ''
		var str = 'inna gadda davia ';
		for (var i = 0; i < 500; i++) {
			big_string += str;
		}
		
		return big_string;
	}
});

thing.addService({
	name: 'Shutdown',
	description: 'Shuts the agent down',
	service_handler: function () {
		logger.info('Shutdown command received from the platform');
		logger.info('Shutting down in 5 seconds');
		
		setTimeout(function () {
			console.log('Shutting down');
			api.disconnect(function () {
				process.exit(0);
			});
		}, 5000);
	}
});

// Create a new event
thing.addEvent({
	name: 'SteamSensor.Fault',					
	description: '',
	inputs: {
		name: 'message',
		type: 'string'
	}
});


var dataCollectionTask = function () {
	
	// Return random data between within the range of min/max
	var getRandomData = function (min, max) {
		return Math.random() * (max - min) + min;
	}
	
	// Update all properties with random data
	thing.setProperty('total_flow', getRandomData(100, 500));
	thing.setProperty('pressure', 18 + getRandomData(0, 100));
	thing.setProperty('temperature', 400 + getRandomData(0, 100));
	
	var location = thing.getPropertyValue('location');
	location.latitude = getRandomData(0, 5);
	location.longitude = getRandomData(0, 5);
	location.elevation = 0;
	
	thing.setProperty('location', location);
	
	var tempLimit = thing.getPropertyValue('temperature_limit'); 
};

thing.bind();

api.connect();

setInterval(dataCollectionTask, 5000);
