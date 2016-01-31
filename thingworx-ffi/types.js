var Ref = require('ref');
var FFI = require('ffi');
var Struct = require('ref-struct');
var Union = require('ref-union');

var debug = require('debug')('thingworx-ffi');

// struct 'cJSON'
var struct_cJSON = Struct({
	// next, prev, and child are of type struct cJSON *
	'next' : Ref.refType(Ref.types.void),
	'prev' : Ref.refType(Ref.types.void),
	'child': Ref.refType(Ref.types.void),
	'type' : Ref.types.int,
	'valueString' : Ref.types.CString,
	'valueInt' : Ref.types.int,
	'valueDouble' : Ref.types.double,
	'string' : Ref.types.CString
});

// struct 'bytes'
var struct_bytes = Struct({
	'data' : Ref.refType(Ref.types.char),
	'len'  : Ref.types.int32
});

// DATETIME type
var type_datetime = Ref.types.uint64;

// struct 'twLocation'
var struct_location = Struct({
	'latitude'  : Ref.types.double,
	'longitude' : Ref.types.double,
	'elevation' : Ref.types.double
});

// struct 'twStream'
var struct_stream = Struct({
	'data'      : Ref.refType(Ref.types.char),
	'ptr'       : Ref.refType(Ref.types.char),
	'length'    : Ref.types.uint32,
	'maxLength' : Ref.types.uint32,
	'ownsData'  : Ref.types.char
});

//////////////////////// twList ////////////////////////////

// struct 'ListEntry'
var struct_ListEntry = Struct({
	'next'  : Ref.refType(Ref.types.void),  // ListEntry *
	'prev'  : Ref.refType(Ref.types.void),  // ListEntry *
	'value' : Ref.refType(Ref.types.void)   // void *
});

// struct 'twList'
var struct_twList = Struct({
	'count' : Ref.types.int,                        // int
	'first' : Ref.refType(struct_ListEntry),        // ListEntry *
	'last'  : Ref.refType(struct_ListEntry),        // ListEntry *
	'mtx'   : Ref.refType(Ref.types.void),          // void *
	'del_func' : FFI.Function('void', ['void *'])   // void (*del_func)(void *)
});

//////////////////// twDataShape //////////////////////////

// struct 'twDatsShapeAspect'
var struct_twDataShapeAspect = Struct({
	'name'  : Ref.types.CString,             // char *
	'value' : Ref.refType(Ref.types.void)    // twPrimitive *
});

// struct 'twDataShapeEntry'
var struct_twDataShapeEntry = Struct({
	'name'    : Ref.types.CString,
	'desc'    : Ref.types.CString,
	'type'    : Ref.types.int,
	'aspects' : Ref.refType(struct_twList)
});

// struct 'twDataShape' 
var struct_twDataShape = Struct({
	'numEntries' : Ref.types.int,
	'entries'    : Ref.refType(struct_twList),
	'name'       : Ref.types.CString
});

//////////////////// twInfoTable //////////////////////////

// struct 'twInfoTableRow'
var struct_twInfoTableRow = Struct({
	'num'     : Ref.types.int,
	'entries' : Ref.refType(struct_twList)
});

// struct 'twInfoTable'
var struct_twInfoTable = Struct({
	'dataShape' : Ref.refType(struct_twDataShape),
	'rows'      : Ref.refType(struct_twList),
	'length'    : Ref.types.uint32,
	'mtx'       : Ref.refType(Ref.types.void)
});

////////////////////// twPrimitive /////////////////////////
var union_primVal = Union({
	'integer'   : Ref.types.int32,
	'number'    : Ref.types.double,
	'datetime'  : type_datetime,
	'location'  : struct_location,
	'boolean'   : Ref.types.char,
	'bytes'     : struct_bytes,
	'infotable' : Ref.refType(struct_twInfoTable),
	'variant'   : Ref.refType(Ref.types.void)   // twPrimitive *
});

var struct_twPrimitive = Struct({
	'type'      : Ref.types.int,
	'typeFamily': Ref.types.int,
	'length'    : Ref.types.uint32,
	'val'       : union_primVal
});

//////////////////// twProperty //////////////////////////

// struct 'twPropertyDef'
var struct_twPropertyDef = Struct({
	'name'          : Ref.types.CString,
	'desc'          : Ref.types.CString,
	'type'          : Ref.types.int,
	'aspects'       : Ref.refType(struct_cJSON)
});

// struct 'twProperty'
var struct_twProperty = Struct({
	'name'          : Ref.types.CString,
	'value'         : Ref.refType(Ref.types.void),
	'timestamp'     : type_datetime,
	'quality'       : Ref.types.CString
});

// struct 'twServiceDef'
var struct_twServiceDef = Struct({
	'name'              : Ref.types.CString,
	'desc'              : Ref.types.CString,
	'inputs'            : Ref.refType(struct_twDataShape),
	'outputType'        : Ref.types.int,
	'outputDataShape'   : Ref.refType(struct_twDataShape)
});

// Exported types
var types = module.exports = {};
types.location = struct_location;               // struct twLocation
types.stream = struct_stream;                   // struct twStream
types.cJSON = struct_cJSON;                     // struct cJSON
types.list = struct_twList;                     // struct twList
types.listEntry = struct_ListEntry;             // struct ListEntry
types.DATETIME = type_datetime;                 // DATETIME
types.dateTime = types.DATETIME                 // 
types.infoTable = struct_twInfoTable;           // struct twInfoTable
types.infoTableRow = struct_twInfoTableRow;     // struct twInfoTableRow
types.dataShape = struct_twDataShape;           // struct twData
types.dataShapeEntry = struct_twDataShapeEntry; // struct twDataShapeEntry
types.dataShapeAspect = struct_twDataShapeAspect; // struct twDataShapeAspect
types.propertyDef = struct_twPropertyDef;
types.property = struct_twProperty;
types.serviceDef = struct_twServiceDef;
types.primitive = struct_twPrimitive;           // struct twPrimtive
types.primitiveValue = union_primVal;           // union value used in twPrimitive


// TW_UPDATE enum
types.Update = {}
types.Update.Always = 0;
types.Update.Never = 1;
types.Update.Value = 2;
types.Update.On = 3;
types.Update.Off = 4;

// LogLevel enum
types.LogLevel = {}
types.LogLevel.Trace = 0;
types.LogLevel.Debug = 1;
types.LogLevel.Info = 2;
types.LogLevel.Warn = 3;
types.LogLevel.Error = 4;
types.LogLevel.Force = 5;
types.LogLevel.Audit = 6;

// Alias
types.DataChangeType = types.Update;

// BaseType enum
types.BaseType = {};
types.BaseType.Nothing = -1;
types.BaseType.String = 0;
types.BaseType.Number = 1;
types.BaseType.Boolean = 2;
types.BaseType.DateTime = 3;
types.BaseType.Timespan = 4;
types.BaseType.InfoTable = 5;
types.BaseType.Location = 6;
types.BaseType.XML = 7;
types.BaseType.JSON = 8;
types.BaseType.Query = 9;
types.BaseType.Image = 10;
types.BaseType.Hyperlink = 11;
types.BaseType.Imagelink = 12;
types.BaseType.Password = 13;
types.BaseType.HTML = 14;
types.BaseType.Text = 15;
types.BaseType.Tags = 16;
types.BaseType.Schedule = 17;
types.BaseType.Variant = 18;
types.BaseType.GUID = 20;
types.BaseType.Blob = 21;
types.BaseType.Integer = 22;
types.BaseType.PropertyName = 50;
types.BaseType.ServiceName = 51;
types.BaseType.EventName = 52;
types.BaseType.ThingName = 100;
types.BaseType.ThingShapeName = 101;
types.BaseType.ThingTemplateName = 102;
types.BaseType.DataShapeName = 104;
types.BaseType.MashupName = 105;
types.BaseType.MenuName = 106;
types.BaseType.BaseTypeName = 107;
types.BaseType.UserName = 108;
types.BaseType.GroupName = 109;
types.BaseType.CategoryName = 110;
types.BaseType.StateDefinitionName = 111;
types.BaseType.StyleDefinition = 112;
types.BaseType.ModleTagVocabularyName = 113;
types.BaseType.DataTagVocabularyName = 114;
types.BaseType.NetworkName = 115;
types.BaseType.MediaEntityName = 116;
types.BaseType.ApplicationKeyName = 117;
types.BaseType.LocationTableName = 118;
types.BaseType.OrganizationName = 119;
types.BaseType.DashboardName = 120;
types.BaseType.Unknown = 121;

// entityTypeEnum enum
types.EntityType = {};
types.EntityType.Undefined = 0;
types.EntityType.Thing = 0x0A;
types.EntityType.ThingShapes = 0x0B;
types.EntityType.ThingTemplates = 0x0C;
types.EntityType.ThingPackages = 0x0D;
types.EntityType.Networks = 0x0E;
types.EntityType.DataShapes = 0x0F;
types.EntityType.ModelTags = 0x14;
types.EntityType.DataTags = 0x15;
types.EntityType.Mashups = 0x1E;
types.EntityType.Widgets = 0x1F;
types.EntityType.StyleDefinitions = 0x20;
types.EntityType.StateDefinition = 0x21;
types.EntityType.Menus = 0x22;
types.EntityType.MediaEntities = 0x23;
types.EntityType.LocalizationTables = 0x24;
types.EntityType.Dashboards = 0x27;
types.EntityType.Logs = 0x28;
types.EntityType.Users = 0x32;
types.EntityType.Groups = 0x33;
types.EntityType.Organizations = 0x34;
types.EntityType.ApplicationKeys = 0x35;
types.EntityType.DirectoryServices = 0x36;
types.EntityType.Resource = 0x3C;
types.EntityType.ScriptFunctionLibraries = 0x3D;
types.EntityType.ExtensionPackages = 0x46;
types.EntityType.Subsystem = 0x50;

// msgCodeEnum enum
types.MessageCode = {};
types.MessageCode.Unknown = 0x00;
types.MessageCode.Get = 0x01;
types.MessageCode.Put = 0x02;
types.MessageCode.Post = 0x03;
types.MessageCode.Delete = 0x04;
types.MessageCode.Bind = 0x0A;
types.MessageCode.Unbind = 0x0B;
types.MessageCode.Auth = 0x14;
types.MessageCode.KeepAlive = 0x1F;
types.MessageCode.Success = 0x40;
types.MessageCode.BadRequest = 0x80;
types.MessageCode.Unauthorized = 0x81;
types.MessageCode.BadOption = 0x82;
types.MessageCode.Forbidden = 0x83;
types.MessageCode.NotFound = 0x84;
types.MessageCode.MethodNotAllowed = 0x85;
types.MessageCode.NotAcceptable = 0x86;
types.MessageCode.PreconditionFailed = 0x8C;
types.MessageCode.EntityTooLarge = 0x8D;
types.MessageCode.UnsupportedContentFormat = 0x8F;
types.MessageCode.InternalServerError = 0xA0;
types.MessageCode.NotImplemented = 0xA1;
types.MessageCode.BadGateway = 0xA2;
types.MessageCode.ServiceUnavailable = 0xA3;
types.MessageCode.GatewayTimeout = 0xA4;
types.MessageCode.WroteToOfflineMessageStore = 0xA5;

// TW_Errors enum
types.Errors = {};

types.Errors.General = {};
types.Errors.General.UnknownError = 100;
types.Errors.General.InvalidParam = 101;
types.Errors.General.ErrorAllocatingMemory = 102;
types.Errors.General.ErrorCreatingMutex = 103;
types.Errors.General.ErrorWritingFile = 104;
types.Errors.General.ErrorReadingFile = 105;

types.Errors.Websocket = {};
types.Errors.Websocket.UnknownError = 200;
types.Errors.Websocket.ErrorInitalizing = 201;
types.Errors.Websocket.TimedOutInitializing = 202;
types.Errors.Websocket.WebsocketNotConnected = 203;
types.Errors.Websocket.ErrorParsing = 204;
types.Errors.Websocket.ErrorReading = 205;
types.Errors.Websocket.FrameTooLarge = 206;
types.Errors.Websocket.InvalidFrameType = 207;
types.Errors.Websocket.MessageTooLarger = 208;
types.Errors.Websocket.ErrorWriting = 209;
types.Errors.Websocket.InvalidAcceptKey = 210;

types.Errors.MessageCode = {};
types.Errors.MessageCode.BadRequest = 1100;
types.Errors.MessageCode.Unauthorized = 1101;
types.Errors.MessageCode.BadOption = 1102;
types.Errors.MessageCode.Forbidden = 1103;
types.Errors.MessageCode.NotFound = 1104;
types.Errors.MessageCode.MethodNotAllowed = 1105;
types.Errors.MessageCode.NotAcceptable = 1106;
types.Errors.MessageCode.PreconditionFailed = 1107;
types.Errors.MessageCode.EntityTooLarge = 1108;
types.Errors.MessageCode.UnsupportedContentFormat = 1109;
types.Errors.MessageCode.InternalServerError = 1110;
types.Errors.MessageCode.NotImplemented = 1111;
types.Errors.MessageCode.BadGateway = 1112;
types.Errors.MessageCode.ServiceUnavailable = 1113;
types.Errors.MessageCode.GatewayTimeout = 1114;

types.Success = types.MessageCode.Success;
types.Failed = types.Errors.General.UnknownError;
types.OK = 0;

///////////////////////////////////////////////////////////////////
// utiltiy functions
// @TODO - used for testing, needs to be completed
types.utils = {
	baseTypeToString: function (type) {
		var t = types.BaseType;
		
		var returnVal = '*** Unknown ***';
		
		switch (type) {
			case t.String:
				returnVal = 'STRING';
				break;

			case t.Integer:
				returnVal = 'INTEGER';
				break;

			default:
				break;
		}
		
		return returnVal;
	},
	stringToBaseType: function (str) {
		var t = undefined;
		switch (str.toLowerCase()) {
			case 'nothing':
				t = types.BaseType.Nothing;
				break;
			case 'string':
				t = types.BaseType.String;
				break;
			case 'number':
				t = types.BaseType.Number;
				break;
			case 'boolean':
				t = types.BaseType.Boolean;
				break;
			case 'datetime':
				t = types.BaseType.DateTime;
				break;
			case 'timespan':
				t = types.BaseType.Timespan;
				break;
			case 'infotable':
				t = types.BaseType.InfoTable;
				break;
			case 'location':
				t = types.BaseType.Location;
				break;
			case 'xml':
				t = types.BaseType.XML;
				break;
			case 'json':
				t = types.BaseType.JSON;
				break;
			case 'query':
				t = types.BaseType.Query;
				break;
			case 'image':
				t = types.BaseType.Image;
				break;
			case 'hyperlink':
				t = types.BaseType.Hyperlink;
				break;
			case 'imagelink':
				t = types.BaseType.Imagelink;
				break;
			case 'password':
				t = types.BaseType.Password;
				break;
			case 'html':
				t = types.BaseType.HTML;
				break;
			case 'text':
				t = types.BaseType.Text;
				break;
			case 'tags':
				t = types.BaseType.Tags;
				break;
			case 'schedule':
				t = types.BaseType.Schedule;
				break;
			case 'variant':
				t = types.BaseType.Variant;
				break;
			case 'guid':
				t = types.BaseType.GUID;
				break;
			case 'blob':
				t = types.BaseType.Blob;
				break;
			case 'integer':
				t = types.BaseType.Integer;
				break;
			case 'propertyname':
				t = types.BaseType.PropertyName;
				break;
			case 'servicename':
				t = types.BaseType.ServiceName;
				break;
			case 'eventname':
				t = types.BaseType.EventName;
				break;
			case 'thingname':
				t = types.BaseType.ThingName;
				break;
			case 'thingshapename':
				t = types.BaseType.ThingShapeName;
				break;
			case 'thingtemplatename':
				t = types.BaseType.ThingTemplateName;
				break;
			case 'datashapename':
				t = types.BaseType.DataShapeName;
				break;
			case 'mashupname':
				t = types.BaseType.MashupName;
				break;
			case 'menuname':
				t = types.BaseType.MenuName;
				break;
			case 'basetypename':
				t = types.BaseType.BaseTypeName;
				break;
			case 'username':
				t = types.BaseType.UserName;
				break;
			case 'groupname':
				t = types.BaseType.GroupName;
				break;
			case 'categoryname':
				t = types.BaseType.CategoryName;
				break;
			case 'statedefinitionname':
				t = types.BaseType.StateDefinitionName;
				break;
			case 'modeltagvocabularyname':
				t = types.BaseType.ModelTagVocabularyName;
				break;
			case 'datatagvocabularyname':
				t = types.BaseType.DataTagVocabularyName;
				break;
			case 'networkname':
				t = types.BaseType.NetworkName;
				break;
			case 'mediaentityname':
				t = types.BaseType.MediaEntityName;
				break;
			case 'applicationkeyname':
				t = types.BaseType.ApplicationKeyName;
				break;
			case 'locationtablename':
				t = types.BaseType.LocationTableName;
				break;
			case 'organizationname':
				t = types.BaseType.OrganizationName;
				break;
			case 'dashboardname':
				t = types.BaseType.DashboardName;
				break;
			case 'unknown':
				t = types.BaseType.Unknown;
				break;
			default:
				throw new Error('Cannot convert %s to type - does not exist', str);
				break;
		}
		return t;
	}
};