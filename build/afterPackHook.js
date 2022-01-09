const { copyFileSync } = require('fs')
const { readdir, writeFile } = require('fs/promises')
const { join } = require('path')
module.exports = async context => {
  if (context.electronPlatformName === 'win32') {
    // package msvc redist
    const base = join(__dirname, 'vcredist/')
    const dir = await readdir(base)
    dir.forEach(d => {
      copyFileSync(join(base, d), join(context.appOutDir, d))
    })
    let windows_build_info = join(context.appOutDir, 'windows_build_info.json');

    let isAPPX = false;

    if (context.targets.findIndex(({name})=>name == "appx") !=-1){
      if(context.targets.length > 1) {
        throw new Error("please don't build appx together with other formats")
      }

      // Set a file to indicate that it is an appx to the running app.
      isAPPX = true
    }

    await writeFile(windows_build_info, JSON.stringify({
      isAPPX
    }))
  }
}
