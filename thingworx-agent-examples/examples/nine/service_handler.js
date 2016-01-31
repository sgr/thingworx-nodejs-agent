var Api = require('thingworx-api').Api;
var Thing = require('thingworx-api').Thing;
var TextDriver = require('thingworx-driver-experiments').TextDriver;
var path = require('path');
var util = require('util');

var drivers = {}
function addTextSearchTask(params) {
	
	var fileName = params.getValue('filename');
	var taskName = params.getValue('name');
	
	console.log('Task \'%s\' for file %s added', taskName, fileName);
	
	var p = path.join(__dirname, fileName);
	
	// Create a new Text Search Driver
	var textSearcher = new TextDriver(p);
	console.log('File path = %s', p);
	drivers[taskName] = textSearcher;
};

var addPropertyWatcher = function (params) {
	console.log('Add Property Watcher Service Invoked');
	
	var taskName = params.getValue('taskName');
	var driver = drivers[taskName];
	if (!driver) throw new Error('Task does not exist');
	
	var keyword = params.getValue('keyword');
	
	var prop = params.getValue('property');
	var desc = params.getValue('propertyDescription');
	var type = params.getValue('propertyType');
	
	var funcBody = params.getValue('parserFunction');
	var func = new Function(['token', 'line'], funcBody);
		
	var thing = Thing.Get(this.thing);

	var funcWrapper = function (token, line) {
		var value = func(token, line);
		thing.setProperty(prop, value);
		console.log('Property Watcher picked up change for %s: %s', prop, value);
	}
	
	console.log('Incoming paramters:\n\tProperty:%s\n\tDesc:%s\n\tType:%s\n\tKeyword:%s\n\tTask:%s\n\tFunc:%s\n\t',
		prop, desc, type, keyword, taskName, func.toString());
	
	
	driver.stop();
	
	console.log('registering for unbind callback');
	thing.once('unbind', function () {
		console.log('running unbind callback');
		console.log('getting thing');
		thing = Thing.Get(thing.name);
		console.log('setting property');
		thing.addProperty({ name: prop, description: desc, type: type });
		console.log('registering for bind callback');
		thing.once('bind', function () {
			console.log('running bind callback');
			thing = Thing.Get(thing.name); 
			setTimeout(function () {
				driver.find(keyword, funcWrapper);
				driver.start();
			}, 100);
		});
		thing.bind();
	});
	
	console.log('unbinding');
	thing.unbind();
};

module.exports = {
	addPropertyWatcher: addPropertyWatcher,
	addTextSearchTask: addTextSearchTask
};