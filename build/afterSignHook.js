const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName === 'darwin') {
    //non appstore - mac os (dmg)
    const appName = context.packager.appInfo.productFilename;
    return await notarize({
      tool: 'notarytool',
      appPath: `${appOutDir}/${appName}.app`,
      appleApiKey: process.env.appleApiKey,
      appleApiIssuer: process.env.appleApiIssuer,
      appleApiKeyId: process.env.appleApiKeyId
    });
  }
};