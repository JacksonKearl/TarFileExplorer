var TarUtils = (function (exports) {
    'use strict';

    class ByteStream {
        constructor(bytes) {
            this.bytes = bytes;
            this.byteIndexCurrent = 0;
        }
        // instance methods
        hasMoreBytes() {
            return this.byteIndexCurrent < this.bytes.length;
        }
        readBytes(numberOfBytesToRead) {
            const start = this.byteIndexCurrent;
            this.byteIndexCurrent += numberOfBytesToRead;
            return this.bytes.slice(start, this.byteIndexCurrent);
        }
        readByte() {
            let returnValue = this.bytes[this.byteIndexCurrent];
            this.byteIndexCurrent++;
            return returnValue;
        }
        readString(lengthOfString) {
            let returnValue = '';
            for (let i = 0; i < lengthOfString; i++) {
                const byte = this.readByte();
                if (byte != 0) {
                    const byteAsChar = String.fromCharCode(byte);
                    returnValue += byteAsChar;
                }
            }
            return returnValue;
        }
    }

    class ByteHelper {
        static stringUTF8ToBytes(stringToConvert) {
            const bytes = [];
            for (let i = 0; i < stringToConvert.length; i++) {
                const byte = stringToConvert.charCodeAt(i);
                bytes.push(byte);
            }
            return bytes;
        }
        static bytesToStringUTF8(bytesToConvert) {
            let returnValue = '';
            for (let i = 0; i < bytesToConvert.length; i++) {
                const byte = bytesToConvert[i];
                const byteAsChar = String.fromCharCode(byte);
                returnValue += byteAsChar;
            }
            return returnValue;
        }
    }

    class TarFileTypeFlag {
        constructor(value, name) {
            this.value = value;
            this.id = '_' + this.value;
            this.name = name;
        }
        static Instances() {
            if (TarFileTypeFlag._instances == null) {
                TarFileTypeFlag._instances = new TarFileTypeFlag_Instances();
            }
            return TarFileTypeFlag._instances;
        }
    }
    class TarFileTypeFlag_Instances {
        constructor() {
            this.Normal = new TarFileTypeFlag('0', 'Normal');
            this.HardLink = new TarFileTypeFlag('1', 'Hard Link');
            this.SymbolicLink = new TarFileTypeFlag('2', 'Symbolic Link');
            this.CharacterSpecial = new TarFileTypeFlag('3', 'Character Special');
            this.BlockSpecial = new TarFileTypeFlag('4', 'Block Special');
            this.Directory = new TarFileTypeFlag('5', 'Directory');
            this.FIFO = new TarFileTypeFlag('6', 'FIFO');
            this.ContiguousFile = new TarFileTypeFlag('7', 'Contiguous File');
            this.LongFilePath = new TarFileTypeFlag('L', '././@LongLink');
            // Additional types not implemented:
            // 'g' - global extended header with meta data (POSIX.1-2001)
            // 'x' - extended header with meta data for the next file in the archive (POSIX.1-2001)
            // 'A'-'Z' - Vendor specific extensions (POSIX.1-1988)
            // [other values] - reserved for future standardization
            this._All = [
                this.Normal,
                this.HardLink,
                this.SymbolicLink,
                this.CharacterSpecial,
                this.BlockSpecial,
                this.Directory,
                this.FIFO,
                this.ContiguousFile,
                this.LongFilePath,
            ];
            for (let i = 0; i < this._All.length; i++) {
                const item = this._All[i];
                this._All[item.id] = item;
            }
        }
    }

    class TarFileEntryHeader {
        constructor(fileName, fileMode, userIDOfOwner, userIDOfGroup, fileSizeInBytes, timeModifiedInUnixFormat, checksum, typeFlag, nameOfLinkedFile, uStarIndicator, uStarVersion, userNameOfOwner, groupNameOfOwner, deviceNumberMajor, deviceNumberMinor, filenamePrefix) {
            this.fileName = fileName;
            this.fileMode = fileMode;
            this.userIDOfOwner = userIDOfOwner;
            this.userIDOfGroup = userIDOfGroup;
            this.fileSizeInBytes = fileSizeInBytes;
            this.timeModifiedInUnixFormat = timeModifiedInUnixFormat;
            this.checksum = checksum;
            this.typeFlag = typeFlag;
            this.nameOfLinkedFile = nameOfLinkedFile;
            this.uStarIndicator = uStarIndicator;
            this.uStarVersion = uStarVersion;
            this.userNameOfOwner = userNameOfOwner;
            this.groupNameOfOwner = groupNameOfOwner;
            this.deviceNumberMajor = deviceNumberMajor;
            this.deviceNumberMinor = deviceNumberMinor;
            this.filenamePrefix = filenamePrefix;
        }
        // static methods
        // static default() {
        // 	const now = +new Date()
        // 	const unixEpoch = +new Date(1970, 1, 1)
        // 	const millisecondsSinceUnixEpoch = now - unixEpoch
        // 	const secondsSinceUnixEpoch = Math.floor(millisecondsSinceUnixEpoch / 1000)
        // 	const secondsSinceUnixEpochAsStringOctal = padRight(secondsSinceUnixEpoch.toString(8), 12, '\0')
        // 	const timeModifiedInUnixFormat: number[] = []
        // 	for (let i = 0; i < secondsSinceUnixEpochAsStringOctal.length; i++) {
        // 		const digitAsASCIICode = secondsSinceUnixEpochAsStringOctal.charCodeAt(i)
        // 		timeModifiedInUnixFormat.push(digitAsASCIICode)
        // 	}
        // 	let returnValue = new TarFileEntryHeader(
        // 		padRight('', 100, '\0'), // fileName
        // 		'0100777', // fileMode
        // 		'0000000', // userIDOfOwner
        // 		'0000000', // userIDOfGroup
        // 		0, // fileSizeInBytes
        // 		timeModifiedInUnixFormat,
        // 		0, // checksum
        // 		TarFileTypeFlag.Instances().Normal,
        // 		'', // nameOfLinkedFile,
        // 		'ustar', // uStarIndicator,
        // 		'00', // uStarVersion,
        // 		'', // userNameOfOwner,
        // 		'', // groupNameOfOwner,
        // 		'', // deviceNumberMajor,
        // 		'', // deviceNumberMinor,
        // 		'', // filenamePrefix
        // 	)
        // 	return returnValue
        // }
        // static directoryNew(directoryName: any) {
        // 	const header = TarFileEntryHeader.default()
        // 	header.fileName = directoryName
        // 	header.typeFlag = TarFileTypeFlag.Instances().Directory
        // 	header.fileSizeInBytes = 0
        // 	header.checksumCalculate()
        // 	return header
        // }
        // static fileNew(fileName: any, fileContentsAsBytes: string | any[]) {
        // 	const header = TarFileEntryHeader.default()
        // 	header.fileName = fileName
        // 	header.typeFlag = TarFileTypeFlag.Instances().Normal
        // 	header.fileSizeInBytes = fileContentsAsBytes.length
        // 	header.checksumCalculate()
        // 	return header
        // }
        static fromBytes(bytes) {
            const reader = new ByteStream(bytes);
            const fileName = reader.readString(100).trim();
            const fileMode = reader.readString(8);
            const userIDOfOwner = reader.readString(8);
            const userIDOfGroup = reader.readString(8);
            const fileSizeInBytesAsStringOctal = reader.readString(12);
            const timeModifiedInUnixFormat = reader.readBytes(12);
            const checksumAsStringOctal = reader.readString(8);
            const typeFlagValue = reader.readString(1);
            const nameOfLinkedFile = reader.readString(100);
            const uStarIndicator = reader.readString(6);
            const uStarVersion = reader.readString(2);
            const userNameOfOwner = reader.readString(32);
            const groupNameOfOwner = reader.readString(32);
            const deviceNumberMajor = reader.readString(8);
            const deviceNumberMinor = reader.readString(8);
            const filenamePrefix = reader.readString(155);
            const reserved = reader.readBytes(12);
            const fileSizeInBytes = parseInt(fileSizeInBytesAsStringOctal.trim(), 8);
            const checksum = parseInt(checksumAsStringOctal, 8);
            const typeFlags = TarFileTypeFlag.Instances()._All;
            const typeFlagID = '_' + typeFlagValue;
            const typeFlag = typeFlags[typeFlagID];
            let returnValue = new TarFileEntryHeader(fileName, fileMode, userIDOfOwner, userIDOfGroup, fileSizeInBytes, timeModifiedInUnixFormat, checksum, typeFlag, nameOfLinkedFile, uStarIndicator, uStarVersion, userNameOfOwner, groupNameOfOwner, deviceNumberMajor, deviceNumberMinor, filenamePrefix);
            return returnValue;
        }
        // instance methods
        // checksumCalculate() {
        // 	const thisAsBytes = this.toBytes()
        // 	// The checksum is the sum of all bytes in the header,
        // 	// except we obviously can't include the checksum itself.
        // 	// So it's assumed that all 8 of checksum's bytes are spaces (0x20=32).
        // 	// So we need to set this manually.
        // 	const offsetOfChecksumInBytes = 148
        // 	const numberOfBytesInChecksum = 8
        // 	const presumedValueOfEachChecksumByte = ' '.charCodeAt(0)
        // 	for (let i = 0; i < numberOfBytesInChecksum; i++) {
        // 		const offsetOfByte = offsetOfChecksumInBytes + i
        // 		thisAsBytes[offsetOfByte] = presumedValueOfEachChecksumByte
        // 	}
        // 	let checksumSoFar = 0
        // 	for (let i = 0; i < thisAsBytes.length; i++) {
        // 		const byteToAdd = thisAsBytes[i]
        // 		checksumSoFar += byteToAdd
        // 	}
        // 	this.checksum = checksumSoFar
        // 	return this.checksum
        // }
        // toBytes() {
        // 	if (!this.typeFlag) {
        // 		throw Error('Writing without a type flag. ')
        // 	}
        // 	const headerAsBytes: number[] = []
        // 	const writer = new ByteStream(headerAsBytes)
        // 	const fileSizeInBytesAsStringOctal = padLeft(this.fileSizeInBytes.toString(8) + '\0', 12, '0')
        // 	const checksumAsStringOctal = padLeft(this.checksum.toString(8) + '\0 ', 8, '0')
        // 	writer.writeString(this.fileName, 100)
        // 	writer.writeString(this.fileMode, 8)
        // 	writer.writeString(this.userIDOfOwner, 8)
        // 	writer.writeString(this.userIDOfGroup, 8)
        // 	writer.writeString(fileSizeInBytesAsStringOctal, 12)
        // 	writer.writeBytes(this.timeModifiedInUnixFormat)
        // 	writer.writeString(checksumAsStringOctal, 8)
        // 	writer.writeString(this.typeFlag.value, 1)
        // 	writer.writeString(this.nameOfLinkedFile, 100)
        // 	writer.writeString(this.uStarIndicator, 6)
        // 	writer.writeString(this.uStarVersion, 2)
        // 	writer.writeString(this.userNameOfOwner, 32)
        // 	writer.writeString(this.groupNameOfOwner, 32)
        // 	writer.writeString(this.deviceNumberMajor, 8)
        // 	writer.writeString(this.deviceNumberMinor, 8)
        // 	writer.writeString(this.filenamePrefix, 155)
        // 	writer.writeString(padRight('', 12, '\0')) // reserved
        // 	return headerAsBytes
        // }
        // strings
        toString() {
            const newline = '\n';
            let returnValue = '[TarFileEntryHeader ' +
                "fileName='" +
                this.fileName +
                "' " +
                "typeFlag='" +
                (this.typeFlag == null ? 'err' : this.typeFlag.name) +
                "' " +
                "fileSizeInBytes='" +
                this.fileSizeInBytes +
                "' " +
                ']' +
                newline;
            return returnValue;
        }
    }
    TarFileEntryHeader.FileNameMaxLength = 99;
    TarFileEntryHeader.SizeInBytes = 500;

    class TarFileEntry {
        constructor(header, dataAsBytes) {
            this.header = header;
            this.dataAsBytes = dataAsBytes;
        }
        // methods
        // static methods
        // static directoryNew(directoryName: any) {
        // 	const header = TarFileEntryHeader.directoryNew(directoryName)
        // 	const entry = new TarFileEntry(header, [])
        // 	return entry
        // }
        // static fileNew(fileName: string, fileContentsAsBytes: number[]) {
        // 	const header = TarFileEntryHeader.fileNew(fileName, fileContentsAsBytes)
        // 	const entry = new TarFileEntry(header, fileContentsAsBytes)
        // 	return entry
        // }
        static fromBytes(chunkAsBytes, reader) {
            const chunkSize = TarFile.ChunkSize;
            const header = TarFileEntryHeader.fromBytes(chunkAsBytes);
            const sizeOfDataEntryInBytesUnpadded = header.fileSizeInBytes;
            const numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize);
            const sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize;
            const dataAsBytes = reader
                .readBytes(sizeOfDataEntryInBytesPadded)
                .slice(0, sizeOfDataEntryInBytesUnpadded);
            const entry = new TarFileEntry(header, dataAsBytes);
            return entry;
        }
        // static manyFromByteArrays(
        // 	fileNamePrefix: number,
        // 	fileNameSuffix: any,
        // 	entriesAsByteArrays: string | any[],
        // ) {
        // 	let returnValues = []
        // 	for (let i = 0; i < entriesAsByteArrays.length; i++) {
        // 		const entryAsBytes = entriesAsByteArrays[i]
        // 		const entry = TarFileEntry.fileNew(fileNamePrefix + i + fileNameSuffix, entryAsBytes)
        // 		returnValues.push(entry)
        // 	}
        // 	return returnValues
        // }
        // instance methods
        remove(event) {
            throw Error('Not yet implemented!'); // todo
        }
        // toBytes() {
        // 	let entryAsBytes: number[] = []
        // 	const chunkSize = TarFile.ChunkSize
        // 	const headerAsBytes = this.header.toBytes()
        // 	entryAsBytes = entryAsBytes.concat(headerAsBytes)
        // 	entryAsBytes = entryAsBytes.concat(this.dataAsBytes)
        // 	const sizeOfDataEntryInBytesUnpadded = this.header.fileSizeInBytes
        // 	const numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize)
        // 	const sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize
        // 	const numberOfBytesOfPadding = sizeOfDataEntryInBytesPadded - sizeOfDataEntryInBytesUnpadded
        // 	for (let i = 0; i < numberOfBytesOfPadding; i++) {
        // 		entryAsBytes.push(0)
        // 	}
        // 	return entryAsBytes
        // }
        // strings
        toString() {
            const newline = '\n';
            const headerAsString = this.header.toString();
            const dataAsHexadecimalString = ByteHelper.bytesToStringUTF8(this.dataAsBytes);
            let returnValue = '[TarFileEntry]' +
                newline +
                headerAsString +
                '[Data]' +
                dataAsHexadecimalString +
                '[/Data]' +
                newline +
                '[/TarFileEntry]' +
                newline;
            return returnValue;
        }
    }

    class TarFile {
        constructor(fileName, entries) {
            this.fileName = fileName;
            this.entries = entries;
        }
        // static methods
        static fromBytes(fileName, bytes) {
            const reader = new ByteStream(bytes);
            const entries = [];
            const chunkSize = TarFile.ChunkSize;
            let numberOfConsecutiveZeroChunks = 0;
            while (reader.hasMoreBytes() == true) {
                const chunkAsBytes = reader.readBytes(chunkSize);
                let areAllBytesInChunkZeroes = true;
                for (let b = 0; b < chunkAsBytes.length; b++) {
                    if (chunkAsBytes[b] != 0) {
                        areAllBytesInChunkZeroes = false;
                        break;
                    }
                }
                if (areAllBytesInChunkZeroes == true) {
                    numberOfConsecutiveZeroChunks++;
                    if (numberOfConsecutiveZeroChunks == 2) {
                        break;
                    }
                }
                else {
                    numberOfConsecutiveZeroChunks = 0;
                    const entry = TarFileEntry.fromBytes(chunkAsBytes, reader);
                    entries.push(entry);
                }
            }
            let returnValue = new TarFile(fileName, entries);
            returnValue.consolidateLongPathEntries();
            return returnValue;
        }
        static create(fileName) {
            return new TarFile(fileName, []);
        }
        // instance methods
        consolidateLongPathEntries() {
            var _a;
            // TAR file entries with paths longer than 99 chars require cheating,
            // by prepending them with a entry of type "L" whose data contains the path.
            const typeFlagLongPathName = TarFileTypeFlag.Instances().LongFilePath.name;
            const entries = this.entries;
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (((_a = entry.header.typeFlag) === null || _a === void 0 ? void 0 : _a.name) == typeFlagLongPathName) {
                    const entryNext = entries[i + 1];
                    entryNext.header.fileName = entry.dataAsBytes.reduce((a, b) => (a += String.fromCharCode(b)), '');
                    //Drop all null terminating character
                    entryNext.header.fileName = entryNext.header.fileName.replace(/\0/g, '');
                    entries.splice(i, 1);
                    i--;
                }
            }
        }
        // toBytes() {
        // 	this.toBytes_PrependLongPathEntriesAsNeeded()
        // 	let fileAsBytes: number[] = []
        // 	// hack - For easier debugging.
        // 	const entriesAsByteArrays = this.entries.map((x) => x.toBytes())
        // 	// Now that we've written the bytes for long path entries,
        // 	// put it back the way it was.
        // 	this.consolidateLongPathEntries()
        // 	for (let i = 0; i < entriesAsByteArrays.length; i++) {
        // 		const entryAsBytes = entriesAsByteArrays[i]
        // 		fileAsBytes = fileAsBytes.concat(entryAsBytes)
        // 	}
        // 	const chunkSize = TarFile.ChunkSize
        // 	const numberOfZeroChunksToWrite = 2
        // 	for (let i = 0; i < numberOfZeroChunksToWrite; i++) {
        // 		for (let b = 0; b < chunkSize; b++) {
        // 			fileAsBytes.push(0)
        // 		}
        // 	}
        // 	return fileAsBytes
        // }
        // toBytes_PrependLongPathEntriesAsNeeded() {
        // 	// TAR file entries with paths longer than 99 chars require cheating,
        // 	// by prepending them with a entry of type "L" whose data contains the path.
        // 	const typeFlagLongPath = TarFileTypeFlag.Instances().LongFilePath
        // 	const maxLength = TarFileEntryHeader.FileNameMaxLength
        // 	const entries = this.entries
        // 	for (let i = 0; i < entries.length; i++) {
        // 		const entry = entries[i]
        // 		const entryHeader = entry.header
        // 		const entryFileName = entryHeader.fileName
        // 		if (entryFileName.length > maxLength) {
        // 			const entryFileNameAsBytes = entryFileName.split('').map((x: string) => x.charCodeAt(0))
        // 			const entryContainingLongPathToPrepend = TarFileEntry.fileNew(
        // 				typeFlagLongPath.name,
        // 				entryFileNameAsBytes,
        // 			)
        // 			entryContainingLongPathToPrepend.header.typeFlag = typeFlagLongPath
        // 			entryContainingLongPathToPrepend.header.timeModifiedInUnixFormat =
        // 				entryHeader.timeModifiedInUnixFormat
        // 			entryContainingLongPathToPrepend.header.checksumCalculate()
        // 			entryHeader.fileName = entryFileName.substr(0, maxLength) + String.fromCharCode(0)
        // 			entries.splice(i, 0, entryContainingLongPathToPrepend)
        // 			i++
        // 		}
        // 	}
        // }
        // strings
        toString() {
            const newline = '\n';
            let returnValue = '[TarFile]' + newline;
            for (let i = 0; i < this.entries.length; i++) {
                const entry = this.entries[i];
                const entryAsString = entry.toString();
                returnValue += entryAsString;
            }
            returnValue += '[/TarFile]' + newline;
            return returnValue;
        }
    }
    // constants
    TarFile.ChunkSize = 512;

    const readTar = (tarball) => {
        return TarFile.fromBytes('my_tar', tarball);
    };

    exports.readTar = readTar;

    return exports;

}({}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2J1aWxkL0J5dGVTdHJlYW0uanMiLCIuLi9idWlsZC9CeXRlSGVscGVyLmpzIiwiLi4vYnVpbGQvVGFyRmlsZVR5cGVGbGFnLmpzIiwiLi4vYnVpbGQvVGFyRmlsZUVudHJ5SGVhZGVyLmpzIiwiLi4vYnVpbGQvVGFyRmlsZUVudHJ5LmpzIiwiLi4vYnVpbGQvVGFyRmlsZS5qcyIsIi4uL2J1aWxkL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBCeXRlU3RyZWFtIHtcbiAgICBjb25zdHJ1Y3RvcihieXRlcykge1xuICAgICAgICB0aGlzLmJ5dGVzID0gYnl0ZXM7XG4gICAgICAgIHRoaXMuYnl0ZUluZGV4Q3VycmVudCA9IDA7XG4gICAgfVxuICAgIC8vIGluc3RhbmNlIG1ldGhvZHNcbiAgICBoYXNNb3JlQnl0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ5dGVJbmRleEN1cnJlbnQgPCB0aGlzLmJ5dGVzLmxlbmd0aDtcbiAgICB9XG4gICAgcmVhZEJ5dGVzKG51bWJlck9mQnl0ZXNUb1JlYWQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ5dGVJbmRleEN1cnJlbnQ7XG4gICAgICAgIHRoaXMuYnl0ZUluZGV4Q3VycmVudCArPSBudW1iZXJPZkJ5dGVzVG9SZWFkO1xuICAgICAgICByZXR1cm4gdGhpcy5ieXRlcy5zbGljZShzdGFydCwgdGhpcy5ieXRlSW5kZXhDdXJyZW50KTtcbiAgICB9XG4gICAgcmVhZEJ5dGUoKSB7XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9IHRoaXMuYnl0ZXNbdGhpcy5ieXRlSW5kZXhDdXJyZW50XTtcbiAgICAgICAgdGhpcy5ieXRlSW5kZXhDdXJyZW50Kys7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gICAgcmVhZFN0cmluZyhsZW5ndGhPZlN0cmluZykge1xuICAgICAgICBsZXQgcmV0dXJuVmFsdWUgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGhPZlN0cmluZzsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBieXRlID0gdGhpcy5yZWFkQnl0ZSgpO1xuICAgICAgICAgICAgaWYgKGJ5dGUgIT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGVBc0NoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlICs9IGJ5dGVBc0NoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJ5dGVTdHJlYW0uanMubWFwIiwiZXhwb3J0IGNsYXNzIEJ5dGVIZWxwZXIge1xuICAgIHN0YXRpYyBzdHJpbmdVVEY4VG9CeXRlcyhzdHJpbmdUb0NvbnZlcnQpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGUgPSBzdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGJ5dGVzLnB1c2goYnl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgICBzdGF0aWMgYnl0ZXNUb1N0cmluZ1VURjgoYnl0ZXNUb0NvbnZlcnQpIHtcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXNUb0NvbnZlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGUgPSBieXRlc1RvQ29udmVydFtpXTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVBc0NoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgKz0gYnl0ZUFzQ2hhcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Qnl0ZUhlbHBlci5qcy5tYXAiLCJleHBvcnQgY2xhc3MgVGFyRmlsZVR5cGVGbGFnIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaWQgPSAnXycgKyB0aGlzLnZhbHVlO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBzdGF0aWMgSW5zdGFuY2VzKCkge1xuICAgICAgICBpZiAoVGFyRmlsZVR5cGVGbGFnLl9pbnN0YW5jZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgVGFyRmlsZVR5cGVGbGFnLl9pbnN0YW5jZXMgPSBuZXcgVGFyRmlsZVR5cGVGbGFnX0luc3RhbmNlcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUYXJGaWxlVHlwZUZsYWcuX2luc3RhbmNlcztcbiAgICB9XG59XG5jbGFzcyBUYXJGaWxlVHlwZUZsYWdfSW5zdGFuY2VzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5Ob3JtYWwgPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCcwJywgJ05vcm1hbCcpO1xuICAgICAgICB0aGlzLkhhcmRMaW5rID0gbmV3IFRhckZpbGVUeXBlRmxhZygnMScsICdIYXJkIExpbmsnKTtcbiAgICAgICAgdGhpcy5TeW1ib2xpY0xpbmsgPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCcyJywgJ1N5bWJvbGljIExpbmsnKTtcbiAgICAgICAgdGhpcy5DaGFyYWN0ZXJTcGVjaWFsID0gbmV3IFRhckZpbGVUeXBlRmxhZygnMycsICdDaGFyYWN0ZXIgU3BlY2lhbCcpO1xuICAgICAgICB0aGlzLkJsb2NrU3BlY2lhbCA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJzQnLCAnQmxvY2sgU3BlY2lhbCcpO1xuICAgICAgICB0aGlzLkRpcmVjdG9yeSA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJzUnLCAnRGlyZWN0b3J5Jyk7XG4gICAgICAgIHRoaXMuRklGTyA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJzYnLCAnRklGTycpO1xuICAgICAgICB0aGlzLkNvbnRpZ3VvdXNGaWxlID0gbmV3IFRhckZpbGVUeXBlRmxhZygnNycsICdDb250aWd1b3VzIEZpbGUnKTtcbiAgICAgICAgdGhpcy5Mb25nRmlsZVBhdGggPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCdMJywgJy4vLi9ATG9uZ0xpbmsnKTtcbiAgICAgICAgLy8gQWRkaXRpb25hbCB0eXBlcyBub3QgaW1wbGVtZW50ZWQ6XG4gICAgICAgIC8vICdnJyAtIGdsb2JhbCBleHRlbmRlZCBoZWFkZXIgd2l0aCBtZXRhIGRhdGEgKFBPU0lYLjEtMjAwMSlcbiAgICAgICAgLy8gJ3gnIC0gZXh0ZW5kZWQgaGVhZGVyIHdpdGggbWV0YSBkYXRhIGZvciB0aGUgbmV4dCBmaWxlIGluIHRoZSBhcmNoaXZlIChQT1NJWC4xLTIwMDEpXG4gICAgICAgIC8vICdBJy0nWicgLSBWZW5kb3Igc3BlY2lmaWMgZXh0ZW5zaW9ucyAoUE9TSVguMS0xOTg4KVxuICAgICAgICAvLyBbb3RoZXIgdmFsdWVzXSAtIHJlc2VydmVkIGZvciBmdXR1cmUgc3RhbmRhcmRpemF0aW9uXG4gICAgICAgIHRoaXMuX0FsbCA9IFtcbiAgICAgICAgICAgIHRoaXMuTm9ybWFsLFxuICAgICAgICAgICAgdGhpcy5IYXJkTGluayxcbiAgICAgICAgICAgIHRoaXMuU3ltYm9saWNMaW5rLFxuICAgICAgICAgICAgdGhpcy5DaGFyYWN0ZXJTcGVjaWFsLFxuICAgICAgICAgICAgdGhpcy5CbG9ja1NwZWNpYWwsXG4gICAgICAgICAgICB0aGlzLkRpcmVjdG9yeSxcbiAgICAgICAgICAgIHRoaXMuRklGTyxcbiAgICAgICAgICAgIHRoaXMuQ29udGlndW91c0ZpbGUsXG4gICAgICAgICAgICB0aGlzLkxvbmdGaWxlUGF0aCxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9BbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9BbGxbaV07XG4gICAgICAgICAgICB0aGlzLl9BbGxbaXRlbS5pZF0gPSBpdGVtO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VGFyRmlsZVR5cGVGbGFnLmpzLm1hcCIsImltcG9ydCB7IEJ5dGVTdHJlYW0gfSBmcm9tICcuL0J5dGVTdHJlYW0nO1xuaW1wb3J0IHsgVGFyRmlsZVR5cGVGbGFnIH0gZnJvbSAnLi9UYXJGaWxlVHlwZUZsYWcnO1xuZXhwb3J0IGNsYXNzIFRhckZpbGVFbnRyeUhlYWRlciB7XG4gICAgY29uc3RydWN0b3IoZmlsZU5hbWUsIGZpbGVNb2RlLCB1c2VySURPZk93bmVyLCB1c2VySURPZkdyb3VwLCBmaWxlU2l6ZUluQnl0ZXMsIHRpbWVNb2RpZmllZEluVW5peEZvcm1hdCwgY2hlY2tzdW0sIHR5cGVGbGFnLCBuYW1lT2ZMaW5rZWRGaWxlLCB1U3RhckluZGljYXRvciwgdVN0YXJWZXJzaW9uLCB1c2VyTmFtZU9mT3duZXIsIGdyb3VwTmFtZU9mT3duZXIsIGRldmljZU51bWJlck1ham9yLCBkZXZpY2VOdW1iZXJNaW5vciwgZmlsZW5hbWVQcmVmaXgpIHtcbiAgICAgICAgdGhpcy5maWxlTmFtZSA9IGZpbGVOYW1lO1xuICAgICAgICB0aGlzLmZpbGVNb2RlID0gZmlsZU1vZGU7XG4gICAgICAgIHRoaXMudXNlcklET2ZPd25lciA9IHVzZXJJRE9mT3duZXI7XG4gICAgICAgIHRoaXMudXNlcklET2ZHcm91cCA9IHVzZXJJRE9mR3JvdXA7XG4gICAgICAgIHRoaXMuZmlsZVNpemVJbkJ5dGVzID0gZmlsZVNpemVJbkJ5dGVzO1xuICAgICAgICB0aGlzLnRpbWVNb2RpZmllZEluVW5peEZvcm1hdCA9IHRpbWVNb2RpZmllZEluVW5peEZvcm1hdDtcbiAgICAgICAgdGhpcy5jaGVja3N1bSA9IGNoZWNrc3VtO1xuICAgICAgICB0aGlzLnR5cGVGbGFnID0gdHlwZUZsYWc7XG4gICAgICAgIHRoaXMubmFtZU9mTGlua2VkRmlsZSA9IG5hbWVPZkxpbmtlZEZpbGU7XG4gICAgICAgIHRoaXMudVN0YXJJbmRpY2F0b3IgPSB1U3RhckluZGljYXRvcjtcbiAgICAgICAgdGhpcy51U3RhclZlcnNpb24gPSB1U3RhclZlcnNpb247XG4gICAgICAgIHRoaXMudXNlck5hbWVPZk93bmVyID0gdXNlck5hbWVPZk93bmVyO1xuICAgICAgICB0aGlzLmdyb3VwTmFtZU9mT3duZXIgPSBncm91cE5hbWVPZk93bmVyO1xuICAgICAgICB0aGlzLmRldmljZU51bWJlck1ham9yID0gZGV2aWNlTnVtYmVyTWFqb3I7XG4gICAgICAgIHRoaXMuZGV2aWNlTnVtYmVyTWlub3IgPSBkZXZpY2VOdW1iZXJNaW5vcjtcbiAgICAgICAgdGhpcy5maWxlbmFtZVByZWZpeCA9IGZpbGVuYW1lUHJlZml4O1xuICAgIH1cbiAgICAvLyBzdGF0aWMgbWV0aG9kc1xuICAgIC8vIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgIC8vIFx0Y29uc3Qgbm93ID0gK25ldyBEYXRlKClcbiAgICAvLyBcdGNvbnN0IHVuaXhFcG9jaCA9ICtuZXcgRGF0ZSgxOTcwLCAxLCAxKVxuICAgIC8vIFx0Y29uc3QgbWlsbGlzZWNvbmRzU2luY2VVbml4RXBvY2ggPSBub3cgLSB1bml4RXBvY2hcbiAgICAvLyBcdGNvbnN0IHNlY29uZHNTaW5jZVVuaXhFcG9jaCA9IE1hdGguZmxvb3IobWlsbGlzZWNvbmRzU2luY2VVbml4RXBvY2ggLyAxMDAwKVxuICAgIC8vIFx0Y29uc3Qgc2Vjb25kc1NpbmNlVW5peEVwb2NoQXNTdHJpbmdPY3RhbCA9IHBhZFJpZ2h0KHNlY29uZHNTaW5jZVVuaXhFcG9jaC50b1N0cmluZyg4KSwgMTIsICdcXDAnKVxuICAgIC8vIFx0Y29uc3QgdGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0OiBudW1iZXJbXSA9IFtdXG4gICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IHNlY29uZHNTaW5jZVVuaXhFcG9jaEFzU3RyaW5nT2N0YWwubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBcdFx0Y29uc3QgZGlnaXRBc0FTQ0lJQ29kZSA9IHNlY29uZHNTaW5jZVVuaXhFcG9jaEFzU3RyaW5nT2N0YWwuY2hhckNvZGVBdChpKVxuICAgIC8vIFx0XHR0aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQucHVzaChkaWdpdEFzQVNDSUlDb2RlKVxuICAgIC8vIFx0fVxuICAgIC8vIFx0bGV0IHJldHVyblZhbHVlID0gbmV3IFRhckZpbGVFbnRyeUhlYWRlcihcbiAgICAvLyBcdFx0cGFkUmlnaHQoJycsIDEwMCwgJ1xcMCcpLCAvLyBmaWxlTmFtZVxuICAgIC8vIFx0XHQnMDEwMDc3NycsIC8vIGZpbGVNb2RlXG4gICAgLy8gXHRcdCcwMDAwMDAwJywgLy8gdXNlcklET2ZPd25lclxuICAgIC8vIFx0XHQnMDAwMDAwMCcsIC8vIHVzZXJJRE9mR3JvdXBcbiAgICAvLyBcdFx0MCwgLy8gZmlsZVNpemVJbkJ5dGVzXG4gICAgLy8gXHRcdHRpbWVNb2RpZmllZEluVW5peEZvcm1hdCxcbiAgICAvLyBcdFx0MCwgLy8gY2hlY2tzdW1cbiAgICAvLyBcdFx0VGFyRmlsZVR5cGVGbGFnLkluc3RhbmNlcygpLk5vcm1hbCxcbiAgICAvLyBcdFx0JycsIC8vIG5hbWVPZkxpbmtlZEZpbGUsXG4gICAgLy8gXHRcdCd1c3RhcicsIC8vIHVTdGFySW5kaWNhdG9yLFxuICAgIC8vIFx0XHQnMDAnLCAvLyB1U3RhclZlcnNpb24sXG4gICAgLy8gXHRcdCcnLCAvLyB1c2VyTmFtZU9mT3duZXIsXG4gICAgLy8gXHRcdCcnLCAvLyBncm91cE5hbWVPZk93bmVyLFxuICAgIC8vIFx0XHQnJywgLy8gZGV2aWNlTnVtYmVyTWFqb3IsXG4gICAgLy8gXHRcdCcnLCAvLyBkZXZpY2VOdW1iZXJNaW5vcixcbiAgICAvLyBcdFx0JycsIC8vIGZpbGVuYW1lUHJlZml4XG4gICAgLy8gXHQpXG4gICAgLy8gXHRyZXR1cm4gcmV0dXJuVmFsdWVcbiAgICAvLyB9XG4gICAgLy8gc3RhdGljIGRpcmVjdG9yeU5ldyhkaXJlY3RvcnlOYW1lOiBhbnkpIHtcbiAgICAvLyBcdGNvbnN0IGhlYWRlciA9IFRhckZpbGVFbnRyeUhlYWRlci5kZWZhdWx0KClcbiAgICAvLyBcdGhlYWRlci5maWxlTmFtZSA9IGRpcmVjdG9yeU5hbWVcbiAgICAvLyBcdGhlYWRlci50eXBlRmxhZyA9IFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5EaXJlY3RvcnlcbiAgICAvLyBcdGhlYWRlci5maWxlU2l6ZUluQnl0ZXMgPSAwXG4gICAgLy8gXHRoZWFkZXIuY2hlY2tzdW1DYWxjdWxhdGUoKVxuICAgIC8vIFx0cmV0dXJuIGhlYWRlclxuICAgIC8vIH1cbiAgICAvLyBzdGF0aWMgZmlsZU5ldyhmaWxlTmFtZTogYW55LCBmaWxlQ29udGVudHNBc0J5dGVzOiBzdHJpbmcgfCBhbnlbXSkge1xuICAgIC8vIFx0Y29uc3QgaGVhZGVyID0gVGFyRmlsZUVudHJ5SGVhZGVyLmRlZmF1bHQoKVxuICAgIC8vIFx0aGVhZGVyLmZpbGVOYW1lID0gZmlsZU5hbWVcbiAgICAvLyBcdGhlYWRlci50eXBlRmxhZyA9IFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5Ob3JtYWxcbiAgICAvLyBcdGhlYWRlci5maWxlU2l6ZUluQnl0ZXMgPSBmaWxlQ29udGVudHNBc0J5dGVzLmxlbmd0aFxuICAgIC8vIFx0aGVhZGVyLmNoZWNrc3VtQ2FsY3VsYXRlKClcbiAgICAvLyBcdHJldHVybiBoZWFkZXJcbiAgICAvLyB9XG4gICAgc3RhdGljIGZyb21CeXRlcyhieXRlcykge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgQnl0ZVN0cmVhbShieXRlcyk7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcmVhZGVyLnJlYWRTdHJpbmcoMTAwKS50cmltKCk7XG4gICAgICAgIGNvbnN0IGZpbGVNb2RlID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IHVzZXJJRE9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZyg4KTtcbiAgICAgICAgY29uc3QgdXNlcklET2ZHcm91cCA9IHJlYWRlci5yZWFkU3RyaW5nKDgpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZUluQnl0ZXNBc1N0cmluZ09jdGFsID0gcmVhZGVyLnJlYWRTdHJpbmcoMTIpO1xuICAgICAgICBjb25zdCB0aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQgPSByZWFkZXIucmVhZEJ5dGVzKDEyKTtcbiAgICAgICAgY29uc3QgY2hlY2tzdW1Bc1N0cmluZ09jdGFsID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IHR5cGVGbGFnVmFsdWUgPSByZWFkZXIucmVhZFN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbmFtZU9mTGlua2VkRmlsZSA9IHJlYWRlci5yZWFkU3RyaW5nKDEwMCk7XG4gICAgICAgIGNvbnN0IHVTdGFySW5kaWNhdG9yID0gcmVhZGVyLnJlYWRTdHJpbmcoNik7XG4gICAgICAgIGNvbnN0IHVTdGFyVmVyc2lvbiA9IHJlYWRlci5yZWFkU3RyaW5nKDIpO1xuICAgICAgICBjb25zdCB1c2VyTmFtZU9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZygzMik7XG4gICAgICAgIGNvbnN0IGdyb3VwTmFtZU9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZygzMik7XG4gICAgICAgIGNvbnN0IGRldmljZU51bWJlck1ham9yID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IGRldmljZU51bWJlck1pbm9yID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lUHJlZml4ID0gcmVhZGVyLnJlYWRTdHJpbmcoMTU1KTtcbiAgICAgICAgY29uc3QgcmVzZXJ2ZWQgPSByZWFkZXIucmVhZEJ5dGVzKDEyKTtcbiAgICAgICAgY29uc3QgZmlsZVNpemVJbkJ5dGVzID0gcGFyc2VJbnQoZmlsZVNpemVJbkJ5dGVzQXNTdHJpbmdPY3RhbC50cmltKCksIDgpO1xuICAgICAgICBjb25zdCBjaGVja3N1bSA9IHBhcnNlSW50KGNoZWNrc3VtQXNTdHJpbmdPY3RhbCwgOCk7XG4gICAgICAgIGNvbnN0IHR5cGVGbGFncyA9IFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5fQWxsO1xuICAgICAgICBjb25zdCB0eXBlRmxhZ0lEID0gJ18nICsgdHlwZUZsYWdWYWx1ZTtcbiAgICAgICAgY29uc3QgdHlwZUZsYWcgPSB0eXBlRmxhZ3NbdHlwZUZsYWdJRF07XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9IG5ldyBUYXJGaWxlRW50cnlIZWFkZXIoZmlsZU5hbWUsIGZpbGVNb2RlLCB1c2VySURPZk93bmVyLCB1c2VySURPZkdyb3VwLCBmaWxlU2l6ZUluQnl0ZXMsIHRpbWVNb2RpZmllZEluVW5peEZvcm1hdCwgY2hlY2tzdW0sIHR5cGVGbGFnLCBuYW1lT2ZMaW5rZWRGaWxlLCB1U3RhckluZGljYXRvciwgdVN0YXJWZXJzaW9uLCB1c2VyTmFtZU9mT3duZXIsIGdyb3VwTmFtZU9mT3duZXIsIGRldmljZU51bWJlck1ham9yLCBkZXZpY2VOdW1iZXJNaW5vciwgZmlsZW5hbWVQcmVmaXgpO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxuICAgIC8vIGluc3RhbmNlIG1ldGhvZHNcbiAgICAvLyBjaGVja3N1bUNhbGN1bGF0ZSgpIHtcbiAgICAvLyBcdGNvbnN0IHRoaXNBc0J5dGVzID0gdGhpcy50b0J5dGVzKClcbiAgICAvLyBcdC8vIFRoZSBjaGVja3N1bSBpcyB0aGUgc3VtIG9mIGFsbCBieXRlcyBpbiB0aGUgaGVhZGVyLFxuICAgIC8vIFx0Ly8gZXhjZXB0IHdlIG9idmlvdXNseSBjYW4ndCBpbmNsdWRlIHRoZSBjaGVja3N1bSBpdHNlbGYuXG4gICAgLy8gXHQvLyBTbyBpdCdzIGFzc3VtZWQgdGhhdCBhbGwgOCBvZiBjaGVja3N1bSdzIGJ5dGVzIGFyZSBzcGFjZXMgKDB4MjA9MzIpLlxuICAgIC8vIFx0Ly8gU28gd2UgbmVlZCB0byBzZXQgdGhpcyBtYW51YWxseS5cbiAgICAvLyBcdGNvbnN0IG9mZnNldE9mQ2hlY2tzdW1JbkJ5dGVzID0gMTQ4XG4gICAgLy8gXHRjb25zdCBudW1iZXJPZkJ5dGVzSW5DaGVja3N1bSA9IDhcbiAgICAvLyBcdGNvbnN0IHByZXN1bWVkVmFsdWVPZkVhY2hDaGVja3N1bUJ5dGUgPSAnICcuY2hhckNvZGVBdCgwKVxuICAgIC8vIFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkJ5dGVzSW5DaGVja3N1bTsgaSsrKSB7XG4gICAgLy8gXHRcdGNvbnN0IG9mZnNldE9mQnl0ZSA9IG9mZnNldE9mQ2hlY2tzdW1JbkJ5dGVzICsgaVxuICAgIC8vIFx0XHR0aGlzQXNCeXRlc1tvZmZzZXRPZkJ5dGVdID0gcHJlc3VtZWRWYWx1ZU9mRWFjaENoZWNrc3VtQnl0ZVxuICAgIC8vIFx0fVxuICAgIC8vIFx0bGV0IGNoZWNrc3VtU29GYXIgPSAwXG4gICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNBc0J5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gXHRcdGNvbnN0IGJ5dGVUb0FkZCA9IHRoaXNBc0J5dGVzW2ldXG4gICAgLy8gXHRcdGNoZWNrc3VtU29GYXIgKz0gYnl0ZVRvQWRkXG4gICAgLy8gXHR9XG4gICAgLy8gXHR0aGlzLmNoZWNrc3VtID0gY2hlY2tzdW1Tb0ZhclxuICAgIC8vIFx0cmV0dXJuIHRoaXMuY2hlY2tzdW1cbiAgICAvLyB9XG4gICAgLy8gdG9CeXRlcygpIHtcbiAgICAvLyBcdGlmICghdGhpcy50eXBlRmxhZykge1xuICAgIC8vIFx0XHR0aHJvdyBFcnJvcignV3JpdGluZyB3aXRob3V0IGEgdHlwZSBmbGFnLiAnKVxuICAgIC8vIFx0fVxuICAgIC8vIFx0Y29uc3QgaGVhZGVyQXNCeXRlczogbnVtYmVyW10gPSBbXVxuICAgIC8vIFx0Y29uc3Qgd3JpdGVyID0gbmV3IEJ5dGVTdHJlYW0oaGVhZGVyQXNCeXRlcylcbiAgICAvLyBcdGNvbnN0IGZpbGVTaXplSW5CeXRlc0FzU3RyaW5nT2N0YWwgPSBwYWRMZWZ0KHRoaXMuZmlsZVNpemVJbkJ5dGVzLnRvU3RyaW5nKDgpICsgJ1xcMCcsIDEyLCAnMCcpXG4gICAgLy8gXHRjb25zdCBjaGVja3N1bUFzU3RyaW5nT2N0YWwgPSBwYWRMZWZ0KHRoaXMuY2hlY2tzdW0udG9TdHJpbmcoOCkgKyAnXFwwICcsIDgsICcwJylcbiAgICAvLyBcdHdyaXRlci53cml0ZVN0cmluZyh0aGlzLmZpbGVOYW1lLCAxMDApXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5maWxlTW9kZSwgOClcbiAgICAvLyBcdHdyaXRlci53cml0ZVN0cmluZyh0aGlzLnVzZXJJRE9mT3duZXIsIDgpXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy51c2VySURPZkdyb3VwLCA4KVxuICAgIC8vIFx0d3JpdGVyLndyaXRlU3RyaW5nKGZpbGVTaXplSW5CeXRlc0FzU3RyaW5nT2N0YWwsIDEyKVxuICAgIC8vIFx0d3JpdGVyLndyaXRlQnl0ZXModGhpcy50aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQpXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcoY2hlY2tzdW1Bc1N0cmluZ09jdGFsLCA4KVxuICAgIC8vIFx0d3JpdGVyLndyaXRlU3RyaW5nKHRoaXMudHlwZUZsYWcudmFsdWUsIDEpXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5uYW1lT2ZMaW5rZWRGaWxlLCAxMDApXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy51U3RhckluZGljYXRvciwgNilcbiAgICAvLyBcdHdyaXRlci53cml0ZVN0cmluZyh0aGlzLnVTdGFyVmVyc2lvbiwgMilcbiAgICAvLyBcdHdyaXRlci53cml0ZVN0cmluZyh0aGlzLnVzZXJOYW1lT2ZPd25lciwgMzIpXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5ncm91cE5hbWVPZk93bmVyLCAzMilcbiAgICAvLyBcdHdyaXRlci53cml0ZVN0cmluZyh0aGlzLmRldmljZU51bWJlck1ham9yLCA4KVxuICAgIC8vIFx0d3JpdGVyLndyaXRlU3RyaW5nKHRoaXMuZGV2aWNlTnVtYmVyTWlub3IsIDgpXG4gICAgLy8gXHR3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5maWxlbmFtZVByZWZpeCwgMTU1KVxuICAgIC8vIFx0d3JpdGVyLndyaXRlU3RyaW5nKHBhZFJpZ2h0KCcnLCAxMiwgJ1xcMCcpKSAvLyByZXNlcnZlZFxuICAgIC8vIFx0cmV0dXJuIGhlYWRlckFzQnl0ZXNcbiAgICAvLyB9XG4gICAgLy8gc3RyaW5nc1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBuZXdsaW5lID0gJ1xcbic7XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9ICdbVGFyRmlsZUVudHJ5SGVhZGVyICcgK1xuICAgICAgICAgICAgXCJmaWxlTmFtZT0nXCIgK1xuICAgICAgICAgICAgdGhpcy5maWxlTmFtZSArXG4gICAgICAgICAgICBcIicgXCIgK1xuICAgICAgICAgICAgXCJ0eXBlRmxhZz0nXCIgK1xuICAgICAgICAgICAgKHRoaXMudHlwZUZsYWcgPT0gbnVsbCA/ICdlcnInIDogdGhpcy50eXBlRmxhZy5uYW1lKSArXG4gICAgICAgICAgICBcIicgXCIgK1xuICAgICAgICAgICAgXCJmaWxlU2l6ZUluQnl0ZXM9J1wiICtcbiAgICAgICAgICAgIHRoaXMuZmlsZVNpemVJbkJ5dGVzICtcbiAgICAgICAgICAgIFwiJyBcIiArXG4gICAgICAgICAgICAnXScgK1xuICAgICAgICAgICAgbmV3bGluZTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbn1cblRhckZpbGVFbnRyeUhlYWRlci5GaWxlTmFtZU1heExlbmd0aCA9IDk5O1xuVGFyRmlsZUVudHJ5SGVhZGVyLlNpemVJbkJ5dGVzID0gNTAwO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VGFyRmlsZUVudHJ5SGVhZGVyLmpzLm1hcCIsImltcG9ydCB7IEJ5dGVIZWxwZXIgfSBmcm9tICcuL0J5dGVIZWxwZXInO1xuaW1wb3J0IHsgVGFyRmlsZSB9IGZyb20gJy4vVGFyRmlsZSc7XG5pbXBvcnQgeyBUYXJGaWxlRW50cnlIZWFkZXIgfSBmcm9tICcuL1RhckZpbGVFbnRyeUhlYWRlcic7XG5leHBvcnQgY2xhc3MgVGFyRmlsZUVudHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihoZWFkZXIsIGRhdGFBc0J5dGVzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVyID0gaGVhZGVyO1xuICAgICAgICB0aGlzLmRhdGFBc0J5dGVzID0gZGF0YUFzQnl0ZXM7XG4gICAgfVxuICAgIC8vIG1ldGhvZHNcbiAgICAvLyBzdGF0aWMgbWV0aG9kc1xuICAgIC8vIHN0YXRpYyBkaXJlY3RvcnlOZXcoZGlyZWN0b3J5TmFtZTogYW55KSB7XG4gICAgLy8gXHRjb25zdCBoZWFkZXIgPSBUYXJGaWxlRW50cnlIZWFkZXIuZGlyZWN0b3J5TmV3KGRpcmVjdG9yeU5hbWUpXG4gICAgLy8gXHRjb25zdCBlbnRyeSA9IG5ldyBUYXJGaWxlRW50cnkoaGVhZGVyLCBbXSlcbiAgICAvLyBcdHJldHVybiBlbnRyeVxuICAgIC8vIH1cbiAgICAvLyBzdGF0aWMgZmlsZU5ldyhmaWxlTmFtZTogc3RyaW5nLCBmaWxlQ29udGVudHNBc0J5dGVzOiBudW1iZXJbXSkge1xuICAgIC8vIFx0Y29uc3QgaGVhZGVyID0gVGFyRmlsZUVudHJ5SGVhZGVyLmZpbGVOZXcoZmlsZU5hbWUsIGZpbGVDb250ZW50c0FzQnl0ZXMpXG4gICAgLy8gXHRjb25zdCBlbnRyeSA9IG5ldyBUYXJGaWxlRW50cnkoaGVhZGVyLCBmaWxlQ29udGVudHNBc0J5dGVzKVxuICAgIC8vIFx0cmV0dXJuIGVudHJ5XG4gICAgLy8gfVxuICAgIHN0YXRpYyBmcm9tQnl0ZXMoY2h1bmtBc0J5dGVzLCByZWFkZXIpIHtcbiAgICAgICAgY29uc3QgY2h1bmtTaXplID0gVGFyRmlsZS5DaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IFRhckZpbGVFbnRyeUhlYWRlci5mcm9tQnl0ZXMoY2h1bmtBc0J5dGVzKTtcbiAgICAgICAgY29uc3Qgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkID0gaGVhZGVyLmZpbGVTaXplSW5CeXRlcztcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZDaHVua3NPY2N1cGllZEJ5RGF0YUVudHJ5ID0gTWF0aC5jZWlsKHNpemVPZkRhdGFFbnRyeUluQnl0ZXNVbnBhZGRlZCAvIGNodW5rU2l6ZSk7XG4gICAgICAgIGNvbnN0IHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQgPSBudW1iZXJPZkNodW5rc09jY3VwaWVkQnlEYXRhRW50cnkgKiBjaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGRhdGFBc0J5dGVzID0gcmVhZGVyXG4gICAgICAgICAgICAucmVhZEJ5dGVzKHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQpXG4gICAgICAgICAgICAuc2xpY2UoMCwgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkKTtcbiAgICAgICAgY29uc3QgZW50cnkgPSBuZXcgVGFyRmlsZUVudHJ5KGhlYWRlciwgZGF0YUFzQnl0ZXMpO1xuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfVxuICAgIC8vIHN0YXRpYyBtYW55RnJvbUJ5dGVBcnJheXMoXG4gICAgLy8gXHRmaWxlTmFtZVByZWZpeDogbnVtYmVyLFxuICAgIC8vIFx0ZmlsZU5hbWVTdWZmaXg6IGFueSxcbiAgICAvLyBcdGVudHJpZXNBc0J5dGVBcnJheXM6IHN0cmluZyB8IGFueVtdLFxuICAgIC8vICkge1xuICAgIC8vIFx0bGV0IHJldHVyblZhbHVlcyA9IFtdXG4gICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXNBc0J5dGVBcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBcdFx0Y29uc3QgZW50cnlBc0J5dGVzID0gZW50cmllc0FzQnl0ZUFycmF5c1tpXVxuICAgIC8vIFx0XHRjb25zdCBlbnRyeSA9IFRhckZpbGVFbnRyeS5maWxlTmV3KGZpbGVOYW1lUHJlZml4ICsgaSArIGZpbGVOYW1lU3VmZml4LCBlbnRyeUFzQnl0ZXMpXG4gICAgLy8gXHRcdHJldHVyblZhbHVlcy5wdXNoKGVudHJ5KVxuICAgIC8vIFx0fVxuICAgIC8vIFx0cmV0dXJuIHJldHVyblZhbHVlc1xuICAgIC8vIH1cbiAgICAvLyBpbnN0YW5jZSBtZXRob2RzXG4gICAgcmVtb3ZlKGV2ZW50KSB7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgeWV0IGltcGxlbWVudGVkIScpOyAvLyB0b2RvXG4gICAgfVxuICAgIC8vIHRvQnl0ZXMoKSB7XG4gICAgLy8gXHRsZXQgZW50cnlBc0J5dGVzOiBudW1iZXJbXSA9IFtdXG4gICAgLy8gXHRjb25zdCBjaHVua1NpemUgPSBUYXJGaWxlLkNodW5rU2l6ZVxuICAgIC8vIFx0Y29uc3QgaGVhZGVyQXNCeXRlcyA9IHRoaXMuaGVhZGVyLnRvQnl0ZXMoKVxuICAgIC8vIFx0ZW50cnlBc0J5dGVzID0gZW50cnlBc0J5dGVzLmNvbmNhdChoZWFkZXJBc0J5dGVzKVxuICAgIC8vIFx0ZW50cnlBc0J5dGVzID0gZW50cnlBc0J5dGVzLmNvbmNhdCh0aGlzLmRhdGFBc0J5dGVzKVxuICAgIC8vIFx0Y29uc3Qgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkID0gdGhpcy5oZWFkZXIuZmlsZVNpemVJbkJ5dGVzXG4gICAgLy8gXHRjb25zdCBudW1iZXJPZkNodW5rc09jY3VwaWVkQnlEYXRhRW50cnkgPSBNYXRoLmNlaWwoc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkIC8gY2h1bmtTaXplKVxuICAgIC8vIFx0Y29uc3Qgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1BhZGRlZCA9IG51bWJlck9mQ2h1bmtzT2NjdXBpZWRCeURhdGFFbnRyeSAqIGNodW5rU2l6ZVxuICAgIC8vIFx0Y29uc3QgbnVtYmVyT2ZCeXRlc09mUGFkZGluZyA9IHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQgLSBzaXplT2ZEYXRhRW50cnlJbkJ5dGVzVW5wYWRkZWRcbiAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZCeXRlc09mUGFkZGluZzsgaSsrKSB7XG4gICAgLy8gXHRcdGVudHJ5QXNCeXRlcy5wdXNoKDApXG4gICAgLy8gXHR9XG4gICAgLy8gXHRyZXR1cm4gZW50cnlBc0J5dGVzXG4gICAgLy8gfVxuICAgIC8vIHN0cmluZ3NcbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgY29uc3QgbmV3bGluZSA9ICdcXG4nO1xuICAgICAgICBjb25zdCBoZWFkZXJBc1N0cmluZyA9IHRoaXMuaGVhZGVyLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGRhdGFBc0hleGFkZWNpbWFsU3RyaW5nID0gQnl0ZUhlbHBlci5ieXRlc1RvU3RyaW5nVVRGOCh0aGlzLmRhdGFBc0J5dGVzKTtcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJ1tUYXJGaWxlRW50cnldJyArXG4gICAgICAgICAgICBuZXdsaW5lICtcbiAgICAgICAgICAgIGhlYWRlckFzU3RyaW5nICtcbiAgICAgICAgICAgICdbRGF0YV0nICtcbiAgICAgICAgICAgIGRhdGFBc0hleGFkZWNpbWFsU3RyaW5nICtcbiAgICAgICAgICAgICdbL0RhdGFdJyArXG4gICAgICAgICAgICBuZXdsaW5lICtcbiAgICAgICAgICAgICdbL1RhckZpbGVFbnRyeV0nICtcbiAgICAgICAgICAgIG5ld2xpbmU7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJGaWxlRW50cnkuanMubWFwIiwiaW1wb3J0IHsgQnl0ZVN0cmVhbSB9IGZyb20gJy4vQnl0ZVN0cmVhbSc7XG5pbXBvcnQgeyBUYXJGaWxlRW50cnkgfSBmcm9tICcuL1RhckZpbGVFbnRyeSc7XG5pbXBvcnQgeyBUYXJGaWxlVHlwZUZsYWcgfSBmcm9tICcuL1RhckZpbGVUeXBlRmxhZyc7XG5leHBvcnQgY2xhc3MgVGFyRmlsZSB7XG4gICAgY29uc3RydWN0b3IoZmlsZU5hbWUsIGVudHJpZXMpIHtcbiAgICAgICAgdGhpcy5maWxlTmFtZSA9IGZpbGVOYW1lO1xuICAgICAgICB0aGlzLmVudHJpZXMgPSBlbnRyaWVzO1xuICAgIH1cbiAgICAvLyBzdGF0aWMgbWV0aG9kc1xuICAgIHN0YXRpYyBmcm9tQnl0ZXMoZmlsZU5hbWUsIGJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBCeXRlU3RyZWFtKGJ5dGVzKTtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgICAgICBjb25zdCBjaHVua1NpemUgPSBUYXJGaWxlLkNodW5rU2l6ZTtcbiAgICAgICAgbGV0IG51bWJlck9mQ29uc2VjdXRpdmVaZXJvQ2h1bmtzID0gMDtcbiAgICAgICAgd2hpbGUgKHJlYWRlci5oYXNNb3JlQnl0ZXMoKSA9PSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0FzQnl0ZXMgPSByZWFkZXIucmVhZEJ5dGVzKGNodW5rU2l6ZSk7XG4gICAgICAgICAgICBsZXQgYXJlQWxsQnl0ZXNJbkNodW5rWmVyb2VzID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgY2h1bmtBc0J5dGVzLmxlbmd0aDsgYisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNodW5rQXNCeXRlc1tiXSAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZUFsbEJ5dGVzSW5DaHVua1plcm9lcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJlQWxsQnl0ZXNJbkNodW5rWmVyb2VzID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBudW1iZXJPZkNvbnNlY3V0aXZlWmVyb0NodW5rcysrO1xuICAgICAgICAgICAgICAgIGlmIChudW1iZXJPZkNvbnNlY3V0aXZlWmVyb0NodW5rcyA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlck9mQ29uc2VjdXRpdmVaZXJvQ2h1bmtzID0gMDtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeSA9IFRhckZpbGVFbnRyeS5mcm9tQnl0ZXMoY2h1bmtBc0J5dGVzLCByZWFkZXIpO1xuICAgICAgICAgICAgICAgIGVudHJpZXMucHVzaChlbnRyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gbmV3IFRhckZpbGUoZmlsZU5hbWUsIGVudHJpZXMpO1xuICAgICAgICByZXR1cm5WYWx1ZS5jb25zb2xpZGF0ZUxvbmdQYXRoRW50cmllcygpO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoZmlsZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUYXJGaWxlKGZpbGVOYW1lLCBbXSk7XG4gICAgfVxuICAgIC8vIGluc3RhbmNlIG1ldGhvZHNcbiAgICBjb25zb2xpZGF0ZUxvbmdQYXRoRW50cmllcygpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAvLyBUQVIgZmlsZSBlbnRyaWVzIHdpdGggcGF0aHMgbG9uZ2VyIHRoYW4gOTkgY2hhcnMgcmVxdWlyZSBjaGVhdGluZyxcbiAgICAgICAgLy8gYnkgcHJlcGVuZGluZyB0aGVtIHdpdGggYSBlbnRyeSBvZiB0eXBlIFwiTFwiIHdob3NlIGRhdGEgY29udGFpbnMgdGhlIHBhdGguXG4gICAgICAgIGNvbnN0IHR5cGVGbGFnTG9uZ1BhdGhOYW1lID0gVGFyRmlsZVR5cGVGbGFnLkluc3RhbmNlcygpLkxvbmdGaWxlUGF0aC5uYW1lO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gZW50cmllc1tpXTtcbiAgICAgICAgICAgIGlmICgoKF9hID0gZW50cnkuaGVhZGVyLnR5cGVGbGFnKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubmFtZSkgPT0gdHlwZUZsYWdMb25nUGF0aE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeU5leHQgPSBlbnRyaWVzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBlbnRyeU5leHQuaGVhZGVyLmZpbGVOYW1lID0gZW50cnkuZGF0YUFzQnl0ZXMucmVkdWNlKChhLCBiKSA9PiAoYSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGIpKSwgJycpO1xuICAgICAgICAgICAgICAgIC8vRHJvcCBhbGwgbnVsbCB0ZXJtaW5hdGluZyBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICBlbnRyeU5leHQuaGVhZGVyLmZpbGVOYW1lID0gZW50cnlOZXh0LmhlYWRlci5maWxlTmFtZS5yZXBsYWNlKC9cXDAvZywgJycpO1xuICAgICAgICAgICAgICAgIGVudHJpZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyB0b0J5dGVzKCkge1xuICAgIC8vIFx0dGhpcy50b0J5dGVzX1ByZXBlbmRMb25nUGF0aEVudHJpZXNBc05lZWRlZCgpXG4gICAgLy8gXHRsZXQgZmlsZUFzQnl0ZXM6IG51bWJlcltdID0gW11cbiAgICAvLyBcdC8vIGhhY2sgLSBGb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAgICAvLyBcdGNvbnN0IGVudHJpZXNBc0J5dGVBcnJheXMgPSB0aGlzLmVudHJpZXMubWFwKCh4KSA9PiB4LnRvQnl0ZXMoKSlcbiAgICAvLyBcdC8vIE5vdyB0aGF0IHdlJ3ZlIHdyaXR0ZW4gdGhlIGJ5dGVzIGZvciBsb25nIHBhdGggZW50cmllcyxcbiAgICAvLyBcdC8vIHB1dCBpdCBiYWNrIHRoZSB3YXkgaXQgd2FzLlxuICAgIC8vIFx0dGhpcy5jb25zb2xpZGF0ZUxvbmdQYXRoRW50cmllcygpXG4gICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXNBc0J5dGVBcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBcdFx0Y29uc3QgZW50cnlBc0J5dGVzID0gZW50cmllc0FzQnl0ZUFycmF5c1tpXVxuICAgIC8vIFx0XHRmaWxlQXNCeXRlcyA9IGZpbGVBc0J5dGVzLmNvbmNhdChlbnRyeUFzQnl0ZXMpXG4gICAgLy8gXHR9XG4gICAgLy8gXHRjb25zdCBjaHVua1NpemUgPSBUYXJGaWxlLkNodW5rU2l6ZVxuICAgIC8vIFx0Y29uc3QgbnVtYmVyT2ZaZXJvQ2h1bmtzVG9Xcml0ZSA9IDJcbiAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZaZXJvQ2h1bmtzVG9Xcml0ZTsgaSsrKSB7XG4gICAgLy8gXHRcdGZvciAobGV0IGIgPSAwOyBiIDwgY2h1bmtTaXplOyBiKyspIHtcbiAgICAvLyBcdFx0XHRmaWxlQXNCeXRlcy5wdXNoKDApXG4gICAgLy8gXHRcdH1cbiAgICAvLyBcdH1cbiAgICAvLyBcdHJldHVybiBmaWxlQXNCeXRlc1xuICAgIC8vIH1cbiAgICAvLyB0b0J5dGVzX1ByZXBlbmRMb25nUGF0aEVudHJpZXNBc05lZWRlZCgpIHtcbiAgICAvLyBcdC8vIFRBUiBmaWxlIGVudHJpZXMgd2l0aCBwYXRocyBsb25nZXIgdGhhbiA5OSBjaGFycyByZXF1aXJlIGNoZWF0aW5nLFxuICAgIC8vIFx0Ly8gYnkgcHJlcGVuZGluZyB0aGVtIHdpdGggYSBlbnRyeSBvZiB0eXBlIFwiTFwiIHdob3NlIGRhdGEgY29udGFpbnMgdGhlIHBhdGguXG4gICAgLy8gXHRjb25zdCB0eXBlRmxhZ0xvbmdQYXRoID0gVGFyRmlsZVR5cGVGbGFnLkluc3RhbmNlcygpLkxvbmdGaWxlUGF0aFxuICAgIC8vIFx0Y29uc3QgbWF4TGVuZ3RoID0gVGFyRmlsZUVudHJ5SGVhZGVyLkZpbGVOYW1lTWF4TGVuZ3RoXG4gICAgLy8gXHRjb25zdCBlbnRyaWVzID0gdGhpcy5lbnRyaWVzXG4gICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBcdFx0Y29uc3QgZW50cnkgPSBlbnRyaWVzW2ldXG4gICAgLy8gXHRcdGNvbnN0IGVudHJ5SGVhZGVyID0gZW50cnkuaGVhZGVyXG4gICAgLy8gXHRcdGNvbnN0IGVudHJ5RmlsZU5hbWUgPSBlbnRyeUhlYWRlci5maWxlTmFtZVxuICAgIC8vIFx0XHRpZiAoZW50cnlGaWxlTmFtZS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAvLyBcdFx0XHRjb25zdCBlbnRyeUZpbGVOYW1lQXNCeXRlcyA9IGVudHJ5RmlsZU5hbWUuc3BsaXQoJycpLm1hcCgoeDogc3RyaW5nKSA9PiB4LmNoYXJDb2RlQXQoMCkpXG4gICAgLy8gXHRcdFx0Y29uc3QgZW50cnlDb250YWluaW5nTG9uZ1BhdGhUb1ByZXBlbmQgPSBUYXJGaWxlRW50cnkuZmlsZU5ldyhcbiAgICAvLyBcdFx0XHRcdHR5cGVGbGFnTG9uZ1BhdGgubmFtZSxcbiAgICAvLyBcdFx0XHRcdGVudHJ5RmlsZU5hbWVBc0J5dGVzLFxuICAgIC8vIFx0XHRcdClcbiAgICAvLyBcdFx0XHRlbnRyeUNvbnRhaW5pbmdMb25nUGF0aFRvUHJlcGVuZC5oZWFkZXIudHlwZUZsYWcgPSB0eXBlRmxhZ0xvbmdQYXRoXG4gICAgLy8gXHRcdFx0ZW50cnlDb250YWluaW5nTG9uZ1BhdGhUb1ByZXBlbmQuaGVhZGVyLnRpbWVNb2RpZmllZEluVW5peEZvcm1hdCA9XG4gICAgLy8gXHRcdFx0XHRlbnRyeUhlYWRlci50aW1lTW9kaWZpZWRJblVuaXhGb3JtYXRcbiAgICAvLyBcdFx0XHRlbnRyeUNvbnRhaW5pbmdMb25nUGF0aFRvUHJlcGVuZC5oZWFkZXIuY2hlY2tzdW1DYWxjdWxhdGUoKVxuICAgIC8vIFx0XHRcdGVudHJ5SGVhZGVyLmZpbGVOYW1lID0gZW50cnlGaWxlTmFtZS5zdWJzdHIoMCwgbWF4TGVuZ3RoKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoMClcbiAgICAvLyBcdFx0XHRlbnRyaWVzLnNwbGljZShpLCAwLCBlbnRyeUNvbnRhaW5pbmdMb25nUGF0aFRvUHJlcGVuZClcbiAgICAvLyBcdFx0XHRpKytcbiAgICAvLyBcdFx0fVxuICAgIC8vIFx0fVxuICAgIC8vIH1cbiAgICAvLyBzdHJpbmdzXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IG5ld2xpbmUgPSAnXFxuJztcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJ1tUYXJGaWxlXScgKyBuZXdsaW5lO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNbaV07XG4gICAgICAgICAgICBjb25zdCBlbnRyeUFzU3RyaW5nID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVyblZhbHVlICs9IGVudHJ5QXNTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuVmFsdWUgKz0gJ1svVGFyRmlsZV0nICsgbmV3bGluZTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbn1cbi8vIGNvbnN0YW50c1xuVGFyRmlsZS5DaHVua1NpemUgPSA1MTI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJGaWxlLmpzLm1hcCIsImltcG9ydCB7IFRhckZpbGUgfSBmcm9tICcuL1RhckZpbGUnO1xuZXhwb3J0IGNvbnN0IHJlYWRUYXIgPSAodGFyYmFsbCkgPT4ge1xuICAgIHJldHVybiBUYXJGaWxlLmZyb21CeXRlcygnbXlfdGFyJywgdGFyYmFsbCk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbXSwibWFw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
