function openTarball(tarball) {
  const start = performance.now()
  var tarFile = TarUtils.readTar(tarball);
  console.log(`reading tarball with length ${tarball.length} took ${performance.now() - start}ms`)
  return tarFile
}

function unzipTarball(tarballGz) {
  const start = performance.now()
  const tarball = pako.ungzip(tarballGz)
  console.log(`Unzipping tarball with length ${tarballGz.byteLength}->${tarball.length} took ${performance.now() - start}ms`);
  return tarball;
}

async function downloadTarballGz(repo) {
  console.log(`Starting to download ${repo}`);

  const start = performance.now()
  const response = await fetch(`https://git-cors-proxy-test.azurewebsites.net/codeload.github.com/${repo}/legacy.tar.gz/master`)
  if (response.status !== 200 && response.status !== 0) { throw new Error(response.statusText) }
  const blob = await response.blob();
  const ab = await blob.arrayBuffer();
  console.log(`Downloading ${repo} took ${performance.now() - start}ms`);
  return ab;
}


const download = async () => {
  const repos = [
    'jacksonkearl/mixedCase',
    'microsoft/vscode-js-debug',
    'microsoft/vscode',
    'microsoft/typescript',
    // 'torvalds/linux'
  ]
  return Promise.all(repos.map(downloadTarballGz))
}

const profile = async (downloads) => {
  const unzips = downloads.map(download => unzipTarball(download))
  unzips.map(tarball => {
    for (let i = 0; i < 10; i++) {
      openTarball(tarball);
    }
  })

}