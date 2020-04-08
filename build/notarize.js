const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'chat.delta.desktop.electron',
    appPath: `${appOutDir}/${appName}.app`,
    appleApiKey: process.env.appleApiKey,
    appleApiIssuer: process.env.appleApiIssuer,
  });
};