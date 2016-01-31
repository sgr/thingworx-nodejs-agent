/*var list = require('./examples/');
var Drivers = list.Drivers;
var Adaptors = list.Adaptors;
var util = require('util');

var filename = "D:\\Thingworx\\NodeJS\\thingworx-modules\\thingworx-driver-experiments\\examples\\example.txt"
var textDriver = new Drivers.Text({
	name: 'TextDriver',
	thing: 'ExampleThing',
	adaptor: new Adaptors.Text.PersistentRegexSearch(),
});

textDriver.monitorFile(filename, 'searchString');
textDriver.on('search-hit', function (token, line) {
	console.log('token: %s, line: %s', token, line);
	
});


filename = "D:\\Thingworx\\NodeJS\\thingworx-modules\\thingworx-driver-experiments\\examples\\example.xml"
var xmlDriver = new Drivers.XML({
	name: 'XMLDriver',
	thing: 'ExampleThing',
	adaptor: new Adaptors.XML.XPath(),
});

xmlDriver.monitorFile(filename, '/bookstore/book/title');
xmlDriver.on('search-hit', function (node, str) {
	console.log('node: %s, str: %s', node, str);
}); */

module.exports = require('./examples');