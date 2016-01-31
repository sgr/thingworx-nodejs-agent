'use strict';

var things = {};

var addThing = function (thing) {	
	if (things[thing] != undefined) throw new Error('Thing already added');
	var t = {}
	t.properties =  {};
	t.services =  {};
	t.events = {};

	things[thing] = t;
};

var addProperty = function (thing, property) {
	if (!property.hasOwnProperty('name')) throw new Error('property must have name property');
	var t = things[thing];
	if (t == undefined) throw new Error('thing does not exist');
	t.properties[property.name] = property;
};

var addService = function (thing, service) {
	if (!service.hasOwnProperty('name')) throw new Error('property must have name property');
	var t = things[thing];
	if (t == undefined) throw new Error('thing does not exist');
	t.services[service.name] = service;
};

var addEvent = function (thing, event) {
	if (!event.hasOwnProperty('name')) throw new Error('property must have name property');
	var t = things[thing];
	if (t == undefined) throw new Error('thing does not exist');
	t.events[event.name] = event;
};

var getThings = function () {
	return things;
};

var getThing = function (thing) {
	return things[thing];
}

var getProperties = function (thing) {
	return things[thing].properties;
}

var getProperty = function (thing, property) {
	return things[thing].properties[property];
}

var getServices = function (thing) {
	return things[thing].services;
}

var getService = function (thing, service) {
	return things[thing].services[service];
}

var getEvents = function (thing) {
	return things[thing].events;
}

var getEvent = function (thing, event) {
	return things[thing].events[event];
};

module.exports = {
	AddThing: addThing,
	AddProperty: addProperty,
	AddService: addService,
	AddEvent: addEvent,
	GetThings: getThings,
	GetThing: getThing,
	GetProperties: getProperties,
	GetProperty: getProperty,
	GetServices: getServices,
	GetService: getService,
	GetEvents: getEvents,
	GetEvent: getEvent
};
