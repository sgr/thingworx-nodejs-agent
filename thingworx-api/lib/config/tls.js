var libtwx = require('thingworx-ffi').LibTWX;

var setEncryption = function (enabled) {
	if (typeof enabled != 'boolean') throw new Error('argument must be boolean');
	switch (enabled) {
		case true:
			break;
		case false:
			libtwx.twApi_DisableEncryption();
			break;
	}
}

var setFipsMode = function (enabled) {
	if (typeof enabled != 'boolean') throw new Error('argument must be boolean');
	switch (enabled) {
		case true:
			libtwx.twApi_EnableFipsMode();
			break;
		case false:
			break;
	}
};

var setCertificationValidation = function (enabled) {
	if (typeof enabled != 'boolean') throw new Error('argument must be boolean');
	switch (enabled) {
		case true:
			break;
		case false:
			libtwx.twApi_DisableCertValidation();
			break;
	}
}

var setAllowSelfSignedCertificates = function (enabled) {
	if (typeof enabled != 'boolean') throw new Error('argument must be boolean');
	switch (enabled) {
		case true:
			libtwx.twApi_SetSelfSignedOk();
			break;
		case false:
			break;
	}
}

var setCACertificate = function (path, type) {
	if (typeof path != 'string') throw new Error('first argument must be string');
	if (type && typeof type != 'number') throw new Error('second argument must be number');
	type = type || 0;
	
	libtwx.twApi_LoadCACert(path, type);
}

var setClientCertificate = function (path) {
	if (typeof path != 'string') throw new Error('argument must be string');
	
	libtwx.twApi_LoadClientCert(path);
}

var setClientKey = function (file, passphrase, type) {
	if (typeof file != 'string') throw new Error('first argument must be string');
	if (typeof passphrase != 'string') throw new Error('second argument must be string');
	if (type && typeof type != 'number') throw new Error('thrid argument must be number');
	
	type = type || 0;
	libtwx.twApi_SetClientKey(file, passphrase, type);
}

module.exports = {
	SetEncryption: setEncryption,
	SetFipsMode: setFipsMode,
	SetCertificationValidation: setCertificationValidation,
	SetAllowSelfSignedCertificates: setAllowSelfSignedCertificates,
	SetCACertificate: setCACertificate,
	SetClientCertificate: setClientCertificate,
	SetClientKey: setClientKey
}