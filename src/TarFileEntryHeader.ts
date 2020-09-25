import { ByteStream } from './ByteStream'
import { padLeft, padRight } from './StringExtensions'
import { TarFileTypeFlag } from './TarFileTypeFlag'

export class TarFileEntryHeader {
	fileSizeInBytes: number
	fileName: string
	fileMode: string
	userIDOfOwner: string
	userIDOfGroup: string
	timeModifiedInUnixFormat: Uint8Array
	checksum: number
	typeFlag: TarFileTypeFlag | undefined
	nameOfLinkedFile: string
	uStarIndicator: string
	uStarVersion: string
	userNameOfOwner: string
	groupNameOfOwner: string
	deviceNumberMajor: string
	deviceNumberMinor: string
	filenamePrefix: string

	private constructor(
		fileName: string,
		fileMode: string,
		userIDOfOwner: string,
		userIDOfGroup: string,
		fileSizeInBytes: number,
		timeModifiedInUnixFormat: Uint8Array,
		checksum: number,
		typeFlag: TarFileTypeFlag | undefined,
		nameOfLinkedFile: string,
		uStarIndicator: string,
		uStarVersion: string,
		userNameOfOwner: string,
		groupNameOfOwner: string,
		deviceNumberMajor: string,
		deviceNumberMinor: string,
		filenamePrefix: string,
	) {
		this.fileName = fileName
		this.fileMode = fileMode
		this.userIDOfOwner = userIDOfOwner
		this.userIDOfGroup = userIDOfGroup
		this.fileSizeInBytes = fileSizeInBytes
		this.timeModifiedInUnixFormat = timeModifiedInUnixFormat
		this.checksum = checksum
		this.typeFlag = typeFlag
		this.nameOfLinkedFile = nameOfLinkedFile
		this.uStarIndicator = uStarIndicator
		this.uStarVersion = uStarVersion
		this.userNameOfOwner = userNameOfOwner
		this.groupNameOfOwner = groupNameOfOwner
		this.deviceNumberMajor = deviceNumberMajor
		this.deviceNumberMinor = deviceNumberMinor
		this.filenamePrefix = filenamePrefix
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

	static fromBytes(bytes: Uint8Array) {
		const reader = new ByteStream(bytes)

		const fileName = reader.readString(100).trim()
		const fileMode = reader.readString(8)
		const userIDOfOwner = reader.readString(8)
		const userIDOfGroup = reader.readString(8)
		const fileSizeInBytesAsStringOctal = reader.readString(12)
		const timeModifiedInUnixFormat = reader.readBytes(12)
		const checksumAsStringOctal = reader.readString(8)
		const typeFlagValue = reader.readString(1)
		const nameOfLinkedFile = reader.readString(100)
		const uStarIndicator = reader.readString(6)
		const uStarVersion = reader.readString(2)
		const userNameOfOwner = reader.readString(32)
		const groupNameOfOwner = reader.readString(32)
		const deviceNumberMajor = reader.readString(8)
		const deviceNumberMinor = reader.readString(8)
		const filenamePrefix = reader.readString(155)
		const reserved = reader.readBytes(12)

		const fileSizeInBytes = parseInt(fileSizeInBytesAsStringOctal.trim(), 8)

		const checksum = parseInt(checksumAsStringOctal, 8)

		const typeFlags = TarFileTypeFlag.Instances()._All
		const typeFlagID = '_' + typeFlagValue
		const typeFlag = typeFlags[typeFlagID]

		let returnValue = new TarFileEntryHeader(
			fileName,
			fileMode,
			userIDOfOwner,
			userIDOfGroup,
			fileSizeInBytes,
			timeModifiedInUnixFormat,
			checksum,
			typeFlag,
			nameOfLinkedFile,
			uStarIndicator,
			uStarVersion,
			userNameOfOwner,
			groupNameOfOwner,
			deviceNumberMajor,
			deviceNumberMinor,
			filenamePrefix,
		)

		return returnValue
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

	// toString() {
	// 	const newline = '\n'

	// 	let returnValue =
	// 		'[TarFileEntryHeader ' +
	// 		"fileName='" +
	// 		this.fileName +
	// 		"' " +
	// 		"typeFlag='" +
	// 		(this.typeFlag == null ? 'err' : this.typeFlag.name) +
	// 		"' " +
	// 		"fileSizeInBytes='" +
	// 		this.fileSizeInBytes +
	// 		"' " +
	// 		']' +
	// 		newline

	// 	return returnValue
	// }
}
