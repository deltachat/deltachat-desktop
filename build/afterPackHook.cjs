const { copyFileSync } = require('fs')
const { readdir, writeFile, rm } = require('fs/promises')
const { join } = require('path')

const { Arch } = require('electron-builder')

function convertArch(arch) {
  switch (arch) {
    case Arch.arm64:
      return 'arm64'
    case Arch.armv7l:
      return 'arm'
    case Arch.ia32:
      return 'ia32' // electron seems to not exist anymore anyway
    case Arch.x64:
      return 'x64'
    case Arch.universal:
      return 'universal'

    default:
      throw new Error(`unhandled architecture: ${arch}`)
  }
}

module.exports = async context => {
  console.log({ context })

  const prebuild_dir = join(
    context.appOutDir,
    `${
      ['darwin', 'mas', 'dmg'].includes(context.electronPlatformName)
        ? 'DeltaChat.app/Contents/Resources'
        : 'resources'
    }/app.asar.unpacked/node_modules/@deltachat`
  )

  // delete not needed prebuilds
  const prebuilds = await readdir(prebuild_dir)

  const toDelete = prebuilds.filter(name => {
    const architecture = name.split('-')[4]
    if (architecture === convertArch(context.arch)) {
      return false
    } else if (
      // convertArch(context.arch) === 'universal' && does not work for some reason
      context.electronPlatformName === 'darwin' &&
      (architecture === 'arm64' || architecture === 'x64')
    ) {
      return false
    } else {
      return true
    }
  })

  console.log({ prebuilds, toDelete })

  for (const targetOfDeletion of toDelete) {
    await rm(join(prebuild_dir, targetOfDeletion), { recursive: true })
  }

  const prebuilds_after_cleanup = await readdir(prebuild_dir)
  console.log({ prebuilds_after_cleanup })
  if (
    prebuilds_after_cleanup.length !== 1 &&
    context.electronPlatformName !== 'darwin'
  ) {
    throw new Error(
      "prebuilds were not cleared correctly or prebuild is missing, there should only be one (unless it's mac)"
    )
  }

  if (context.electronPlatformName === 'win32') {
    // package msvc redist
    const base = join(__dirname, 'vcredist/')
    const dir = await readdir(base)
    dir.forEach(d => {
      copyFileSync(join(base, d), join(context.appOutDir, d))
    })
    let windows_build_info = join(context.appOutDir, 'windows_build_info.json')

    let isAPPX = false

    if (context.targets.findIndex(({ name }) => name == 'appx') != -1) {
      if (context.targets.length > 1) {
        throw new Error("please don't build appx together with other formats")
      }

      // Set a file to indicate that it is an appx to the running app.
      isAPPX = true
    }

    await writeFile(
      windows_build_info,
      JSON.stringify({
        isAPPX,
      })
    )
  }
}
