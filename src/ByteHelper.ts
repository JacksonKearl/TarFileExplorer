export class ByteHelper {
	static stringUTF8ToBytes(stringToConvert: string): number[] {
		const bytes: number[] = []

		for (let i = 0; i < stringToConvert.length; i++) {
			const byte = stringToConvert.charCodeAt(i)
			bytes.push(byte)
		}

		return bytes
	}

	static bytesToStringUTF8(bytesToConvert: number[]) {
		let returnValue = ''

		for (let i = 0; i < bytesToConvert.length; i++) {
			const byte = bytesToConvert[i]
			const byteAsChar = String.fromCharCode(byte)
			returnValue += byteAsChar
		}

		return returnValue
	}
}
