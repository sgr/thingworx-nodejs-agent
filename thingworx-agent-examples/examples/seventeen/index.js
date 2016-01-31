// Example 17 - InfoTable Examples
var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing;
var InfoTable = require('thingworx-api').InfoTable;
var logger = require('thingworx-utils').Logger;
// Connection configuration
var config = require('../config.json');
// Initialize the API
var api = Api(config);

api.initialize();

// Create a new Thing called 'DemoThing17'
var thing = new Thing('DemoThing17');

// Add a new Property, an InfoTable called 'SingleInfoTable', to the thing
thing.addProperty({
	name: 'SingleInfoTable',
	type: 'InfoTable',
	value: new InfoTable([
		{ name: 'StringValue', type: 'String' }
	])
});

// Add a new Property, an InfoTable called 'NestedInfoTable', to the thing
thing.addProperty({
	name: 'NestedInfoTable',
	type: 'InfoTable'
});

// Bind the Thing
thing.bind();

// Create a new InfoTable that will hold two
// child InfoTables - InfoTableA and InfoTableB 
var nestedInfoTable = new InfoTable([
	{ name: 'InfoTableA', type: 'infoTable' },
	{ name: 'InfoTableB', type: 'infoTable' }
]);

// Create InfoTableA
var infoTableA = new InfoTable([
	{ name: 'Greeting', type: 'string'}
]);

// Create InfoTableB
var infoTableB = new InfoTable([
	{ name: 'Greeting', type: 'string'}
]);

// Give InfoTableA and InfoTableB some values
infoTableA.setValue('Hello');
infoTableB.setValue('World');

// Add InfoTableA and InfoTableB to the nestedInfoTable
nestedInfoTable.setValue('InfoTableA', infoTableA);
nestedInfoTable.setValue('InfoTableB', infoTableB);

api.connect(function () {
	
	// Set the value of SingleInfoTable
	var it = thing.getPropertyValue('SingleInfoTable');
	it.setValue('Test Value');
	thing.setProperty('SingleInfoTable', it);
	
	// Set the value of NestedInfoTable
	thing.setProperty('NestedInfoTable', nestedInfoTable);
});
