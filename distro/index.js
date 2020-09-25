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
            let returnValue = new Array(numberOfBytesToRead);
            for (let b = 0; b < numberOfBytesToRead; b++) {
                returnValue[b] = this.readByte();
            }
            return returnValue;
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
        writeBytes(bytesToWrite) {
            for (let b = 0; b < bytesToWrite.length; b++) {
                this.bytes.push(bytesToWrite[b]);
            }
            this.byteIndexCurrent = this.bytes.length;
        }
        writeByte(byteToWrite) {
            this.bytes.push(byteToWrite);
            this.byteIndexCurrent++;
        }
        writeString(stringToWrite, lengthPadded) {
            for (let i = 0; i < stringToWrite.length; i++) {
                const charAsByte = stringToWrite.charCodeAt(i);
                this.writeByte(charAsByte);
            }
            if (lengthPadded) {
                const numberOfPaddingChars = lengthPadded - stringToWrite.length;
                for (let i = 0; i < numberOfPaddingChars; i++) {
                    this.writeByte(0);
                }
            }
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

    const padLeft = (string, lengthToPadTo, charToPadWith) => {
        let returnValue = string;
        while (returnValue.length < lengthToPadTo) {
            returnValue = charToPadWith + returnValue;
        }
        return returnValue;
    };
    const padRight = (string, lengthToPadTo, charToPadWith) => {
        let returnValue = string;
        while (returnValue.length < lengthToPadTo) {
            returnValue += charToPadWith;
        }
        return returnValue;
    };

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
        static default() {
            const now = +new Date();
            const unixEpoch = +new Date(1970, 1, 1);
            const millisecondsSinceUnixEpoch = now - unixEpoch;
            const secondsSinceUnixEpoch = Math.floor(millisecondsSinceUnixEpoch / 1000);
            const secondsSinceUnixEpochAsStringOctal = padRight(secondsSinceUnixEpoch.toString(8), 12, '\0');
            const timeModifiedInUnixFormat = [];
            for (let i = 0; i < secondsSinceUnixEpochAsStringOctal.length; i++) {
                const digitAsASCIICode = secondsSinceUnixEpochAsStringOctal.charCodeAt(i);
                timeModifiedInUnixFormat.push(digitAsASCIICode);
            }
            let returnValue = new TarFileEntryHeader(padRight('', 100, '\0'), // fileName
            '0100777', // fileMode
            '0000000', // userIDOfOwner
            '0000000', // userIDOfGroup
            0, // fileSizeInBytes
            timeModifiedInUnixFormat, 0, // checksum
            TarFileTypeFlag.Instances().Normal, '', // nameOfLinkedFile,
            'ustar', // uStarIndicator,
            '00', // uStarVersion,
            '', // userNameOfOwner,
            '', // groupNameOfOwner,
            '', // deviceNumberMajor,
            '', // deviceNumberMinor,
            '');
            return returnValue;
        }
        static directoryNew(directoryName) {
            const header = TarFileEntryHeader.default();
            header.fileName = directoryName;
            header.typeFlag = TarFileTypeFlag.Instances().Directory;
            header.fileSizeInBytes = 0;
            header.checksumCalculate();
            return header;
        }
        static fileNew(fileName, fileContentsAsBytes) {
            const header = TarFileEntryHeader.default();
            header.fileName = fileName;
            header.typeFlag = TarFileTypeFlag.Instances().Normal;
            header.fileSizeInBytes = fileContentsAsBytes.length;
            header.checksumCalculate();
            return header;
        }
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
        checksumCalculate() {
            const thisAsBytes = this.toBytes();
            // The checksum is the sum of all bytes in the header,
            // except we obviously can't include the checksum itself.
            // So it's assumed that all 8 of checksum's bytes are spaces (0x20=32).
            // So we need to set this manually.
            const offsetOfChecksumInBytes = 148;
            const numberOfBytesInChecksum = 8;
            const presumedValueOfEachChecksumByte = ' '.charCodeAt(0);
            for (let i = 0; i < numberOfBytesInChecksum; i++) {
                const offsetOfByte = offsetOfChecksumInBytes + i;
                thisAsBytes[offsetOfByte] = presumedValueOfEachChecksumByte;
            }
            let checksumSoFar = 0;
            for (let i = 0; i < thisAsBytes.length; i++) {
                const byteToAdd = thisAsBytes[i];
                checksumSoFar += byteToAdd;
            }
            this.checksum = checksumSoFar;
            return this.checksum;
        }
        toBytes() {
            if (!this.typeFlag) {
                throw Error('Writing without a type flag. ');
            }
            const headerAsBytes = [];
            const writer = new ByteStream(headerAsBytes);
            const fileSizeInBytesAsStringOctal = padLeft(this.fileSizeInBytes.toString(8) + '\0', 12, '0');
            const checksumAsStringOctal = padLeft(this.checksum.toString(8) + '\0 ', 8, '0');
            writer.writeString(this.fileName, 100);
            writer.writeString(this.fileMode, 8);
            writer.writeString(this.userIDOfOwner, 8);
            writer.writeString(this.userIDOfGroup, 8);
            writer.writeString(fileSizeInBytesAsStringOctal, 12);
            writer.writeBytes(this.timeModifiedInUnixFormat);
            writer.writeString(checksumAsStringOctal, 8);
            writer.writeString(this.typeFlag.value, 1);
            writer.writeString(this.nameOfLinkedFile, 100);
            writer.writeString(this.uStarIndicator, 6);
            writer.writeString(this.uStarVersion, 2);
            writer.writeString(this.userNameOfOwner, 32);
            writer.writeString(this.groupNameOfOwner, 32);
            writer.writeString(this.deviceNumberMajor, 8);
            writer.writeString(this.deviceNumberMinor, 8);
            writer.writeString(this.filenamePrefix, 155);
            writer.writeString(padRight('', 12, '\0')); // reserved
            return headerAsBytes;
        }
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
        static directoryNew(directoryName) {
            const header = TarFileEntryHeader.directoryNew(directoryName);
            const entry = new TarFileEntry(header, []);
            return entry;
        }
        static fileNew(fileName, fileContentsAsBytes) {
            const header = TarFileEntryHeader.fileNew(fileName, fileContentsAsBytes);
            const entry = new TarFileEntry(header, fileContentsAsBytes);
            return entry;
        }
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
        static manyFromByteArrays(fileNamePrefix, fileNameSuffix, entriesAsByteArrays) {
            let returnValues = [];
            for (let i = 0; i < entriesAsByteArrays.length; i++) {
                const entryAsBytes = entriesAsByteArrays[i];
                const entry = TarFileEntry.fileNew(fileNamePrefix + i + fileNameSuffix, entryAsBytes);
                returnValues.push(entry);
            }
            return returnValues;
        }
        // instance methods
        remove(event) {
            throw Error('Not yet implemented!'); // todo
        }
        toBytes() {
            let entryAsBytes = [];
            const chunkSize = TarFile.ChunkSize;
            const headerAsBytes = this.header.toBytes();
            entryAsBytes = entryAsBytes.concat(headerAsBytes);
            entryAsBytes = entryAsBytes.concat(this.dataAsBytes);
            const sizeOfDataEntryInBytesUnpadded = this.header.fileSizeInBytes;
            const numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize);
            const sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize;
            const numberOfBytesOfPadding = sizeOfDataEntryInBytesPadded - sizeOfDataEntryInBytesUnpadded;
            for (let i = 0; i < numberOfBytesOfPadding; i++) {
                entryAsBytes.push(0);
            }
            return entryAsBytes;
        }
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
        toBytes() {
            this.toBytes_PrependLongPathEntriesAsNeeded();
            let fileAsBytes = [];
            // hack - For easier debugging.
            const entriesAsByteArrays = this.entries.map((x) => x.toBytes());
            // Now that we've written the bytes for long path entries,
            // put it back the way it was.
            this.consolidateLongPathEntries();
            for (let i = 0; i < entriesAsByteArrays.length; i++) {
                const entryAsBytes = entriesAsByteArrays[i];
                fileAsBytes = fileAsBytes.concat(entryAsBytes);
            }
            const chunkSize = TarFile.ChunkSize;
            const numberOfZeroChunksToWrite = 2;
            for (let i = 0; i < numberOfZeroChunksToWrite; i++) {
                for (let b = 0; b < chunkSize; b++) {
                    fileAsBytes.push(0);
                }
            }
            return fileAsBytes;
        }
        toBytes_PrependLongPathEntriesAsNeeded() {
            // TAR file entries with paths longer than 99 chars require cheating,
            // by prepending them with a entry of type "L" whose data contains the path.
            const typeFlagLongPath = TarFileTypeFlag.Instances().LongFilePath;
            const maxLength = TarFileEntryHeader.FileNameMaxLength;
            const entries = this.entries;
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const entryHeader = entry.header;
                const entryFileName = entryHeader.fileName;
                if (entryFileName.length > maxLength) {
                    const entryFileNameAsBytes = entryFileName.split('').map((x) => x.charCodeAt(0));
                    const entryContainingLongPathToPrepend = TarFileEntry.fileNew(typeFlagLongPath.name, entryFileNameAsBytes);
                    entryContainingLongPathToPrepend.header.typeFlag = typeFlagLongPath;
                    entryContainingLongPathToPrepend.header.timeModifiedInUnixFormat =
                        entryHeader.timeModifiedInUnixFormat;
                    entryContainingLongPathToPrepend.header.checksumCalculate();
                    entryHeader.fileName = entryFileName.substr(0, maxLength) + String.fromCharCode(0);
                    entries.splice(i, 0, entryContainingLongPathToPrepend);
                    i++;
                }
            }
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2J1aWxkL0J5dGVTdHJlYW0uanMiLCIuLi9idWlsZC9CeXRlSGVscGVyLmpzIiwiLi4vYnVpbGQvU3RyaW5nRXh0ZW5zaW9ucy5qcyIsIi4uL2J1aWxkL1RhckZpbGVUeXBlRmxhZy5qcyIsIi4uL2J1aWxkL1RhckZpbGVFbnRyeUhlYWRlci5qcyIsIi4uL2J1aWxkL1RhckZpbGVFbnRyeS5qcyIsIi4uL2J1aWxkL1RhckZpbGUuanMiLCIuLi9idWlsZC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQnl0ZVN0cmVhbSB7XG4gICAgY29uc3RydWN0b3IoYnl0ZXMpIHtcbiAgICAgICAgdGhpcy5ieXRlcyA9IGJ5dGVzO1xuICAgICAgICB0aGlzLmJ5dGVJbmRleEN1cnJlbnQgPSAwO1xuICAgIH1cbiAgICAvLyBpbnN0YW5jZSBtZXRob2RzXG4gICAgaGFzTW9yZUJ5dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ieXRlSW5kZXhDdXJyZW50IDwgdGhpcy5ieXRlcy5sZW5ndGg7XG4gICAgfVxuICAgIHJlYWRCeXRlcyhudW1iZXJPZkJ5dGVzVG9SZWFkKSB7XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9IG5ldyBBcnJheShudW1iZXJPZkJ5dGVzVG9SZWFkKTtcbiAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBudW1iZXJPZkJ5dGVzVG9SZWFkOyBiKyspIHtcbiAgICAgICAgICAgIHJldHVyblZhbHVlW2JdID0gdGhpcy5yZWFkQnl0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gICAgcmVhZEJ5dGUoKSB7XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9IHRoaXMuYnl0ZXNbdGhpcy5ieXRlSW5kZXhDdXJyZW50XTtcbiAgICAgICAgdGhpcy5ieXRlSW5kZXhDdXJyZW50Kys7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gICAgcmVhZFN0cmluZyhsZW5ndGhPZlN0cmluZykge1xuICAgICAgICBsZXQgcmV0dXJuVmFsdWUgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGhPZlN0cmluZzsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBieXRlID0gdGhpcy5yZWFkQnl0ZSgpO1xuICAgICAgICAgICAgaWYgKGJ5dGUgIT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGVBc0NoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlICs9IGJ5dGVBc0NoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbiAgICB3cml0ZUJ5dGVzKGJ5dGVzVG9Xcml0ZSkge1xuICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGJ5dGVzVG9Xcml0ZS5sZW5ndGg7IGIrKykge1xuICAgICAgICAgICAgdGhpcy5ieXRlcy5wdXNoKGJ5dGVzVG9Xcml0ZVtiXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ieXRlSW5kZXhDdXJyZW50ID0gdGhpcy5ieXRlcy5sZW5ndGg7XG4gICAgfVxuICAgIHdyaXRlQnl0ZShieXRlVG9Xcml0ZSkge1xuICAgICAgICB0aGlzLmJ5dGVzLnB1c2goYnl0ZVRvV3JpdGUpO1xuICAgICAgICB0aGlzLmJ5dGVJbmRleEN1cnJlbnQrKztcbiAgICB9XG4gICAgd3JpdGVTdHJpbmcoc3RyaW5nVG9Xcml0ZSwgbGVuZ3RoUGFkZGVkKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nVG9Xcml0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hhckFzQnl0ZSA9IHN0cmluZ1RvV3JpdGUuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVCeXRlKGNoYXJBc0J5dGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGhQYWRkZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG51bWJlck9mUGFkZGluZ0NoYXJzID0gbGVuZ3RoUGFkZGVkIC0gc3RyaW5nVG9Xcml0ZS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mUGFkZGluZ0NoYXJzOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlQnl0ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJ5dGVTdHJlYW0uanMubWFwIiwiZXhwb3J0IGNsYXNzIEJ5dGVIZWxwZXIge1xuICAgIHN0YXRpYyBzdHJpbmdVVEY4VG9CeXRlcyhzdHJpbmdUb0NvbnZlcnQpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdUb0NvbnZlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGUgPSBzdHJpbmdUb0NvbnZlcnQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIGJ5dGVzLnB1c2goYnl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgICBzdGF0aWMgYnl0ZXNUb1N0cmluZ1VURjgoYnl0ZXNUb0NvbnZlcnQpIHtcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXNUb0NvbnZlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGUgPSBieXRlc1RvQ29udmVydFtpXTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVBc0NoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgKz0gYnl0ZUFzQ2hhcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Qnl0ZUhlbHBlci5qcy5tYXAiLCJleHBvcnQgY29uc3QgcGFkTGVmdCA9IChzdHJpbmcsIGxlbmd0aFRvUGFkVG8sIGNoYXJUb1BhZFdpdGgpID0+IHtcbiAgICBsZXQgcmV0dXJuVmFsdWUgPSBzdHJpbmc7XG4gICAgd2hpbGUgKHJldHVyblZhbHVlLmxlbmd0aCA8IGxlbmd0aFRvUGFkVG8pIHtcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBjaGFyVG9QYWRXaXRoICsgcmV0dXJuVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbn07XG5leHBvcnQgY29uc3QgcGFkUmlnaHQgPSAoc3RyaW5nLCBsZW5ndGhUb1BhZFRvLCBjaGFyVG9QYWRXaXRoKSA9PiB7XG4gICAgbGV0IHJldHVyblZhbHVlID0gc3RyaW5nO1xuICAgIHdoaWxlIChyZXR1cm5WYWx1ZS5sZW5ndGggPCBsZW5ndGhUb1BhZFRvKSB7XG4gICAgICAgIHJldHVyblZhbHVlICs9IGNoYXJUb1BhZFdpdGg7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdHJpbmdFeHRlbnNpb25zLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBUYXJGaWxlVHlwZUZsYWcge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pZCA9ICdfJyArIHRoaXMudmFsdWU7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgfVxuICAgIHN0YXRpYyBJbnN0YW5jZXMoKSB7XG4gICAgICAgIGlmIChUYXJGaWxlVHlwZUZsYWcuX2luc3RhbmNlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBUYXJGaWxlVHlwZUZsYWcuX2luc3RhbmNlcyA9IG5ldyBUYXJGaWxlVHlwZUZsYWdfSW5zdGFuY2VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFRhckZpbGVUeXBlRmxhZy5faW5zdGFuY2VzO1xuICAgIH1cbn1cbmNsYXNzIFRhckZpbGVUeXBlRmxhZ19JbnN0YW5jZXMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLk5vcm1hbCA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJzAnLCAnTm9ybWFsJyk7XG4gICAgICAgIHRoaXMuSGFyZExpbmsgPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCcxJywgJ0hhcmQgTGluaycpO1xuICAgICAgICB0aGlzLlN5bWJvbGljTGluayA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJzInLCAnU3ltYm9saWMgTGluaycpO1xuICAgICAgICB0aGlzLkNoYXJhY3RlclNwZWNpYWwgPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCczJywgJ0NoYXJhY3RlciBTcGVjaWFsJyk7XG4gICAgICAgIHRoaXMuQmxvY2tTcGVjaWFsID0gbmV3IFRhckZpbGVUeXBlRmxhZygnNCcsICdCbG9jayBTcGVjaWFsJyk7XG4gICAgICAgIHRoaXMuRGlyZWN0b3J5ID0gbmV3IFRhckZpbGVUeXBlRmxhZygnNScsICdEaXJlY3RvcnknKTtcbiAgICAgICAgdGhpcy5GSUZPID0gbmV3IFRhckZpbGVUeXBlRmxhZygnNicsICdGSUZPJyk7XG4gICAgICAgIHRoaXMuQ29udGlndW91c0ZpbGUgPSBuZXcgVGFyRmlsZVR5cGVGbGFnKCc3JywgJ0NvbnRpZ3VvdXMgRmlsZScpO1xuICAgICAgICB0aGlzLkxvbmdGaWxlUGF0aCA9IG5ldyBUYXJGaWxlVHlwZUZsYWcoJ0wnLCAnLi8uL0BMb25nTGluaycpO1xuICAgICAgICAvLyBBZGRpdGlvbmFsIHR5cGVzIG5vdCBpbXBsZW1lbnRlZDpcbiAgICAgICAgLy8gJ2cnIC0gZ2xvYmFsIGV4dGVuZGVkIGhlYWRlciB3aXRoIG1ldGEgZGF0YSAoUE9TSVguMS0yMDAxKVxuICAgICAgICAvLyAneCcgLSBleHRlbmRlZCBoZWFkZXIgd2l0aCBtZXRhIGRhdGEgZm9yIHRoZSBuZXh0IGZpbGUgaW4gdGhlIGFyY2hpdmUgKFBPU0lYLjEtMjAwMSlcbiAgICAgICAgLy8gJ0EnLSdaJyAtIFZlbmRvciBzcGVjaWZpYyBleHRlbnNpb25zIChQT1NJWC4xLTE5ODgpXG4gICAgICAgIC8vIFtvdGhlciB2YWx1ZXNdIC0gcmVzZXJ2ZWQgZm9yIGZ1dHVyZSBzdGFuZGFyZGl6YXRpb25cbiAgICAgICAgdGhpcy5fQWxsID0gW1xuICAgICAgICAgICAgdGhpcy5Ob3JtYWwsXG4gICAgICAgICAgICB0aGlzLkhhcmRMaW5rLFxuICAgICAgICAgICAgdGhpcy5TeW1ib2xpY0xpbmssXG4gICAgICAgICAgICB0aGlzLkNoYXJhY3RlclNwZWNpYWwsXG4gICAgICAgICAgICB0aGlzLkJsb2NrU3BlY2lhbCxcbiAgICAgICAgICAgIHRoaXMuRGlyZWN0b3J5LFxuICAgICAgICAgICAgdGhpcy5GSUZPLFxuICAgICAgICAgICAgdGhpcy5Db250aWd1b3VzRmlsZSxcbiAgICAgICAgICAgIHRoaXMuTG9uZ0ZpbGVQYXRoLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX0FsbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX0FsbFtpXTtcbiAgICAgICAgICAgIHRoaXMuX0FsbFtpdGVtLmlkXSA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJGaWxlVHlwZUZsYWcuanMubWFwIiwiaW1wb3J0IHsgQnl0ZVN0cmVhbSB9IGZyb20gJy4vQnl0ZVN0cmVhbSc7XG5pbXBvcnQgeyBwYWRMZWZ0LCBwYWRSaWdodCB9IGZyb20gJy4vU3RyaW5nRXh0ZW5zaW9ucyc7XG5pbXBvcnQgeyBUYXJGaWxlVHlwZUZsYWcgfSBmcm9tICcuL1RhckZpbGVUeXBlRmxhZyc7XG5leHBvcnQgY2xhc3MgVGFyRmlsZUVudHJ5SGVhZGVyIHtcbiAgICBjb25zdHJ1Y3RvcihmaWxlTmFtZSwgZmlsZU1vZGUsIHVzZXJJRE9mT3duZXIsIHVzZXJJRE9mR3JvdXAsIGZpbGVTaXplSW5CeXRlcywgdGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0LCBjaGVja3N1bSwgdHlwZUZsYWcsIG5hbWVPZkxpbmtlZEZpbGUsIHVTdGFySW5kaWNhdG9yLCB1U3RhclZlcnNpb24sIHVzZXJOYW1lT2ZPd25lciwgZ3JvdXBOYW1lT2ZPd25lciwgZGV2aWNlTnVtYmVyTWFqb3IsIGRldmljZU51bWJlck1pbm9yLCBmaWxlbmFtZVByZWZpeCkge1xuICAgICAgICB0aGlzLmZpbGVOYW1lID0gZmlsZU5hbWU7XG4gICAgICAgIHRoaXMuZmlsZU1vZGUgPSBmaWxlTW9kZTtcbiAgICAgICAgdGhpcy51c2VySURPZk93bmVyID0gdXNlcklET2ZPd25lcjtcbiAgICAgICAgdGhpcy51c2VySURPZkdyb3VwID0gdXNlcklET2ZHcm91cDtcbiAgICAgICAgdGhpcy5maWxlU2l6ZUluQnl0ZXMgPSBmaWxlU2l6ZUluQnl0ZXM7XG4gICAgICAgIHRoaXMudGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0ID0gdGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0O1xuICAgICAgICB0aGlzLmNoZWNrc3VtID0gY2hlY2tzdW07XG4gICAgICAgIHRoaXMudHlwZUZsYWcgPSB0eXBlRmxhZztcbiAgICAgICAgdGhpcy5uYW1lT2ZMaW5rZWRGaWxlID0gbmFtZU9mTGlua2VkRmlsZTtcbiAgICAgICAgdGhpcy51U3RhckluZGljYXRvciA9IHVTdGFySW5kaWNhdG9yO1xuICAgICAgICB0aGlzLnVTdGFyVmVyc2lvbiA9IHVTdGFyVmVyc2lvbjtcbiAgICAgICAgdGhpcy51c2VyTmFtZU9mT3duZXIgPSB1c2VyTmFtZU9mT3duZXI7XG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lT2ZPd25lciA9IGdyb3VwTmFtZU9mT3duZXI7XG4gICAgICAgIHRoaXMuZGV2aWNlTnVtYmVyTWFqb3IgPSBkZXZpY2VOdW1iZXJNYWpvcjtcbiAgICAgICAgdGhpcy5kZXZpY2VOdW1iZXJNaW5vciA9IGRldmljZU51bWJlck1pbm9yO1xuICAgICAgICB0aGlzLmZpbGVuYW1lUHJlZml4ID0gZmlsZW5hbWVQcmVmaXg7XG4gICAgfVxuICAgIC8vIHN0YXRpYyBtZXRob2RzXG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCB1bml4RXBvY2ggPSArbmV3IERhdGUoMTk3MCwgMSwgMSk7XG4gICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kc1NpbmNlVW5peEVwb2NoID0gbm93IC0gdW5peEVwb2NoO1xuICAgICAgICBjb25zdCBzZWNvbmRzU2luY2VVbml4RXBvY2ggPSBNYXRoLmZsb29yKG1pbGxpc2Vjb25kc1NpbmNlVW5peEVwb2NoIC8gMTAwMCk7XG4gICAgICAgIGNvbnN0IHNlY29uZHNTaW5jZVVuaXhFcG9jaEFzU3RyaW5nT2N0YWwgPSBwYWRSaWdodChzZWNvbmRzU2luY2VVbml4RXBvY2gudG9TdHJpbmcoOCksIDEyLCAnXFwwJyk7XG4gICAgICAgIGNvbnN0IHRpbWVNb2RpZmllZEluVW5peEZvcm1hdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlY29uZHNTaW5jZVVuaXhFcG9jaEFzU3RyaW5nT2N0YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRpZ2l0QXNBU0NJSUNvZGUgPSBzZWNvbmRzU2luY2VVbml4RXBvY2hBc1N0cmluZ09jdGFsLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICB0aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQucHVzaChkaWdpdEFzQVNDSUlDb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmV0dXJuVmFsdWUgPSBuZXcgVGFyRmlsZUVudHJ5SGVhZGVyKHBhZFJpZ2h0KCcnLCAxMDAsICdcXDAnKSwgLy8gZmlsZU5hbWVcbiAgICAgICAgJzAxMDA3NzcnLCAvLyBmaWxlTW9kZVxuICAgICAgICAnMDAwMDAwMCcsIC8vIHVzZXJJRE9mT3duZXJcbiAgICAgICAgJzAwMDAwMDAnLCAvLyB1c2VySURPZkdyb3VwXG4gICAgICAgIDAsIC8vIGZpbGVTaXplSW5CeXRlc1xuICAgICAgICB0aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQsIDAsIC8vIGNoZWNrc3VtXG4gICAgICAgIFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5Ob3JtYWwsICcnLCAvLyBuYW1lT2ZMaW5rZWRGaWxlLFxuICAgICAgICAndXN0YXInLCAvLyB1U3RhckluZGljYXRvcixcbiAgICAgICAgJzAwJywgLy8gdVN0YXJWZXJzaW9uLFxuICAgICAgICAnJywgLy8gdXNlck5hbWVPZk93bmVyLFxuICAgICAgICAnJywgLy8gZ3JvdXBOYW1lT2ZPd25lcixcbiAgICAgICAgJycsIC8vIGRldmljZU51bWJlck1ham9yLFxuICAgICAgICAnJywgLy8gZGV2aWNlTnVtYmVyTWlub3IsXG4gICAgICAgICcnKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbiAgICBzdGF0aWMgZGlyZWN0b3J5TmV3KGRpcmVjdG9yeU5hbWUpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gVGFyRmlsZUVudHJ5SGVhZGVyLmRlZmF1bHQoKTtcbiAgICAgICAgaGVhZGVyLmZpbGVOYW1lID0gZGlyZWN0b3J5TmFtZTtcbiAgICAgICAgaGVhZGVyLnR5cGVGbGFnID0gVGFyRmlsZVR5cGVGbGFnLkluc3RhbmNlcygpLkRpcmVjdG9yeTtcbiAgICAgICAgaGVhZGVyLmZpbGVTaXplSW5CeXRlcyA9IDA7XG4gICAgICAgIGhlYWRlci5jaGVja3N1bUNhbGN1bGF0ZSgpO1xuICAgICAgICByZXR1cm4gaGVhZGVyO1xuICAgIH1cbiAgICBzdGF0aWMgZmlsZU5ldyhmaWxlTmFtZSwgZmlsZUNvbnRlbnRzQXNCeXRlcykge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBUYXJGaWxlRW50cnlIZWFkZXIuZGVmYXVsdCgpO1xuICAgICAgICBoZWFkZXIuZmlsZU5hbWUgPSBmaWxlTmFtZTtcbiAgICAgICAgaGVhZGVyLnR5cGVGbGFnID0gVGFyRmlsZVR5cGVGbGFnLkluc3RhbmNlcygpLk5vcm1hbDtcbiAgICAgICAgaGVhZGVyLmZpbGVTaXplSW5CeXRlcyA9IGZpbGVDb250ZW50c0FzQnl0ZXMubGVuZ3RoO1xuICAgICAgICBoZWFkZXIuY2hlY2tzdW1DYWxjdWxhdGUoKTtcbiAgICAgICAgcmV0dXJuIGhlYWRlcjtcbiAgICB9XG4gICAgc3RhdGljIGZyb21CeXRlcyhieXRlcykge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgQnl0ZVN0cmVhbShieXRlcyk7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gcmVhZGVyLnJlYWRTdHJpbmcoMTAwKS50cmltKCk7XG4gICAgICAgIGNvbnN0IGZpbGVNb2RlID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IHVzZXJJRE9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZyg4KTtcbiAgICAgICAgY29uc3QgdXNlcklET2ZHcm91cCA9IHJlYWRlci5yZWFkU3RyaW5nKDgpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZUluQnl0ZXNBc1N0cmluZ09jdGFsID0gcmVhZGVyLnJlYWRTdHJpbmcoMTIpO1xuICAgICAgICBjb25zdCB0aW1lTW9kaWZpZWRJblVuaXhGb3JtYXQgPSByZWFkZXIucmVhZEJ5dGVzKDEyKTtcbiAgICAgICAgY29uc3QgY2hlY2tzdW1Bc1N0cmluZ09jdGFsID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IHR5cGVGbGFnVmFsdWUgPSByZWFkZXIucmVhZFN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbmFtZU9mTGlua2VkRmlsZSA9IHJlYWRlci5yZWFkU3RyaW5nKDEwMCk7XG4gICAgICAgIGNvbnN0IHVTdGFySW5kaWNhdG9yID0gcmVhZGVyLnJlYWRTdHJpbmcoNik7XG4gICAgICAgIGNvbnN0IHVTdGFyVmVyc2lvbiA9IHJlYWRlci5yZWFkU3RyaW5nKDIpO1xuICAgICAgICBjb25zdCB1c2VyTmFtZU9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZygzMik7XG4gICAgICAgIGNvbnN0IGdyb3VwTmFtZU9mT3duZXIgPSByZWFkZXIucmVhZFN0cmluZygzMik7XG4gICAgICAgIGNvbnN0IGRldmljZU51bWJlck1ham9yID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IGRldmljZU51bWJlck1pbm9yID0gcmVhZGVyLnJlYWRTdHJpbmcoOCk7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lUHJlZml4ID0gcmVhZGVyLnJlYWRTdHJpbmcoMTU1KTtcbiAgICAgICAgY29uc3QgcmVzZXJ2ZWQgPSByZWFkZXIucmVhZEJ5dGVzKDEyKTtcbiAgICAgICAgY29uc3QgZmlsZVNpemVJbkJ5dGVzID0gcGFyc2VJbnQoZmlsZVNpemVJbkJ5dGVzQXNTdHJpbmdPY3RhbC50cmltKCksIDgpO1xuICAgICAgICBjb25zdCBjaGVja3N1bSA9IHBhcnNlSW50KGNoZWNrc3VtQXNTdHJpbmdPY3RhbCwgOCk7XG4gICAgICAgIGNvbnN0IHR5cGVGbGFncyA9IFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5fQWxsO1xuICAgICAgICBjb25zdCB0eXBlRmxhZ0lEID0gJ18nICsgdHlwZUZsYWdWYWx1ZTtcbiAgICAgICAgY29uc3QgdHlwZUZsYWcgPSB0eXBlRmxhZ3NbdHlwZUZsYWdJRF07XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZSA9IG5ldyBUYXJGaWxlRW50cnlIZWFkZXIoZmlsZU5hbWUsIGZpbGVNb2RlLCB1c2VySURPZk93bmVyLCB1c2VySURPZkdyb3VwLCBmaWxlU2l6ZUluQnl0ZXMsIHRpbWVNb2RpZmllZEluVW5peEZvcm1hdCwgY2hlY2tzdW0sIHR5cGVGbGFnLCBuYW1lT2ZMaW5rZWRGaWxlLCB1U3RhckluZGljYXRvciwgdVN0YXJWZXJzaW9uLCB1c2VyTmFtZU9mT3duZXIsIGdyb3VwTmFtZU9mT3duZXIsIGRldmljZU51bWJlck1ham9yLCBkZXZpY2VOdW1iZXJNaW5vciwgZmlsZW5hbWVQcmVmaXgpO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxuICAgIC8vIGluc3RhbmNlIG1ldGhvZHNcbiAgICBjaGVja3N1bUNhbGN1bGF0ZSgpIHtcbiAgICAgICAgY29uc3QgdGhpc0FzQnl0ZXMgPSB0aGlzLnRvQnl0ZXMoKTtcbiAgICAgICAgLy8gVGhlIGNoZWNrc3VtIGlzIHRoZSBzdW0gb2YgYWxsIGJ5dGVzIGluIHRoZSBoZWFkZXIsXG4gICAgICAgIC8vIGV4Y2VwdCB3ZSBvYnZpb3VzbHkgY2FuJ3QgaW5jbHVkZSB0aGUgY2hlY2tzdW0gaXRzZWxmLlxuICAgICAgICAvLyBTbyBpdCdzIGFzc3VtZWQgdGhhdCBhbGwgOCBvZiBjaGVja3N1bSdzIGJ5dGVzIGFyZSBzcGFjZXMgKDB4MjA9MzIpLlxuICAgICAgICAvLyBTbyB3ZSBuZWVkIHRvIHNldCB0aGlzIG1hbnVhbGx5LlxuICAgICAgICBjb25zdCBvZmZzZXRPZkNoZWNrc3VtSW5CeXRlcyA9IDE0ODtcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZCeXRlc0luQ2hlY2tzdW0gPSA4O1xuICAgICAgICBjb25zdCBwcmVzdW1lZFZhbHVlT2ZFYWNoQ2hlY2tzdW1CeXRlID0gJyAnLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZCeXRlc0luQ2hlY2tzdW07IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0T2ZCeXRlID0gb2Zmc2V0T2ZDaGVja3N1bUluQnl0ZXMgKyBpO1xuICAgICAgICAgICAgdGhpc0FzQnl0ZXNbb2Zmc2V0T2ZCeXRlXSA9IHByZXN1bWVkVmFsdWVPZkVhY2hDaGVja3N1bUJ5dGU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoZWNrc3VtU29GYXIgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNBc0J5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBieXRlVG9BZGQgPSB0aGlzQXNCeXRlc1tpXTtcbiAgICAgICAgICAgIGNoZWNrc3VtU29GYXIgKz0gYnl0ZVRvQWRkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tzdW0gPSBjaGVja3N1bVNvRmFyO1xuICAgICAgICByZXR1cm4gdGhpcy5jaGVja3N1bTtcbiAgICB9XG4gICAgdG9CeXRlcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnR5cGVGbGFnKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignV3JpdGluZyB3aXRob3V0IGEgdHlwZSBmbGFnLiAnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJBc0J5dGVzID0gW107XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCeXRlU3RyZWFtKGhlYWRlckFzQnl0ZXMpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZUluQnl0ZXNBc1N0cmluZ09jdGFsID0gcGFkTGVmdCh0aGlzLmZpbGVTaXplSW5CeXRlcy50b1N0cmluZyg4KSArICdcXDAnLCAxMiwgJzAnKTtcbiAgICAgICAgY29uc3QgY2hlY2tzdW1Bc1N0cmluZ09jdGFsID0gcGFkTGVmdCh0aGlzLmNoZWNrc3VtLnRvU3RyaW5nKDgpICsgJ1xcMCAnLCA4LCAnMCcpO1xuICAgICAgICB3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5maWxlTmFtZSwgMTAwKTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMuZmlsZU1vZGUsIDgpO1xuICAgICAgICB3cml0ZXIud3JpdGVTdHJpbmcodGhpcy51c2VySURPZk93bmVyLCA4KTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMudXNlcklET2ZHcm91cCwgOCk7XG4gICAgICAgIHdyaXRlci53cml0ZVN0cmluZyhmaWxlU2l6ZUluQnl0ZXNBc1N0cmluZ09jdGFsLCAxMik7XG4gICAgICAgIHdyaXRlci53cml0ZUJ5dGVzKHRoaXMudGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0KTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKGNoZWNrc3VtQXNTdHJpbmdPY3RhbCwgOCk7XG4gICAgICAgIHdyaXRlci53cml0ZVN0cmluZyh0aGlzLnR5cGVGbGFnLnZhbHVlLCAxKTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMubmFtZU9mTGlua2VkRmlsZSwgMTAwKTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMudVN0YXJJbmRpY2F0b3IsIDYpO1xuICAgICAgICB3cml0ZXIud3JpdGVTdHJpbmcodGhpcy51U3RhclZlcnNpb24sIDIpO1xuICAgICAgICB3cml0ZXIud3JpdGVTdHJpbmcodGhpcy51c2VyTmFtZU9mT3duZXIsIDMyKTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMuZ3JvdXBOYW1lT2ZPd25lciwgMzIpO1xuICAgICAgICB3cml0ZXIud3JpdGVTdHJpbmcodGhpcy5kZXZpY2VOdW1iZXJNYWpvciwgOCk7XG4gICAgICAgIHdyaXRlci53cml0ZVN0cmluZyh0aGlzLmRldmljZU51bWJlck1pbm9yLCA4KTtcbiAgICAgICAgd3JpdGVyLndyaXRlU3RyaW5nKHRoaXMuZmlsZW5hbWVQcmVmaXgsIDE1NSk7XG4gICAgICAgIHdyaXRlci53cml0ZVN0cmluZyhwYWRSaWdodCgnJywgMTIsICdcXDAnKSk7IC8vIHJlc2VydmVkXG4gICAgICAgIHJldHVybiBoZWFkZXJBc0J5dGVzO1xuICAgIH1cbiAgICAvLyBzdHJpbmdzXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IG5ld2xpbmUgPSAnXFxuJztcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJ1tUYXJGaWxlRW50cnlIZWFkZXIgJyArXG4gICAgICAgICAgICBcImZpbGVOYW1lPSdcIiArXG4gICAgICAgICAgICB0aGlzLmZpbGVOYW1lICtcbiAgICAgICAgICAgIFwiJyBcIiArXG4gICAgICAgICAgICBcInR5cGVGbGFnPSdcIiArXG4gICAgICAgICAgICAodGhpcy50eXBlRmxhZyA9PSBudWxsID8gJ2VycicgOiB0aGlzLnR5cGVGbGFnLm5hbWUpICtcbiAgICAgICAgICAgIFwiJyBcIiArXG4gICAgICAgICAgICBcImZpbGVTaXplSW5CeXRlcz0nXCIgK1xuICAgICAgICAgICAgdGhpcy5maWxlU2l6ZUluQnl0ZXMgK1xuICAgICAgICAgICAgXCInIFwiICtcbiAgICAgICAgICAgICddJyArXG4gICAgICAgICAgICBuZXdsaW5lO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxufVxuVGFyRmlsZUVudHJ5SGVhZGVyLkZpbGVOYW1lTWF4TGVuZ3RoID0gOTk7XG5UYXJGaWxlRW50cnlIZWFkZXIuU2l6ZUluQnl0ZXMgPSA1MDA7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJGaWxlRW50cnlIZWFkZXIuanMubWFwIiwiaW1wb3J0IHsgQnl0ZUhlbHBlciB9IGZyb20gJy4vQnl0ZUhlbHBlcic7XG5pbXBvcnQgeyBUYXJGaWxlIH0gZnJvbSAnLi9UYXJGaWxlJztcbmltcG9ydCB7IFRhckZpbGVFbnRyeUhlYWRlciB9IGZyb20gJy4vVGFyRmlsZUVudHJ5SGVhZGVyJztcbmV4cG9ydCBjbGFzcyBUYXJGaWxlRW50cnkge1xuICAgIGNvbnN0cnVjdG9yKGhlYWRlciwgZGF0YUFzQnl0ZXMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBoZWFkZXI7XG4gICAgICAgIHRoaXMuZGF0YUFzQnl0ZXMgPSBkYXRhQXNCeXRlcztcbiAgICB9XG4gICAgLy8gbWV0aG9kc1xuICAgIC8vIHN0YXRpYyBtZXRob2RzXG4gICAgc3RhdGljIGRpcmVjdG9yeU5ldyhkaXJlY3RvcnlOYW1lKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IFRhckZpbGVFbnRyeUhlYWRlci5kaXJlY3RvcnlOZXcoZGlyZWN0b3J5TmFtZSk7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gbmV3IFRhckZpbGVFbnRyeShoZWFkZXIsIFtdKTtcbiAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgIH1cbiAgICBzdGF0aWMgZmlsZU5ldyhmaWxlTmFtZSwgZmlsZUNvbnRlbnRzQXNCeXRlcykge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBUYXJGaWxlRW50cnlIZWFkZXIuZmlsZU5ldyhmaWxlTmFtZSwgZmlsZUNvbnRlbnRzQXNCeXRlcyk7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gbmV3IFRhckZpbGVFbnRyeShoZWFkZXIsIGZpbGVDb250ZW50c0FzQnl0ZXMpO1xuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tQnl0ZXMoY2h1bmtBc0J5dGVzLCByZWFkZXIpIHtcbiAgICAgICAgY29uc3QgY2h1bmtTaXplID0gVGFyRmlsZS5DaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IFRhckZpbGVFbnRyeUhlYWRlci5mcm9tQnl0ZXMoY2h1bmtBc0J5dGVzKTtcbiAgICAgICAgY29uc3Qgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkID0gaGVhZGVyLmZpbGVTaXplSW5CeXRlcztcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZDaHVua3NPY2N1cGllZEJ5RGF0YUVudHJ5ID0gTWF0aC5jZWlsKHNpemVPZkRhdGFFbnRyeUluQnl0ZXNVbnBhZGRlZCAvIGNodW5rU2l6ZSk7XG4gICAgICAgIGNvbnN0IHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQgPSBudW1iZXJPZkNodW5rc09jY3VwaWVkQnlEYXRhRW50cnkgKiBjaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGRhdGFBc0J5dGVzID0gcmVhZGVyXG4gICAgICAgICAgICAucmVhZEJ5dGVzKHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQpXG4gICAgICAgICAgICAuc2xpY2UoMCwgc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkKTtcbiAgICAgICAgY29uc3QgZW50cnkgPSBuZXcgVGFyRmlsZUVudHJ5KGhlYWRlciwgZGF0YUFzQnl0ZXMpO1xuICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgfVxuICAgIHN0YXRpYyBtYW55RnJvbUJ5dGVBcnJheXMoZmlsZU5hbWVQcmVmaXgsIGZpbGVOYW1lU3VmZml4LCBlbnRyaWVzQXNCeXRlQXJyYXlzKSB7XG4gICAgICAgIGxldCByZXR1cm5WYWx1ZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzQXNCeXRlQXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeUFzQnl0ZXMgPSBlbnRyaWVzQXNCeXRlQXJyYXlzW2ldO1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBUYXJGaWxlRW50cnkuZmlsZU5ldyhmaWxlTmFtZVByZWZpeCArIGkgKyBmaWxlTmFtZVN1ZmZpeCwgZW50cnlBc0J5dGVzKTtcbiAgICAgICAgICAgIHJldHVyblZhbHVlcy5wdXNoKGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWVzO1xuICAgIH1cbiAgICAvLyBpbnN0YW5jZSBtZXRob2RzXG4gICAgcmVtb3ZlKGV2ZW50KSB7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgeWV0IGltcGxlbWVudGVkIScpOyAvLyB0b2RvXG4gICAgfVxuICAgIHRvQnl0ZXMoKSB7XG4gICAgICAgIGxldCBlbnRyeUFzQnl0ZXMgPSBbXTtcbiAgICAgICAgY29uc3QgY2h1bmtTaXplID0gVGFyRmlsZS5DaHVua1NpemU7XG4gICAgICAgIGNvbnN0IGhlYWRlckFzQnl0ZXMgPSB0aGlzLmhlYWRlci50b0J5dGVzKCk7XG4gICAgICAgIGVudHJ5QXNCeXRlcyA9IGVudHJ5QXNCeXRlcy5jb25jYXQoaGVhZGVyQXNCeXRlcyk7XG4gICAgICAgIGVudHJ5QXNCeXRlcyA9IGVudHJ5QXNCeXRlcy5jb25jYXQodGhpcy5kYXRhQXNCeXRlcyk7XG4gICAgICAgIGNvbnN0IHNpemVPZkRhdGFFbnRyeUluQnl0ZXNVbnBhZGRlZCA9IHRoaXMuaGVhZGVyLmZpbGVTaXplSW5CeXRlcztcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZDaHVua3NPY2N1cGllZEJ5RGF0YUVudHJ5ID0gTWF0aC5jZWlsKHNpemVPZkRhdGFFbnRyeUluQnl0ZXNVbnBhZGRlZCAvIGNodW5rU2l6ZSk7XG4gICAgICAgIGNvbnN0IHNpemVPZkRhdGFFbnRyeUluQnl0ZXNQYWRkZWQgPSBudW1iZXJPZkNodW5rc09jY3VwaWVkQnlEYXRhRW50cnkgKiBjaHVua1NpemU7XG4gICAgICAgIGNvbnN0IG51bWJlck9mQnl0ZXNPZlBhZGRpbmcgPSBzaXplT2ZEYXRhRW50cnlJbkJ5dGVzUGFkZGVkIC0gc2l6ZU9mRGF0YUVudHJ5SW5CeXRlc1VucGFkZGVkO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mQnl0ZXNPZlBhZGRpbmc7IGkrKykge1xuICAgICAgICAgICAgZW50cnlBc0J5dGVzLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudHJ5QXNCeXRlcztcbiAgICB9XG4gICAgLy8gc3RyaW5nc1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBuZXdsaW5lID0gJ1xcbic7XG4gICAgICAgIGNvbnN0IGhlYWRlckFzU3RyaW5nID0gdGhpcy5oZWFkZXIudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgZGF0YUFzSGV4YWRlY2ltYWxTdHJpbmcgPSBCeXRlSGVscGVyLmJ5dGVzVG9TdHJpbmdVVEY4KHRoaXMuZGF0YUFzQnl0ZXMpO1xuICAgICAgICBsZXQgcmV0dXJuVmFsdWUgPSAnW1RhckZpbGVFbnRyeV0nICtcbiAgICAgICAgICAgIG5ld2xpbmUgK1xuICAgICAgICAgICAgaGVhZGVyQXNTdHJpbmcgK1xuICAgICAgICAgICAgJ1tEYXRhXScgK1xuICAgICAgICAgICAgZGF0YUFzSGV4YWRlY2ltYWxTdHJpbmcgK1xuICAgICAgICAgICAgJ1svRGF0YV0nICtcbiAgICAgICAgICAgIG5ld2xpbmUgK1xuICAgICAgICAgICAgJ1svVGFyRmlsZUVudHJ5XScgK1xuICAgICAgICAgICAgbmV3bGluZTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVRhckZpbGVFbnRyeS5qcy5tYXAiLCJpbXBvcnQgeyBCeXRlU3RyZWFtIH0gZnJvbSAnLi9CeXRlU3RyZWFtJztcbmltcG9ydCB7IFRhckZpbGVFbnRyeSB9IGZyb20gJy4vVGFyRmlsZUVudHJ5JztcbmltcG9ydCB7IFRhckZpbGVFbnRyeUhlYWRlciB9IGZyb20gJy4vVGFyRmlsZUVudHJ5SGVhZGVyJztcbmltcG9ydCB7IFRhckZpbGVUeXBlRmxhZyB9IGZyb20gJy4vVGFyRmlsZVR5cGVGbGFnJztcbmV4cG9ydCBjbGFzcyBUYXJGaWxlIHtcbiAgICBjb25zdHJ1Y3RvcihmaWxlTmFtZSwgZW50cmllcykge1xuICAgICAgICB0aGlzLmZpbGVOYW1lID0gZmlsZU5hbWU7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IGVudHJpZXM7XG4gICAgfVxuICAgIC8vIHN0YXRpYyBtZXRob2RzXG4gICAgc3RhdGljIGZyb21CeXRlcyhmaWxlTmFtZSwgYnl0ZXMpIHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEJ5dGVTdHJlYW0oYnl0ZXMpO1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gW107XG4gICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IFRhckZpbGUuQ2h1bmtTaXplO1xuICAgICAgICBsZXQgbnVtYmVyT2ZDb25zZWN1dGl2ZVplcm9DaHVua3MgPSAwO1xuICAgICAgICB3aGlsZSAocmVhZGVyLmhhc01vcmVCeXRlcygpID09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rQXNCeXRlcyA9IHJlYWRlci5yZWFkQnl0ZXMoY2h1bmtTaXplKTtcbiAgICAgICAgICAgIGxldCBhcmVBbGxCeXRlc0luQ2h1bmtaZXJvZXMgPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGIgPCBjaHVua0FzQnl0ZXMubGVuZ3RoOyBiKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmtBc0J5dGVzW2JdICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXJlQWxsQnl0ZXNJbkNodW5rWmVyb2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmVBbGxCeXRlc0luQ2h1bmtaZXJvZXMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG51bWJlck9mQ29uc2VjdXRpdmVaZXJvQ2h1bmtzKys7XG4gICAgICAgICAgICAgICAgaWYgKG51bWJlck9mQ29uc2VjdXRpdmVaZXJvQ2h1bmtzID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZDb25zZWN1dGl2ZVplcm9DaHVua3MgPSAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gVGFyRmlsZUVudHJ5LmZyb21CeXRlcyhjaHVua0FzQnl0ZXMsIHJlYWRlcik7XG4gICAgICAgICAgICAgICAgZW50cmllcy5wdXNoKGVudHJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgcmV0dXJuVmFsdWUgPSBuZXcgVGFyRmlsZShmaWxlTmFtZSwgZW50cmllcyk7XG4gICAgICAgIHJldHVyblZhbHVlLmNvbnNvbGlkYXRlTG9uZ1BhdGhFbnRyaWVzKCk7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShmaWxlTmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFRhckZpbGUoZmlsZU5hbWUsIFtdKTtcbiAgICB9XG4gICAgLy8gaW5zdGFuY2UgbWV0aG9kc1xuICAgIGNvbnNvbGlkYXRlTG9uZ1BhdGhFbnRyaWVzKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIC8vIFRBUiBmaWxlIGVudHJpZXMgd2l0aCBwYXRocyBsb25nZXIgdGhhbiA5OSBjaGFycyByZXF1aXJlIGNoZWF0aW5nLFxuICAgICAgICAvLyBieSBwcmVwZW5kaW5nIHRoZW0gd2l0aCBhIGVudHJ5IG9mIHR5cGUgXCJMXCIgd2hvc2UgZGF0YSBjb250YWlucyB0aGUgcGF0aC5cbiAgICAgICAgY29uc3QgdHlwZUZsYWdMb25nUGF0aE5hbWUgPSBUYXJGaWxlVHlwZUZsYWcuSW5zdGFuY2VzKCkuTG9uZ0ZpbGVQYXRoLm5hbWU7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBlbnRyaWVzW2ldO1xuICAgICAgICAgICAgaWYgKCgoX2EgPSBlbnRyeS5oZWFkZXIudHlwZUZsYWcpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uYW1lKSA9PSB0eXBlRmxhZ0xvbmdQYXRoTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5TmV4dCA9IGVudHJpZXNbaSArIDFdO1xuICAgICAgICAgICAgICAgIGVudHJ5TmV4dC5oZWFkZXIuZmlsZU5hbWUgPSBlbnRyeS5kYXRhQXNCeXRlcy5yZWR1Y2UoKGEsIGIpID0+IChhICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYikpLCAnJyk7XG4gICAgICAgICAgICAgICAgLy9Ecm9wIGFsbCBudWxsIHRlcm1pbmF0aW5nIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGVudHJ5TmV4dC5oZWFkZXIuZmlsZU5hbWUgPSBlbnRyeU5leHQuaGVhZGVyLmZpbGVOYW1lLnJlcGxhY2UoL1xcMC9nLCAnJyk7XG4gICAgICAgICAgICAgICAgZW50cmllcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRvQnl0ZXMoKSB7XG4gICAgICAgIHRoaXMudG9CeXRlc19QcmVwZW5kTG9uZ1BhdGhFbnRyaWVzQXNOZWVkZWQoKTtcbiAgICAgICAgbGV0IGZpbGVBc0J5dGVzID0gW107XG4gICAgICAgIC8vIGhhY2sgLSBGb3IgZWFzaWVyIGRlYnVnZ2luZy5cbiAgICAgICAgY29uc3QgZW50cmllc0FzQnl0ZUFycmF5cyA9IHRoaXMuZW50cmllcy5tYXAoKHgpID0+IHgudG9CeXRlcygpKTtcbiAgICAgICAgLy8gTm93IHRoYXQgd2UndmUgd3JpdHRlbiB0aGUgYnl0ZXMgZm9yIGxvbmcgcGF0aCBlbnRyaWVzLFxuICAgICAgICAvLyBwdXQgaXQgYmFjayB0aGUgd2F5IGl0IHdhcy5cbiAgICAgICAgdGhpcy5jb25zb2xpZGF0ZUxvbmdQYXRoRW50cmllcygpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXNBc0J5dGVBcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5QXNCeXRlcyA9IGVudHJpZXNBc0J5dGVBcnJheXNbaV07XG4gICAgICAgICAgICBmaWxlQXNCeXRlcyA9IGZpbGVBc0J5dGVzLmNvbmNhdChlbnRyeUFzQnl0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IFRhckZpbGUuQ2h1bmtTaXplO1xuICAgICAgICBjb25zdCBudW1iZXJPZlplcm9DaHVua3NUb1dyaXRlID0gMjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZlplcm9DaHVua3NUb1dyaXRlOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgY2h1bmtTaXplOyBiKyspIHtcbiAgICAgICAgICAgICAgICBmaWxlQXNCeXRlcy5wdXNoKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlQXNCeXRlcztcbiAgICB9XG4gICAgdG9CeXRlc19QcmVwZW5kTG9uZ1BhdGhFbnRyaWVzQXNOZWVkZWQoKSB7XG4gICAgICAgIC8vIFRBUiBmaWxlIGVudHJpZXMgd2l0aCBwYXRocyBsb25nZXIgdGhhbiA5OSBjaGFycyByZXF1aXJlIGNoZWF0aW5nLFxuICAgICAgICAvLyBieSBwcmVwZW5kaW5nIHRoZW0gd2l0aCBhIGVudHJ5IG9mIHR5cGUgXCJMXCIgd2hvc2UgZGF0YSBjb250YWlucyB0aGUgcGF0aC5cbiAgICAgICAgY29uc3QgdHlwZUZsYWdMb25nUGF0aCA9IFRhckZpbGVUeXBlRmxhZy5JbnN0YW5jZXMoKS5Mb25nRmlsZVBhdGg7XG4gICAgICAgIGNvbnN0IG1heExlbmd0aCA9IFRhckZpbGVFbnRyeUhlYWRlci5GaWxlTmFtZU1heExlbmd0aDtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXNbaV07XG4gICAgICAgICAgICBjb25zdCBlbnRyeUhlYWRlciA9IGVudHJ5LmhlYWRlcjtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5RmlsZU5hbWUgPSBlbnRyeUhlYWRlci5maWxlTmFtZTtcbiAgICAgICAgICAgIGlmIChlbnRyeUZpbGVOYW1lLmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5RmlsZU5hbWVBc0J5dGVzID0gZW50cnlGaWxlTmFtZS5zcGxpdCgnJykubWFwKCh4KSA9PiB4LmNoYXJDb2RlQXQoMCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5Q29udGFpbmluZ0xvbmdQYXRoVG9QcmVwZW5kID0gVGFyRmlsZUVudHJ5LmZpbGVOZXcodHlwZUZsYWdMb25nUGF0aC5uYW1lLCBlbnRyeUZpbGVOYW1lQXNCeXRlcyk7XG4gICAgICAgICAgICAgICAgZW50cnlDb250YWluaW5nTG9uZ1BhdGhUb1ByZXBlbmQuaGVhZGVyLnR5cGVGbGFnID0gdHlwZUZsYWdMb25nUGF0aDtcbiAgICAgICAgICAgICAgICBlbnRyeUNvbnRhaW5pbmdMb25nUGF0aFRvUHJlcGVuZC5oZWFkZXIudGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0ID1cbiAgICAgICAgICAgICAgICAgICAgZW50cnlIZWFkZXIudGltZU1vZGlmaWVkSW5Vbml4Rm9ybWF0O1xuICAgICAgICAgICAgICAgIGVudHJ5Q29udGFpbmluZ0xvbmdQYXRoVG9QcmVwZW5kLmhlYWRlci5jaGVja3N1bUNhbGN1bGF0ZSgpO1xuICAgICAgICAgICAgICAgIGVudHJ5SGVhZGVyLmZpbGVOYW1lID0gZW50cnlGaWxlTmFtZS5zdWJzdHIoMCwgbWF4TGVuZ3RoKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoMCk7XG4gICAgICAgICAgICAgICAgZW50cmllcy5zcGxpY2UoaSwgMCwgZW50cnlDb250YWluaW5nTG9uZ1BhdGhUb1ByZXBlbmQpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBzdHJpbmdzXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IG5ld2xpbmUgPSAnXFxuJztcbiAgICAgICAgbGV0IHJldHVyblZhbHVlID0gJ1tUYXJGaWxlXScgKyBuZXdsaW5lO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXNbaV07XG4gICAgICAgICAgICBjb25zdCBlbnRyeUFzU3RyaW5nID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVyblZhbHVlICs9IGVudHJ5QXNTdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuVmFsdWUgKz0gJ1svVGFyRmlsZV0nICsgbmV3bGluZTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbn1cbi8vIGNvbnN0YW50c1xuVGFyRmlsZS5DaHVua1NpemUgPSA1MTI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJGaWxlLmpzLm1hcCIsImltcG9ydCB7IFRhckZpbGUgfSBmcm9tICcuL1RhckZpbGUnO1xuZXhwb3J0IGNvbnN0IHJlYWRUYXIgPSAodGFyYmFsbCkgPT4ge1xuICAgIHJldHVybiBUYXJGaWxlLmZyb21CeXRlcygnbXlfdGFyJywgdGFyYmFsbCk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFPLE1BQU0sVUFBVSxDQUFDO0lBQ3hCLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtJQUN2QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzNCLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUNsQyxLQUFLO0lBQ0w7SUFDQSxJQUFJLFlBQVksR0FBRztJQUNuQixRQUFRLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3pELEtBQUs7SUFDTCxJQUFJLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRTtJQUNuQyxRQUFRLElBQUksV0FBVyxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDekQsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDdEQsWUFBWSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdDLFNBQVM7SUFDVCxRQUFRLE9BQU8sV0FBVyxDQUFDO0lBQzNCLEtBQUs7SUFDTCxJQUFJLFFBQVEsR0FBRztJQUNmLFFBQVEsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM1RCxRQUFRLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lB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
