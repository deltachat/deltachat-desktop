const { writeFileSync } = require('fs')
const { join } = require('path')
const files = [
  // default
  '**/*',
  '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
  '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
  '!**/node_modules/*.d.ts',
  '!**/node_modules/.bin',
  '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
  '!.editorconfig',
  '!**/._*',
  '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
  '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
  '!**/{appveyor.yml,.travis.yml,circle.yml}',
  '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
  // misc unrelated stuff
  '!README_ASSETS/',
  '!README.md',
  '!bin/',
  '!.*', // dotfiles like prettier configuration
  '!test/',
  '!jenkins/',
  '!ci_scripts/',
  '!**/.github/*',
  '!electron-builder.json5',
  '!docs/', // docs that are hidden in asar are useless
  '!dist/', // don't bundle other packages
  // Source files
  '!src/',
  '!scss/',
  '!static/',
  '!**/*.scss',
  '!**/*.ts',
  '!**/*.d.ts',
  '!_locales/*.xml',
  '!build/',
  // Build artifacts
  '!tsc-dist/renderer/',
  '!**/*.tsbuildinfo',
  '!**/*.css.map',
  '!html-dist/report.htm',
  '!node_modules/typescript/',
  '!node_modules/@babel/',
  // remove stuff that was already bundled by parcel
  //'!node_modules/mapbox-gl/',
  // '!node_modules/@blueprintjs/',
  '!node_modules/vt-pbf/',
  // '!node_modules/emoji-mart/',
  '!node_modules/react-dom/',
  '!node_modules/emoji-js-clean/',
  '!node_modules/@mapbox/',
  '!node_modules/react/',
  '!node_modules/react-transition-group/',
  '!node_modules/css-to-react-native',
  // re-add needed css stuff -> re-adding doesn't seem to work at this point in time
  // 'node_modules/normalize.css/normalize.css',
  // 'node_modules/@blueprintjs/core/lib/css/blueprint.css',
  // 'node_modules/@blueprintjs/icons/resources/icons/',
  // 'node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css',
  // 'node_modules/emoji-mart/css/emoji-mart.css',
  // 'node_modules/mapbox-gl/dist/mapbox-gl.css',
  // cleanup deltachat-node
  //'!node_modules/deltachat-node/deltachat-core-rust/', - todo only exclude what is not needed (if no prebuilds are available)
  '!node_modules/deltachat-node/src',
  '!node_modules/@deltachat/message_parser_wasm',
  // more files, tried it in the flatpak (saved around 50mb before compression)
  '!node_modules/napi-macros',
  // frontend node_modules not needed at runtime - would get easier if dc-desktop would adopt the 2 package.json project structure
  // Blueprint js
  '!node_modules/@blueprintjs/core/lib/css/blueprint-hi-contrast.css',
  '!node_modules/@blueprintjs/core/lib/cjs',
  '!node_modules/@blueprintjs/core/lib/esm',
  '!node_modules/@blueprintjs/core/lib/esnext',
  '!node_modules/@blueprintjs/core/lib/less',
  '!node_modules/@blueprintjs/core/dist/*.js',
  '!node_modules/@blueprintjs/core/src',
  '!node_modules/@blueprintjs/core/node_modules/tslib',
  '!node_modules/@blueprintjs/core/package.json',
  '!node_modules/@blueprintjs/core/scripts',
  '!node_modules/@blueprintjs/icons/lib/cjs',
  '!node_modules/@blueprintjs/icons/lib/esm',
  '!node_modules/@blueprintjs/icons/lib/esnext',
  '!node_modules/@blueprintjs/icons/lib/less',
  '!node_modules/@blueprintjs/icons/dist/*.js',
  '!node_modules/@blueprintjs/icons/src',
  '!node_modules/@blueprintjs/icons/package.json',
  '!node_modules/@blueprintjs/icons/node_modules/tslib',
  '!node_modules/popper.js',
  // every react addon
  '!node_modules/react-*',
  '!node_modules/classnames',
  '!node_modules/use-debounce',
  '!node_modules/create-react-context',
  // mapbox
  '!node_modules/mapbox-gl/src',
  '!node_modules/mapbox-gl/flow-typed',
  '!node_modules/mapbox-gl/build',
  '!node_modules/mapbox-gl/dist/*.flow',
  '!node_modules/mapbox-gl/dist/mapbox-gl-dev.js',
  '!node_modules/mapbox-gl/dist/mapbox-gl-unminified.js',
  '!node_modules/mapbox-gl/dist/mapbox-gl-unminified.js.map',
  '!node_modules/mapbox-gl/dist/mapbox-gl-csp.js.map',
  '!node_modules/mapbox-gl/dist/mapbox-gl-csp-worker.js.map',
  '!node_modules/mapbox-gl/dist/mapbox-gl-csp.js',
  '!node_modules/mapbox-gl/dist/mapbox-gl-csp-worker.js',
  '!node_modules/mapbox-gl/dist/mapbox-gl.js.map', // we don't want to add 3mb to debug mapbox in production
  // need testing?
  '!node_modules/resize-observer-polyfill',
  '!node_modules/mapbox-gl/dist/style-spec',
  '!node_modules/mapbox-gl/dist/mapbox-gl.js # should be bundled via esbuild already',
  // momentjs is currently only used by renderer process
  '!node_modules/moment',
]
const env = process.env

const build = {}
build['appId'] = 'chat.delta.desktop.electron'
build['protocols'] = [
  {
    name: 'QR code data',
    role: 'Viewer',
    schemes: ['openpgp4fpr'],
  },
  {
    name: 'Send Mails via MailTo Scheme',
    // https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-102207-TPXREF115
    role: 'Viewer',
    schemes: ['mailto'],
  },
]

build['files'] = files
build['asarUnpack'] = ['node_modules/deltachat-node/']

build['afterPack'] = './build/afterPackHook.js'
build['afterSign'] = './build/afterSignHook.js'

if (typeof env.NO_ASAR !== 'undefined' && env.NO_ASAR != 'false') {
  build['asar'] = false
}

// platform specific

const PREBUILD_FILTERS = {
  NOT_LINUX: '!node_modules/deltachat-node/prebuilds/linux-x64/${/*}',
  NOT_MAC: '!node_modules/deltachat-node/prebuilds/darwin-x64/${/*}',
  NOT_WINDOWS: '!node_modules/deltachat-node/prebuilds/win32-x64/${/*}',
}

build['mac'] = {
  appId: 'chat.delta.desktop.electron',
  category: 'public.app-category.social-networking',
  entitlements: 'build/entitlements.mac.plist',
  entitlementsInherit: 'build/entitlements.mac.plist',
  extendInfo: {
    NSCameraUsageDescription: 'For scanning qr codes.',
    // NSMicrophoneUsageDescription: "For voice messages"
  },
  gatekeeperAssess: true,
  hardenedRuntime: true,
  icon: 'resources/icon.icns',
  provisioningProfile: './../embedded.provisionprofile',
  files: [...files, PREBUILD_FILTERS.NOT_LINUX, PREBUILD_FILTERS.NOT_WINDOWS],
  darkModeSupport: true,
}

build['mas'] = {
  hardenedRuntime: false,
  entitlements: 'build/entitlements.mas.plist',
  entitlementsInherit: 'build/entitlements.mas.inherit.plist',
  // binaries // Paths of any extra binaries that need to be signed.
}

build['dmg'] = {
  sign: false,
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
    Comment: 'Delta Chat email-based messenger',
    Keywords: 'dc;chat;delta;messaging;messenger;email',
  },
  files: [...files, PREBUILD_FILTERS.NOT_MAC, PREBUILD_FILTERS.NOT_WINDOWS],
  icon: 'build/icon.icns', // electron builder gets the icon out of the mac icon archive
}
build['win'] = {
  icon: 'images/deltachat.ico',
  files: [...files, PREBUILD_FILTERS.NOT_MAC, PREBUILD_FILTERS.NOT_LINUX],
}

build['appx'] = {
  applicationId: build['appId'],
  publisher: 'CN=C13753E5-D590-467C-9FCA-6799E1A5EC1E',
  publisherDisplayName: 'merlinux',
  identityName: 'merlinux.DeltaChat',
}

// see https://www.electron.build/configuration/nsis
build['nsis'] = {
  oneClick: false,
  allowToChangeInstallationDirectory: false,
}

// module.exports = build
// using this as a js module doesn#t work on windows
// because electron builder asks windows to open it as file instead of reading it.

writeFileSync(
  join(__dirname, '../electron-builder.json5'),
  '// GENERATED, this file is generated by gen-electron-builder-config.js \n// run "pack:generate_config" to re-generate it\n' +
    JSON.stringify(build)
)
