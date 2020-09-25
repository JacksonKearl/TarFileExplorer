import { ByteStream } from './ByteStream'
import { TarFileEntry } from './TarFileEntry'
import { TarFileEntryHeader } from './TarFileEntryHeader'
import { TarFileTypeFlag } from './TarFileTypeFlag'

export class TarFile {
	fileName: string
	entries: TarFileEntry[]

	constructor(fileName: string, entries: TarFileEntry[]) {
		this.fileName = fileName
		this.entries = entries
	}

	// constants

	static ChunkSize = 512

	// static methods

	static fromBytes(fileName: string, bytes: Uint8Array) {
		const reader = new ByteStream(bytes)

		const entries = []

		const chunkSize = TarFile.ChunkSize

		let numberOfConsecutiveZeroChunks = 0

		while (reader.hasMoreBytes() == true) {
			const chunkAsBytes = reader.readBytes(chunkSize)

			let areAllBytesInChunkZeroes = true

			for (let b = 0; b < chunkAsBytes.length; b++) {
				if (chunkAsBytes[b] != 0) {
					areAllBytesInChunkZeroes = false
					break
				}
			}

			if (areAllBytesInChunkZeroes == true) {
				numberOfConsecutiveZeroChunks++

				if (numberOfConsecutiveZeroChunks == 2) {
					break
				}
			} else {
				numberOfConsecutiveZeroChunks = 0

				const entry = TarFileEntry.fromBytes(chunkAsBytes, reader)

				entries.push(entry)
			}
		}

		let returnValue = new TarFile(fileName, entries)

		returnValue.consolidateLongPathEntries()

		return returnValue
	}

	static create(fileName: any) {
		return new TarFile(
			fileName,
			[], // entries
		)
	}

	// instance methods

	consolidateLongPathEntries() {
		// TAR file entries with paths longer than 99 chars require cheating,
		// by prepending them with a entry of type "L" whose data contains the path.
		const typeFlagLongPathName = TarFileTypeFlag.Instances().LongFilePath.name
		const entries = this.entries
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i]
			if (entry.header.typeFlag?.name == typeFlagLongPathName) {
				const entryNext = entries[i + 1]
				entryNext.header.fileName = entry.dataAsBytes.reduce(
					(a: string, b: number) => (a += String.fromCharCode(b)),
					'',
				)
				//Drop all null terminating character
				entryNext.header.fileName = entryNext.header.fileName.replace(/\0/g, '')

				entries.splice(i, 1)
				i--
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
		const newline = '\n'

		let returnValue = '[TarFile]' + newline

		for (let i = 0; i < this.entries.length; i++) {
			const entry = this.entries[i]
			const entryAsString = entry.toString()
			returnValue += entryAsString
		}

		returnValue += '[/TarFile]' + newline

		return returnValue
	}
}
