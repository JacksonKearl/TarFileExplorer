import { TarFile } from './TarFile'

export const readTar = (tarball: Uint8Array): TarFile => {
	return TarFile.fromBytes('my_tar', tarball)
}
