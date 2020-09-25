import { TarFile } from './TarFile'
import { TarFileEntry } from './TarFileEntry'
import { TarFileEntryHeader } from './TarFileEntryHeader'

export { TarFile, TarFileEntry, TarFileEntryHeader }

export const readTar = (tarball: Uint8Array) => TarFile.fromBytes(tarball)
