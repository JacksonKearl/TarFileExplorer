(function () {
	'use strict';

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.readTar = exports.TarFileEntryHeader = exports.TarFileEntry = exports.TarFile = void 0;
	const TarFile_1 = require("./TarFile");
	Object.defineProperty(exports, "TarFile", { enumerable: true, get: function () { return TarFile_1.TarFile; } });
	const TarFileEntry_1 = require("./TarFileEntry");
	Object.defineProperty(exports, "TarFileEntry", { enumerable: true, get: function () { return TarFileEntry_1.TarFileEntry; } });
	const TarFileEntryHeader_1 = require("./TarFileEntryHeader");
	Object.defineProperty(exports, "TarFileEntryHeader", { enumerable: true, get: function () { return TarFileEntryHeader_1.TarFileEntryHeader; } });
	exports.readTar = (tarball) => TarFile_1.TarFile.fromBytes(tarball);

}());
