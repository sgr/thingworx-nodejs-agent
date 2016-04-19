Thingworx Node.js Framework
=============
A Node.js framework for scripting Thingworx Agents.

Requirements
-------------------
In order to develop with the framework and run agents you'll need the following software installed:

| Software | Version | Download Location |
|----------|---------|-------------------|
| Node.js  | 4.2.2   | https://nodejs.org/en/download/ |
| Python   | 2.7   | https://www.python.org/downloads/release/python-2710/ |
| C/C++ Compiler | | |
| Visual Studio | 2012 or 2015 | https://www.visualstudio.com |
| GCC | 4.x | Check your distro's package manager |
| XCode<sup>2</sup> | _unknown_ | https://developer.apple.com/xcode/ |

_Note_: If Python 3 is also installed on your system, you may have build problems.  Make sure the 2.x version of python is first in your PATH.

_Note_: Has not been tested on OS X, but should work.  XCode version should be recent.


You should have a basic understanding of both Node.js application and module development and some familiarity with `npm`.  If you do not, you may want to review the links below.

* [Node School](http://nodeschool.io/)
* [Node Docs](https://nodejs.org/en/docs/)
* [NPM for Beginners](http://www.sitepoint.com/beginners-guide-node-package-manager/)

Installation
----------------
Clone the agent to your local machine

```
git clone https://github.com/ThingworxDevZone/thingworx-nodejs-agent
```

When finished, you should have a `thingworx-nodejs-agent` directory that will contain the following sub directories:

| Directory Name  | Description |
|---------------|-------------|
| `thingworx-ffi` | C SDK Wrapper library |
| `thingworx-core` | Core Object Wrappers |
| `thingworx-api` | API Wrapper |
| `thingworx-utils` | Utility Wrappers | 
| `thingworx-agent-examples` | Agent Examples | 
| `thingworx-driver-experiments` | Driver Code Experiments |
| `binaries` | Pre-built copies of the C SDK |

#### Pre-built Thingworx C SDK Binarines
Pre-built copies of the C SDK are included in the `binaries` folder.

| Platform  | Arch         | Build   | Folder |
|-----------|--------------|---------|--------|
| Windows   | x86 32-bit   | Debug   | `binaries/win32/debug` |
| Windows   | x86 32-bit   | Release | `binaries/win32/release` |
| Windows   | x86 64-bit   | Debug   | `binaries/win32-x64/debug` |
| Windows   | x86 64-bit   | Release | `binaries/win32-x64/debug` |
| Linux     | Armv6        | Debug   | `binaries/gcc-linux-armv6/debug` |
| Linux     | Armv6        | Release | `binaries/gcc-linux-armv6/release` |

#### Building Thingworx C SDK
If you don't use one of the pre-built copies of the C SDK, you'll have to build one yourself.  The Node.js Agent Framework requires the Thingworx C SDK -

1. Be built as a shared library.  
2. Be built for the same architecture as Node.js (e.g. if you have a 64-bit Node install, you must use a 64-bit shared library.)
3. Be named twApi.(so|dll)

For the most part, you can just follow the build instructions from the C SDK for the platform of your choice.  However, when building on Windows, you'll need a different copy of `exports.def` with additional function definitions. See [here](#exports.def)

If you're running Linux you can add the following lines to the main `Makefile` (located at `build/Makefile`), just above the `app` target.  
``` make
shared: $(AXTLS_LIB_OBJS) $(LIB_OBJS)
        $(LINKER) -shared -o twApi.so -L$(LIBDIR) $(patsubst %.c,obj/$(PLATFORM)/$(BUILDDIR)/%.o,$(notdir $(TW_SDK_SRC))) $(patsubst %.c,obj/$(PLATFORM)/$(BUILDDIR)/axtls/%.o,$(notdir $(TLS_SRCS))) $(LIBOPTS)

```

You can then run `make shared` to build the shared library.

#### Running `thingworx-agent-examples`

``` bash
cd thingworx-agent-examples
npm run setup-examples
node app.js
```

#### Running Unit Tests
Currently `thingworx-core` contains all the unit testing code.  Mocha is used as testing framework
``` bash
# install mocha globally
npm install mocha -g

# Enter the thingworx-core directory
cd thingworx-core

# Run mocha
mocha
```

API
-----

#### Overview

##### 3rd Party Software
The Thingworx Node.js API relies on a few different pieces of 3rd party, open source software to help in interoperating with the C SDK:

| Node Module | Description | Docs |
|-------------|-------------|------|
| node-ffi    | Foreign Function Interface for Node.js | https://github.com/node-ffi/node-ffi |
| ref         | Allows Node Buffers to act as 'pointers' | https://github.com/TooTallNate/ref |
| ref-struct | Create ABI compliant `struct` instances on top of Buffers | https://github.com/TooTallNate/ref-struct |
| ref-union | Create ABI compliant `union` instances on top of Buffers | https://github.com/TooTallNate/ref-union |
| underscore.js | Functional programming utility library | http://underscorejs.org/ |

If you're planning on doing any development on the C bindings in the `thingworx-ffi` library, you should definitely familiarize yourself with how both `node-ffi`, `ref` and `ref-struct` work.  You should also be comfortable with a C/C++ debugger like GDB, as you can easily segfault the whole node process if you make an incorrect ffi call.

#### thingworx-ffi
 _Cominig Soon_
 
#### thingworx-core
_Coming Soon_

#### thingworx-api
_Coming Soon_

#### thingworx-utils
_Coming Soon_

Eratta
--------
#### Windows `exports.def`<a id=exports.def></a>

```
LIBRARY twApi
EXPORTS
twApi_GetVersion
twApi_Initialize
twApi_Delete
twApi_Connect
twApi_Disconnect
twApi_isConnected
twApi_BindThing
twApi_UnbindThing
twApi_RegisterProperty
twApi_ReadProperty
twApi_WriteProperty
twApi_PushProperties
twApi_RegisterOnAuthenticatedCallback
twApi_UnregisterOnAuthenticatedCallback
twApi_RegisterBindEventCallback
twApi_UnregisterBindEventCallback
twApi_RegisterPropertyCallback
twApi_UnregisterPropertyCallback
twApi_RegisterConnectCallback
twApi_RegisterCloseCallback
twApi_RegisterPingCallback
twApi_RegisterPongCallback
twApi_RegisterService
twApi_UnregisterServiceCallback
twApi_RegisterEvent
twApi_FireEvent
twApi_DisableEncryption
twApi_DisableCertValidation
twApi_TaskerFunction
twApi_SetOfflineMsgStoreDir
twApi_CreatePropertyList
twApi_DeletePropertyList
twApi_AddPropertyToList
twLogger_SetLevel
twLogger_SetIsVerbose
twLogger_SetFunction
twLog
twList_GetByIndex
twList_GetCount
twList_Next
twList_ReplaceValue
twDataShape_Create
twDataShape_Delete
twDataShape_GetLength
twDataShape_AddEntry
twDataShape_GetEntryIndex
twDataShape_ToJson
twDataShape_SetName
twDataShapeEntry_ToJson
twDataShapeEntry_Create
twDataShapeEntry_Delete
twDataShapeEntry_GetLength
twInfoTable_Create
twInfoTable_CreateFromStream
twInfoTable_Delete
twInfoTable_FullCopy
twInfoTable_ZeroCopy
twInfoTable_Compare
twInfoTable_CreateFromPrimitive
twInfoTable_CreateFromString
twInfoTable_CreateFromNumber
twInfoTable_CreateFromInteger
twInfoTable_CreateFromLocation
twInfoTable_CreateFromBlob
twInfoTable_CreateFromDatetime
twInfoTable_CreateFromBoolean
twInfoTable_CreateFromJson
twInfoTable_GetString
twInfoTable_GetNumber
twInfoTable_GetInteger
twInfoTable_GetLocation
twInfoTable_GetBlob
twInfoTable_GetDatetime
twInfoTable_GetBoolean
twInfoTable_GetPrimitive
twInfoTable_ToJson
twInfoTable_AddRow
twInfoTable_GetEntry
twInfoTableRow_GetEntry
twInfoTableRow_Create
twInfoTableRow_AddEntry
twInfoTableRow_Delete
twPrimitive_Create
twPrimitive_CreateFromStream
twPrimitive_Delete
twPrimitive_Compare
twPrimitive_IsTrue
twPrimitive_CreateFromLocation
twPrimitive_CreateFromNumber
twPrimitive_CreateFromInteger
twPrimitive_CreateFromDatetime
twPrimitive_CreateFromBoolean
twPrimitive_CreateFromInfoTable
twPrimitive_CreateVariant
twPrimitive_CreateFromString
twPrimitive_CreateFromBlob
twPrimitive_CreateFromVariable
twPrimitive_CreateFromJson
twPrimitive_ToJson
twPrimitive_ZeroCopy
twPrimitive_FullCopy
twMessageHandler_msgHandlerTask
twSleepMsec
cJSON_Delete
cJSON_Print
cJSON_Parse
baseTypeFromString
baseTypeToString
```# nodejs-edge-agent
