console.log('\
\nRequirements to run this script i.e. setup-examples.js: \
\n  Refer: https://bitbucket.org/thingworx-ondemand/thingworx-nodejs-agent/overview \
\n  Install Node.js \
\n  Install Python \
\n  Download ThingWorx NodeJs Agent source \
\n  Open a command shell and cd to ...thingworx-nodejs-agent/thingworx-agent-examples \
\n  Run the following command: npm run setup-examples \
\n \
\nSetting up ThingWorx NodeJs Agent Examples. \
')

// ShellJS is a portable (Windows/Linux/OS X) implementation of Unix shell commands.
var shell = require('shelljs')
var os = require('os')
var path = require('path');

// Shared library needs to be placed in a 'bin' folder in the root of the node module
if (shell.test('-d', path.normalize('./bin'))) {
	console.log('Directory ./bin for the ThingWorx shared library already exists.')
} else {
	console.log('Making a directory ./bin for the ThingWorx shared library.')
	shell.mkdir(path.normalize('./bin'))
}

var errStr = ''
var twxLibName = ''
var twxLibPath = ''
var osType = os.type()
var osPlatform = os.platform()
var osArch = os.arch()
console.log('OS Type: ' + osType + ', OS Platform: ' + osPlatform + ', OS Arch: ' + osArch)

switch (osPlatform) {
	case 'win32':
		switch (osArch) {
			case 'x86':
				twxLibName = 'twApi.dll'
				twxLibPath = path.normalize('../binaries/win32/release')
				break
			case 'x64':
				twxLibName = 'twApi.dll'
				twxLibPath = path.normalize('../binaries/win32-x64/release')
				break
			default:
				errStr = 'Unsupported OS architecture ' + osArch
				break
		}
		break
	case 'linux':
		switch (osArch) {
			case 'arm':
				// Architecture: ARMv6. Core bit width: 32
				twxLibName = 'twApi.so'
				twxLibPath = path.normalize('../binaries/gcc-linux-armv6/release');
				break
			default:
				errStr = 'Unsupported OS architecture ' + osArch
				break
		}
		break
	default:
		errStr = 'Unsupported OS platform ' + osPlatform
		break
}
if (twxLibName === '' || twxLibPath === '') {
	console.log(errStr)
	throw new Error(errStr)
}
console.log('ThingWorx shared lib name: ' + twxLibName)
console.log('ThingWorx shared lib path: ' + twxLibPath)

var twxLib = path.join(twxLibPath, twxLibName);
if (!shell.test('-f', twxLib)) {
	errStr = 'ThingWorks shared lib not found at ' + twxLib
	console.log(errStr)
	throw new Error(errStr)
}

if (shell.test('-f', path.join(path.normalize('./bin/'), twxLibName))) {
	console.log('Overwiting existing the ThingWorx shared library.\n')
} else {
	console.log('Copying the ThingWorx shared library into ./bin.\n')
}
shell.cp('-f', path.join(twxLibPath, twxLibName), path.normalize('./bin'));

var ret

console.log('\nInstalling ThingWorx dependencies (NodeJs packages) from local source.\n')

console.log('\nInstalling thingworx-ffi.\n')
var p = path.normalize('../thingworx-ffi');
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-ffi.')
}

console.log('\nInstalling thingworx-utils.\n')
p = path.normalize('../thingworx-utils');
console.log(p);
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-utils.')
}

console.log('\nInstalling thingworx-core.\n')
p = path.normalize('../thingworx-core');
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-core.')
}

console.log('\nInstalling thingworx-api.\n')
p = path.normalize('../thingworx-api');
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-api.')
}

console.log('\nInstalling thingworx-driver.\n')
p = path.normalize('../thingworx-driver');
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-driver.')
}

console.log('\nInstalling thingworx-driver-examples.\n')
p = path.normalize('../thingworx-driver-examples');
ret = shell.exec('npm install ' + p)
if (ret.code != 0) {
	throw new Error('Failed to npm install ../thingworx-driver-examples.')
}

console.log('\nInstalling all other dependencies from npmjs.org.\n')
ret = shell.exec('npm install')
if (ret.code != 0) {
	throw new Error('Failed to npm install all other dependencies from npmjs.org.')
}

console.log('\nRunning dedupe to flatten modules.\n')
ret = shell.exec('npm dedupe')
if (ret.code != 0) {
	throw new Error('Failed to npm install all other dependencies from npmjs.org.')
}

console.log('\nSanity check - trying to load Thingworx C SDK...')
var libtwx = require('thingworx-ffi').LibTWX
try {
	var version = libtwx.twApi_GetVersion()
	console.log('Loading Successful!  Using ThingWorx C SDK version: ' + version)
} catch (e) {
	errStr = 'Unable to load the ThinWorx FFI. ' + e
	console.log(errStr)
	throw new Error(errStr)
}

console.log('\nCompleted setting up ThingWorx NodeJs Agent Examples.')
console.log('\nExecute "node app.js" to run the agent examples.')
