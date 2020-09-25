import { TarFile } from './TarFile'

export const readTar = (tarball: Uint8Array) => TarFile.fromBytes(tarball)
