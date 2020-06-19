const fs = require('fs-extra')
const { join } = require('path')
module.exports = async context => {
  if (context.electronPlatformName === 'win32') {
    // package msvc redist
    const base = join(__dirname, 'vcredist/')
    const dir = await fs.readdir(base)
    dir.forEach(d => {
      fs.copyFileSync(join(base, d), join(context.appOutDir, d))
    })
  }
}
