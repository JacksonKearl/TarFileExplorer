(function () {
	'use strict';

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.readTar = void 0;
	const TarFile_1 = require("./TarFile");
	exports.readTar = (tarball) => TarFile_1.TarFile.fromBytes(tarball);

}());
