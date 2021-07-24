const { copyFileSync } = require('fs')
const { readdir } = require('fs/promises')
const { join } = require('path')
module.exports = async context => {
  if (context.electronPlatformName === 'win32') {
    // package msvc redist
    const base = join(__dirname, 'vcredist/')
    const dir = await readdir(base)
    dir.forEach(d => {
      copyFileSync(join(base, d), join(context.appOutDir, d))
    })
  }
}
