const { copyFileSync } = require('fs')
const {
  readdir,
  writeFile,
  rm,
  copyFile,
  cp,
  mkdir,
  readFile,
} = require('fs/promises')
const { join } = require('path')

const { Arch } = require('electron-builder')
const { env } = require('process')

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
  const source_dir = join(__dirname, '..')

  console.log({ context, source_dir })
  const isMacBuild = ['darwin', 'mas', 'dmg'].includes(
    context.electronPlatformName
  )

  const resources_dir = join(
    context.appOutDir,
    isMacBuild
      ? `${context.packager.appInfo.sanitizedProductName}.app/Contents/Resources`
      : 'resources'
  )

  const prebuild_dir = join(
    resources_dir,
    '/app.asar.unpacked/node_modules/@deltachat'
  )

  // #region workaround for including prebuilds

  // workaround for pnpm and electron builder not working together nicely:
  // copy prebuild packages in manually
  // currently not needed

  // const stdioServerVersion = JSON.parse(
  //   await readFile(
  //     join(source_dir, '/node_modules/@deltachat/stdio-rpc-server/package.json')
  //   )
  // ).version

  // const workspaceNodeModules = join(source_dir, '../../node_modules')
  // const workspacePnpmModules = join(workspaceNodeModules, '.pnpm')
  // const dcStdioServers = (await readdir(workspacePnpmModules)).filter(
  //   name =>
  //     name.startsWith('@deltachat+stdio-rpc-server-') &&
  //     name.endsWith(stdioServerVersion)
  // )

  // console.log({ dcStdioServers })


  // for (const serverPackage of dcStdioServers) {
  //   const name = serverPackage.split('+')[1].split('@')[0]
  //   await cp(
  //     join(workspacePnpmModules, serverPackage),
  //     join(prebuild_dir, name),
  //     { recursive: true }
  //   )
  // }
  // #endregion

  // delete not needed prebuilds
  // ---------------------------------------------------------------------------------
  if (!env['NO_ASAR']) {
    await deleteNotNeededPrebuildsFromUnpackedASAR(
      prebuild_dir,
      context,
      isMacBuild
    )
  }

  // package msvc redist
  // ---------------------------------------------------------------------------------
  if (context.electronPlatformName === 'win32') {
    await packageMSVCRedist(context)
  }

  // copy map xdc
  // ---------------------------------------------------------------------------------
  // asar is electrons archive format, flatpak doesn't use it. read more about what asar is on https://www.electronjs.org/docs/latest/glossary#asar
  // asar is electrons archive format, flatpak doesn't use it. read more about what asar is on https://www.electronjs.org/docs/latest/glossary#asar
  const asar = env['NO_ASAR'] ? false : true
  await copyMapXdc(resources_dir, source_dir, asar)
}

async function packageMSVCRedist(context) {
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

async function copyMapXdc(resources_dir, source_dir, asar) {
  const destination = join(
    resources_dir,
    asar ? 'app.asar.unpacked' : 'app',
    'html-dist',
    'xdcs'
  )
  try {
    await mkdir(destination, { recursive: true })
  } catch (error) {
    console.log('failed to create dir', destination, error)
  }
  await cp(join(source_dir, 'html-dist/xdcs'), destination, { recursive: true })
}

async function deleteNotNeededPrebuildsFromUnpackedASAR(
  prebuild_dir,
  context,
  isMacBuild
) {
  const prebuilds = await readdir(prebuild_dir)

  const toDelete = prebuilds.filter(name => {
    const architecture = name.split('-')[4]
    if (architecture === convertArch(context.arch)) {
      return false
    } else if (
      // convertArch(context.arch) === 'universal' && does not work for some reason
      isMacBuild &&
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
  if (prebuilds_after_cleanup.length !== 1 && !isMacBuild) {
    throw new Error(
      "prebuilds were not cleared correctly or prebuild is missing, there should only be one (unless it's mac)"
    )
  }
}
