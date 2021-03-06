export class TarFileTypeFlag {
	value: string
	id: string
	name: string

	constructor(value: string, name: string) {
		this.value = value
		this.id = '_' + this.value
		this.name = name
	}

	static _instances: TarFileTypeFlag_Instances

	static Instances() {
		if (TarFileTypeFlag._instances == null) {
			TarFileTypeFlag._instances = new TarFileTypeFlag_Instances()
		}
		return TarFileTypeFlag._instances
	}
}

class TarFileTypeFlag_Instances {
	Normal: TarFileTypeFlag
	HardLink: TarFileTypeFlag
	SymbolicLink: TarFileTypeFlag
	CharacterSpecial: TarFileTypeFlag
	BlockSpecial: TarFileTypeFlag
	Directory: TarFileTypeFlag
	FIFO: TarFileTypeFlag
	ContiguousFile: TarFileTypeFlag
	LongFilePath: TarFileTypeFlag
	_All: TarFileTypeFlag[] & { [key: string]: TarFileTypeFlag | undefined }
	constructor() {
		this.Normal = new TarFileTypeFlag('0', 'Normal')
		this.HardLink = new TarFileTypeFlag('1', 'Hard Link')
		this.SymbolicLink = new TarFileTypeFlag('2', 'Symbolic Link')
		this.CharacterSpecial = new TarFileTypeFlag('3', 'Character Special')
		this.BlockSpecial = new TarFileTypeFlag('4', 'Block Special')
		this.Directory = new TarFileTypeFlag('5', 'Directory')
		this.FIFO = new TarFileTypeFlag('6', 'FIFO')
		this.ContiguousFile = new TarFileTypeFlag('7', 'Contiguous File')

		this.LongFilePath = new TarFileTypeFlag('L', '././@LongLink')

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
		] as any

		for (let i = 0; i < this._All.length; i++) {
			const item = this._All[i]
			this._All[item.id] = item
		}
	}
}
