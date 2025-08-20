
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const { join } = require('path')

module.exports = async context => {

  const isMacBuild = ['darwin', 'mas', 'dmg'].includes(
    context.electronPlatformName
  )

  const appPath = join(
    context.appOutDir,
    `${context.packager.appInfo.sanitizedProductName}.app/`
  )

  console.log({ context, appPath })

  if (!fs.lstatSync(appPath).isDirectory() ) {
    throw error(`appPath: ${appPath}  does not exist!`)
  }

  if (isMacBuild) {
    setFuses(appPath)
  }
}

async function setFuses(appPath) {
  await flipFuses(
    appPath,
    {
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false, // Disables ELECTRON_RUN_AS_NODE
      [FuseV1Options.EnableCookieEncryption]: true, // Enables cookie encryption
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Disables the NODE_OPTIONS environment variable
      [FuseV1Options.EnableNodeCliInspectArguments]: false, // Disables the --inspect and --inspect-brk family of CLI options
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true, // Enables validation of the app.asar archive on macOS
      [FuseV1Options.OnlyLoadAppFromAsar]: true, // Enforces that Electron will only load your app from "app.asar" instead of its normal search paths
      [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: true, // Loads V8 Snapshot from `browser_v8_context_snapshot.bin` for the browser process
      [FuseV1Options.GrantFileProtocolExtraPrivileges]: true, // Grants the file protocol extra privileges
    },
  );
  console.log('Flipped all fuses');
}


