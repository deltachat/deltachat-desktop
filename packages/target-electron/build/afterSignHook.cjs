const { notarize } = require('@electron/notarize')

/**
 * Electron-Builder afterSign Hook
 *
 * This file is an afterSign lifecycle hook for electron-builder. It runs automatically
 * after the application has been code-signed, but before the final distribution files
 * (.dmg, .pkg) are created.
 *
 * Configured in gen-electron-builder-config.js under "build.afterSign" property.
 *
 * Build Process Timeline (macOS):
 * 1. electron-builder packages the app (afterPack hook runs)
 * 2. App is code-signed with developer certificate
 * 3. afterSign hook runs (this file)
 * 4. App is notarized by Apple's servers (happens in this hook)
 * 5. electron-builder creates final .dmg/.pkg installers
 *
 * Notarization is Apple's automated security scanning process. After you code-sign your
 * macOS app, you upload it to Apple's notary service, which:
 * - Scans the app for malicious content
 * - Checks that it's properly signed
 * - Issues a "ticket" if the app passes
 *
 * Apps downloaded from the internet MUST be notarized or users will see "malicious software"
 * warnings and may not be able to open the app at all. Notarization proves the app comes
 * from an identified developer and hasn't been tampered with.
 *
 * Note: Only applies to macOS dmg builds (not App Store builds, which use a different process).
 */

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName === 'darwin') {
    //non appstore - mac os (dmg)
    const appName = context.packager.appInfo.productFilename
    return await notarize({
      tool: 'notarytool',
      appPath: `${appOutDir}/${appName}.app`,
      appleApiKey: process.env.appleApiKey,
      appleApiIssuer: process.env.appleApiIssuer,
      appleApiKeyId: process.env.appleApiKeyId,
    })
  }
}
