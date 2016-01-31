var Adaptor = require('thingworx-driver').Adaptor;
var util = require('util');
var path = require('path');
var fs = require('fs');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

function XPathAdaptor(options) {
	Adaptor.call(this, options);
	
	this.services = [
		'searchFile'
	];
	
	this.events = [
		'search-hit'
	];
};

util.inherits(XPathAdaptor, Adaptor);

XPathAdaptor.prototype.startup = function (callback) {
	if (callback) callback();
};

XPathAdaptor.prototype.shutdown = function (callback) {
	
	if (callback) callback();
};

XPathAdaptor.prototype.searchFile = function (filename, p, callback) {
	var filepath = path.resolve(filename);
	var adaptor = this;
	
	fs.readFile(filepath, { encoding: 'utf8' }, function (err, xml) {
		var doc = new dom().parseFromString(xml);
		var node = xpath.select(p, doc);
		if (node) {
			var str = node.toString();
			setImmediate(function () {
				adaptor.emit('search-hit', [node, str]);
				if (callback) callback(node, str);
			});
		}
	});
};

module.exports = XPathAdaptor;