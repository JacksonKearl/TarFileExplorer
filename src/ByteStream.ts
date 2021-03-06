export class ByteStream {
	bytes: Uint8Array
	byteIndexCurrent: number

	constructor(bytes: Uint8Array) {
		this.bytes = bytes

		this.byteIndexCurrent = 0
	}

	// instance methods

	hasMoreBytes() {
		return this.byteIndexCurrent < this.bytes.length
	}

	readBytes(numberOfBytesToRead: number) {
		const start = this.byteIndexCurrent
		this.byteIndexCurrent += numberOfBytesToRead
		return this.bytes.slice(start, this.byteIndexCurrent)
	}

	readByte() {
		let returnValue = this.bytes[this.byteIndexCurrent]
		this.byteIndexCurrent++
		return returnValue
	}

	readString(lengthOfString: number) {
		let returnValue = ''
		for (let i = 0; i < lengthOfString; i++) {
			const byte = this.readByte()
			if (byte != 0) {
				const byteAsChar = String.fromCharCode(byte)
				returnValue += byteAsChar
			}
		}

		return returnValue
	}

	// writeBytes(bytesToWrite: number[]) {
	// 	for (let b = 0; b < bytesToWrite.length; b++) {
	// 		this.bytes.push(bytesToWrite[b])
	// 	}

	// 	this.byteIndexCurrent = this.bytes.length
	// }

	// writeByte(byteToWrite: number) {
	// 	this.bytes.push(byteToWrite)
	// 	this.byteIndexCurrent++
	// }

	// writeString(stringToWrite: string, lengthPadded?: number) {
	// 	for (let i = 0; i < stringToWrite.length; i++) {
	// 		const charAsByte = stringToWrite.charCodeAt(i)
	// 		this.writeByte(charAsByte)
	// 	}
	// 	if (lengthPadded) {
	// 		const numberOfPaddingChars = lengthPadded - stringToWrite.length
	// 		for (let i = 0; i < numberOfPaddingChars; i++) {
	// 			this.writeByte(0)
	// 		}
	// 	}
	// }
}
