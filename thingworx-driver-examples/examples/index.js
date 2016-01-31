module.exports = {
	Drivers : {
		Text : require('./text/TextDriver.js'),
		XML : require('./xml/XMLDriver.js')
	},
	Adaptors : {
		Text : {
			TextSearch : require('./text/adaptors/TextSearchAdaptor.js'),
			RegexSearch: require('./text/adaptors/RegexSearchAdaptor.js'),
			PersistentTextSearch : require('./text/adaptors/PresistentTextSearchAdaptor.js'),
			PersistentRegexSearch : require('./text/adaptors/PersistentRegexSearchAdaptor.js')
		},
		XML : {
			XPath : require('./xml/adaptors/XPathAdaptor.js')
		},
		Device : {
			//Edison : require('./deviceAdaptors/EdisonAdaptor.js')
		}
	}
};
