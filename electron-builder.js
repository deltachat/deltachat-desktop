const fs = require('fs-extra')
const { join } = require('path')
const files = [
  '!bin/',
  '!jenkins/',
  '!README_ASSETS/',
  '!README.md',
  '!.*',
  '!src/',
  '!scss/',
  '!static/',
  '!test/',
  '!ci_scripts/',
  '!tsc-dist/renderer/',
  '!**/*.d.ts',
  '!**/*.tsbuildinfo',
  '!**/*.js.map',
  '!**/*.css.map',
  '!html-dist/report.html',
]

const build = {}
build['appId'] = 'chat.delta.desktop.electron'
build['protocols'] = {
  name: 'QR code data',
  role: 'Viewer',
  schemes: ['openpgp4fpr', 'OPENPGP4FPR'],
}

build['files'] = files

build['afterPack'] = async context => {
  if (context.electronPlatformName === 'win32') {
    // package msvc redist
    const base = join(__dirname, 'build/vcredist/')
    const dir = await fs.readdir(base)
    dir.forEach(d => {
      fs.copyFileSync(join(base, d), join(context.appOutDir, d))
    })
  }
}

// platform specific
build['mac'] = {
  category: 'public.app-category.social-networking',
}
build['dmg'] = {
  contents: [
    {
      x: 220,
      y: 200,
    },
    {
      x: 448,
      y: 200,
      type: 'link',
      path: '/Applications',
    },
  ],
}
build['linux'] = {
  target: ['AppImage', 'deb'],
  category: 'Network;Chat;InstantMessaging;',
  desktop: {
    comment: 'Delta Chat email-based messenger',
    keywords: 'dc;chat;delta;messaging;messenger;email',
  },
}
build['win'] = {
  icon: 'images/deltachat.ico',
}

module.exports = build
