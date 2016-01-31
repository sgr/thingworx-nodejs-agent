var Menu = require('terminal-menu');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');

var menu = Menu({ width: 40, x: 4, y: 2, bg: 'green'});
menu.reset();
menu.write('Thingworx NodeJS Agent Examples\n');
menu.write('-------------------------------\n');

menu.add('1)  Bare-Bones, Minimal Agent');
menu.add('2)  Basic Thing');
menu.add('3)  Basic Thing with Property');
menu.add('4)  Basic Thing with Property Change');
menu.add('5)  Basic Thing with Service');
menu.add('6)  Basic Thing with Event');
menu.add('7)  Basic Thing with Text Driver');
menu.add('8)  Basic Thing with Web Server');
menu.add('9)  Basic Thing with Dynamic Text Driver');
menu.add('10) Basic Thing with Command Driver');
menu.add('11) Basic Thing with OS Info');
menu.add('12) Basic Thing with XML Driver');
menu.add('13) Steam Sensor Demo');
menu.add('14) Multiple Things');
menu.add('15) Image Upload');
menu.add('16) Blob Upload');
menu.add('17) InfoTable Examples');
menu.add('EXIT');

menu.on('select', function (label) {	
	var cmdPath = undefined;
	var args = undefined;

	num = label.slice(0, 2).trim();
	switch (num) {
		case "1)":
			args = "examples/one/index.js"
			break;
		case "2)":
			args = "examples/two/index.js"
			break;
		case "3)":
			args = "examples/three/index.js"
			break;
		case "4)":
			args = "examples/four/index.js"
			break;
		case "5)":
			args = "examples/five/index.js"
			break;
		case "6)":
			args = "examples/six/index.js"
			break;
		case "7)":
			args = "examples/seven/index.js"
			break;
		case "8)":
			args = "examples/eight/index.js"
			break;
		case "9)":
			console.log('Example #9 is currently not working.  It will be updated soon.');
			//args = "examples/nine/index.js"
			break;
		case "10":
			console.log('Example #10 is currently not working.  It will be updated soon.');
			//args = "examples/ten/index.js"
			break;
		case "11":
			args = "examples/eleven/index.js"
			break;
		case "12":
			args = "examples/twelve/index.js"
			break;
		case "13":
			args = "examples/thirteen/index.js"
			break;
		case "14":
			args = "examples/fourteen/index.js"
			break;
		case "15":
			args = "examples/fifteen/index.js"
			break;
		case "16":
			args = "examples/sixteen/index.js"
			break;
		case "17":
			args = "examples/seventeen/index.js"
			break;
		default:
			// Assume exit was selected
			process.exit();
			break;
	}
	
	if (args == undefined) return;
	menu.reset();	
	menu.close();

	var nodeProcess = null;
	switch (os.platform()) {
		case 'linux':
		case 'darwin':
		case 'freebsd':
		case 'sunos':
			nodeProcess = 'node';
			break;
		case 'win32':
			nodeProcess = 'node.exe';
			break;
		default:
			throw new Error('Platform unsupported');
			break;
	}

	console.log('SELECTED: %s', label.slice(2).trim());
	var example = spawn(nodeProcess, [path.basename(args)], { cwd: path.dirname(path.join(__dirname, args))});
	example.stdout.pipe(process.stdout);
	example.stderr.pipe(process.stderr);

});
process.stdin.pipe(menu.createStream()).pipe(process.stdout);

process.stdin.setRawMode(true);
menu.on('close', function () {
	process.stdin.setRawMode(false);
	process.stdin.end();
});
