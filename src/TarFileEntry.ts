import { ByteHelper } from './ByteHelper'
import { ByteStream } from './ByteStream'
import { TarFile } from './TarFile'
import { TarFileEntryHeader } from './TarFileEntryHeader'

export class TarFileEntry {
	header: TarFileEntryHeader
	dataAsBytes: any

	constructor(header: TarFileEntryHeader, dataAsBytes: Uint8Array) {
		this.header = header
		this.dataAsBytes = dataAsBytes
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

	static fromBytes(chunkAsBytes: Uint8Array, reader: ByteStream) {
		const chunkSize = TarFile.ChunkSize

		const header = TarFileEntryHeader.fromBytes(chunkAsBytes)

		const sizeOfDataEntryInBytesUnpadded = header.fileSizeInBytes

		const numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize)

		const sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize

		const dataAsBytes = reader
			.readBytes(sizeOfDataEntryInBytesPadded)
			.slice(0, sizeOfDataEntryInBytesUnpadded)

		const entry = new TarFileEntry(header, dataAsBytes)

		return entry
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

	remove(event: any) {
		throw Error('Not yet implemented!') // todo
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
		const newline = '\n'

		const headerAsString = this.header.toString()

		const dataAsHexadecimalString = ByteHelper.bytesToStringUTF8(this.dataAsBytes)

		let returnValue =
			'[TarFileEntry]' +
			newline +
			headerAsString +
			'[Data]' +
			dataAsHexadecimalString +
			'[/Data]' +
			newline +
			'[/TarFileEntry]' +
			newline

		return returnValue
	}
}
