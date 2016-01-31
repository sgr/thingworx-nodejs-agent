// Example #8 - Thing with Web Server 
var app = require('express')();				// Express framework
var http = require('http').Server(app);		// Node HTTP Server
var io = require('socket.io')(http);		// Socket.io Transport
var agent = require('./agent.js');			// Agent-related functionality

// Listen for requests on the root of the URI and send
// index.html to anyone who connects 
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// When a connection is establied to socket.io, run the
// code below
io.on('connection', function (socket) {
	console.log('browser connected');
	
	// When we receive a 'run agent' message from the browser,
	// run the agent
	socket.on('run agent', function () {
		agent.run();
	});
	
	// When we receive a 'disconnct' message from the browser,
	// log it to the console.
	socket.on('disconnect', function () {
		console.log('browser disconnected');
	});
});

// intialize the agent
agent.init(io);

// Listen for connections on port http://localhost:3000
http.listen(3000, function () {
	console.log('Go to http://localhost:3000 in your web browser.');
});

