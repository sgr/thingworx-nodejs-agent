var ffi = require('ffi');
var ref = require('ref');
var path = require('path');
var types = require('./types.js');
var debug = require('debug')('thingworx-ffi');

var errorCodes = types.Errors;

// Shared library should always be placed in a 'bin' folder in the root of the node module
var dllPath = path.join(__dirname, "../../bin/");

/**
 * libcJSON bindings
 * @type {ffi.Library}
 */
var libcJSON = ffi.Library(dllPath + 'twApi', {
	"cJSON_Delete" : ["void", [ref.refType(types.cJSON)]],
	"cJSON_Print"  : ["string", [ref.refType(types.cJSON)]],
	"cJSON_Parse"  : [ref.refType(types.cJSON), ["string"]]
});


/**
 * Thingworx C SDK bindings
 * @type {ffi.Library}
 */
var libtwx = ffi.Library(dllPath + 'twApi', {
	// twApi function calls
	"twApi_GetVersion" : ["string", []],
	"twApi_Initialize" : ["int", ["string", "uint16", "string", "string", "string", "uint32", "uint16", "char"]],
	"twApi_Delete"     : ["int", []],
	"twApi_Connect"    : ["int", ["uint32", "int32"]],
	"twApi_Disconnect" : ["int", ["string"]],
	"twApi_isConnected": ["char", []],
	"twApi_BindThing"  : ["int", ["string"]],
	"twApi_UnbindThing": ["int", ["string"]],
	"twApi_RegisterProperty" : ["int", ["int", "string", "string", "int", "string", "string", "double", "void *", "void *"]],
	"twApi_ReadProperty" : ["int", ["int", "string", "string", "void **", "int32", "char"]],
	"twApi_WriteProperty" : ["int", ["int", "string", "string", "void *", "int32", "char"]],
	"twApi_PushProperties" : ["int", ["int", "string", ref.refType(types.list), "int32", "char"]],
	"twApi_RegisterOnAuthenticatedCallback" : ["int", ["void *", "void *"]],
	"twApi_UnregisterOnAuthenticatedCallback" : ["int", ["void *", "void *"]],
	"twApi_RegisterBindEventCallback" : ["int", ["string", "void *", "void *"]],
	"twApi_UnregisterBindEventCallback" : ["int", ["string", "void *", "void *"]],
	"twApi_RegisterPropertyCallback" : ["int", ["int", "string", "string", "void *", "void *"]],
	"twApi_UnregisterPropertyCallback" : ["int", ["string", "string", "void *"]],
	"twApi_RegisterService" : ["int", ["int", "string", "string", "string", ref.refType(types.dataShape), "int", ref.refType(types.dataShape), "void *", "void *"]],
	"twApi_UnregisterServiceCallback" : ["int", ["string", "string", "void *"]],
	"twApi_RegisterEvent" : ["int", ["int", "string", "string", "string", ref.refType(types.dataShape)]],
	"twApi_FireEvent" : ["int", ["int", "string", "string", ref.refType(types.infoTable), "int32", "char"]],
	"twApi_TaskerFunction" : ["void", [types.DATETIME, "void *"]],
	"twApi_SetOfflineMsgStoreDir" : ["int", ["string"]],
	"twApi_RegisterConnectCallback" : ["int", ["void *"]],
	"twApi_RegisterCloseCallback" : ["int", ["void *"]],
	"twApi_RegisterPingCallback" : ["int", ["void *"]],
	"twApi_RegisterPongCallback" : ["int", ["void *"]],
	"twApi_CreatePropertyList" : [ref.refType(types.list), ["string", ref.refType(types.primitive), types.DATETIME]],
	"twApi_AddPropertyToList" : ["int", [ref.refType(types.list), 'string', ref.refType(types.primitive), types.DATETIME]],
	"twApi_DeletePropertyList" : ["int", [ref.refType(types.list)]],
    // twApi TLS function calls
    "twApi_SetSelfSignedOk" : ["void", []],
    "twApi_EnableFipsMode" : ["int", []],
	"twApi_DisableEncryption" : ["void", []],
	"twApi_DisableCertValidation" : ["void", []],
    "twApi_LoadCACert" : ["int", ["string", "int"]],
    "twApi_LoadClientCert" : ["int", ["string"]],
    "twApi_SetClientKey" : ["int", ["string", "string", "int"]],
    "twApi_SetX509Fields" : ["int", ["string", "string", "string", "string", "string", "string"]],
	// twLogger function calls
	"twLogger_SetLevel" : ["int", ["int"]],
	"twLogger_SetIsVerbose" : ["int", ["char"]],
	"twLogger_SetFunction" : ["int", ["void *"]],
	"twLog" : ["void", ["int", "string"]],
	// twList function calls
	"twList_GetByIndex" : [ref.refType(types.listEntry), [ref.refType(types.list), "int"]],
	"twList_GetCount" : ["int", [ref.refType(types.list)]],
	"twList_Next" : [ref.refType(types.listEntry), [ref.refType(types.list), ref.refType(types.list)]],
	"twList_ReplaceValue" : ["int", [ref.refType(types.listEntry), ref.refType(types.list), "void *", ref.types.char]],
	// twDataShape function calls
	"twDataShape_Create" : [ref.refType(types.dataShape), [ref.refType(types.dataShapeEntry)]],
	"twDataShape_Delete" : ["void", ["void *"]],
	"twDataShape_GetLength" : ["uint32", [ref.refType(types.dataShape)]],
	"twDataShape_AddEntry" : ["int", [ref.refType(types.dataShape), ref.refType(types.dataShapeEntry)]],
	"twDataShape_GetEntryIndex" : ["int", [ref.refType(types.dataShape), "string", ref.refType(ref.types.int)]],
	"twDataShape_ToJson" : [ref.refType(types.cJSON), [ref.refType(types.dataShape), ref.refType(types.cJSON)]],
	"twDataShape_SetName" : ["int", [ref.refType(types.dataShape), 'string']],
	"twDataShapeEntry_ToJson" : [ref.refType(types.cJSON), [ref.refType(types.dataShapeEntry), "string", ref.refType(types.cJSON)]],
	"twDataShapeEntry_Create" : [ref.refType(types.dataShapeEntry), ["string", "string", "int"]],
	"twDataShapeEntry_Delete" : ["void", ["void *"]],
	"twDataShapeEntry_GetLength" : ["uint32", [ref.refType(types.dataShapeEntry)]],
	// twInfoTable function calls
	"twInfoTable_Create" : [ref.refType(types.infoTable), [ref.refType(types.dataShape)]],
	"twInfoTable_CreateFromStream" : ["void *", ["void *"]],
	"twInfoTable_Delete" : ["void", ["void *"]],
	"twInfoTable_FullCopy" : [ref.refType(types.infoTable), [ref.refType(types.infoTable)]],
	"twInfoTable_ZeroCopy" : [ref.refType(types.infoTable), [ref.refType(types.infoTable)]],
	"twInfoTable_Compare"  : ["int", [ref.refType(types.infoTable), ref.refType(types.infoTable)]],
	"twInfoTable_CreateFromPrimitive" : [ref.refType(types.infoTable), ["string", "void *"]],
	"twInfoTable_CreateFromString" : [ref.refType(types.infoTable), ["string", "string", "char"]],
	"twInfoTable_CreateFromNumber" : [ref.refType(types.infoTable), ["string", "double"]],
	"twInfoTable_CreateFromInteger" : [ref.refType(types.infoTable), ["string", "int32"]],
	"twInfoTable_CreateFromLocation" : [ref.refType(types.infoTable), ["string", ref.refType(types.location)]],
	"twInfoTable_CreateFromBlob" : [ref.refType(types.infoTable), ["string", "string", "int32", "char", "char"]],
	"twInfoTable_CreateFromDatetime" : [ref.refType(types.infoTable), ["string", types.DATETIME]],
	"twInfoTable_CreateFromBoolean" : [ref.refType(types.infoTable), ["string", "char"]],
	"twInfoTable_CreateFromJson" : [ref.refType(types.infoTable) , [ref.refType(types.cJSON), "string"]],
	"twInfoTable_GetString" : ["int", [ref.refType(types.infoTable), "string", "int32", ref.refType(ref.types.CString)]],
	"twInfoTable_GetNumber" : ["int", [ref.refType(types.infoTable), "string", "int32", "double *"]],
	"twInfoTable_GetInteger" : ["int", [ref.refType(types.infoTable), "string", "int32", "int32 *"]],
	"twInfoTable_GetLocation" : ["int", [ref.refType(types.infoTable), "string", "int32", ref.refType(types.location)]],
	"twInfoTable_GetBlob" : ["int", [ref.refType(types.infoTable), "string", "int32", ref.refType(ref.types.CString) , "int32 *"]],
	"twInfoTable_GetDatetime" : ["int", [ref.refType(types.infoTable), "string", "int32" , ref.refType(types.DATETIME)]],
	"twInfoTable_GetBoolean" : ["int", [ref.refType(types.infoTable), "string", "int32", ref.refType(ref.types.char)]],
	"twInfoTable_GetPrimitive" : ["int", [ref.refType(types.infoTable), "string", "int32", ref.refType(ref.refType(types.primitive))]],
	"twInfoTable_ToJson" : [ref.refType(types.cJSON), ["void *"]],
	"twInfoTable_AddRow" : ["int", [ref.refType(types.infoTable), ref.refType(types.infoTableRow)]],
	"twInfoTable_GetEntry" : [ref.refType(types.infoTableRow), [ref.refType(types.infoTable), "int"]],
	"twInfoTableRow_GetEntry" : [ref.refType(types.primitive), [ref.refType(types.infoTableRow), "int"]],
	"twInfoTableRow_Create" : [ref.refType(types.infoTableRow), [ref.refType(types.primitive)]],
	"twInfoTableRow_AddEntry" : ["int", [ref.refType(types.infoTableRow), ref.refType(types.primitive)]],
	"twInfoTableRow_Delete" : ["void", ["void *"]],
	// twPrimitive function calls
	"twPrimitive_Create" : [ref.refType(types.primitive), []],
	"twPrimitive_CreateFromStream" : [ref.refType(types.primitive), [ref.refType(types.stream)]],
	"twPrimitive_Delete" : ["void", ["void *"]],
	"twPrimitive_Compare" : ["int", [ref.refType(types.primitive), ref.refType(types.primitive)]],
	"twPrimitive_IsTrue" : ["char", [ref.refType(types.primitive)]],
	"twPrimitive_CreateFromLocation" : [ref.refType(types.primitive), [ref.refType(types.location)]],
	"twPrimitive_CreateFromNumber" : [ref.refType(types.primitive), ["double"]],
	"twPrimitive_CreateFromInteger" : [ref.refType(types.primitive), ["int32"]],
	"twPrimitive_CreateFromDatetime" : [ref.refType(types.primitive), [types.DATETIME]],
	"twPrimitive_CreateFromBoolean" : [ref.refType(types.primitive), ["char"]],
	"twPrimitive_CreateFromInfoTable" : [ref.refType(types.primitive), ["void *"]],
	"twPrimitive_CreateVariant" : [ref.refType(types.primitive), [ref.refType(types.primitive)]],
	"twPrimitive_CreateFromString": [ref.refType(types.primitive), ["string", "char"]],
	"twPrimitive_CreateFromBlob" : [ref.refType(types.primitive), ["string", "int32", "char", "char"]],
	"twPrimitive_CreateFromVariable" : [ref.refType(types.primitive), ["string", "int", "char", "uint32"]],
	"twPrimitive_CreateFromJson" : [ref.refType(types.primitive), [ref.refType(types.cJSON), "string", "int"]],
	"twPrimitive_ToJson" : [ref.refType(types.cJSON), ["string", "void *", ref.refType(types.cJSON)]],
	"twPrimitive_ZeroCopy" : [ref.refType(types.primitive), [ref.refType(types.primitive)]],
	"twPrimitive_FullCopy" : [ref.refType(types.primitive), [ref.refType(types.primitive)]],
	// Utility function calls
	"twMessageHandler_msgHandlerTask" : ["void", [types.DATETIME , "void *"]],
	"twSleepMsec" : ["void", ["int"]],
	"baseTypeToString" : ['string', ['int']],
	"baseTypeFromString" : ['int', ['string']]
});

module.exports.libtwx = libtwx;
module.exports.libcJSON = libcJSON;
