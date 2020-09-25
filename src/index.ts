import { TarFile } from './TarFile'

export const readTar = (tarball: number[]): TarFile => {
	return TarFile.fromBytes('my_tar', tarball)
}
