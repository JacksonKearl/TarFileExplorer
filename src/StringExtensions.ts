export const padLeft = (string: string, lengthToPadTo: number, charToPadWith: string) => {
	let returnValue = string
	while (returnValue.length < lengthToPadTo) {
		returnValue = charToPadWith + returnValue
	}
	return returnValue
}

export const padRight = (string: string, lengthToPadTo: number, charToPadWith: string) => {
	let returnValue = string
	while (returnValue.length < lengthToPadTo) {
		returnValue += charToPadWith
	}
	return returnValue
}
