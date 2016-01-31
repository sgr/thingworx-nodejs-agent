'use strict';

// Persists a reference to JS objects to prevent garbage collection.
var persistCache = {}

var persist = function (key, value) {
	if (persistCache.hasOwnProperty(key)) throw new Error('key already exists');
	persistCache[key] = value;
	return value;
}

var unpersist = function (key) {
	if (!(persistCache.hasOwnProperty(key))) throw new Error('key does not exist');
	persistCache[key] = undefined;
}

process.on('exit', function () {
	// keep a handle to the persistCache object and prevent garbage collection
	persistCache;
});

module.exports = {
	persist : persist,
	unpersist : unpersist
}