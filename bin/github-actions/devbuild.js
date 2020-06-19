// this file gets run BEFORE `npm i` so you CAN NOT use npm packages here

const { join } = require('path')
const fs = require('fs')

const packageJSON = join(__dirname, '../../package.json')

const p = JSON.parse(fs.readFileSync(packageJSON))

p.name = 'deltachat-desktop-dev'
p.productName = 'DeltaChat-DevBuild'
p.version = p.version + '-DevBuild'

fs.writeFileSync(packageJSON, JSON.stringify(p, null, 1))

const appConfig = join(__dirname, '../../src/main/application-config.ts')

const fileContent = fs
  .readFileSync(appConfig, 'utf-8')
  .replace(
    "const appConfig = applicationConfig('DeltaChat')",
    "const appConfig = applicationConfig('DeltaChatDev')"
  )

fs.writeFileSync(appConfig, fileContent)

const electronBuilderConfig = join(
  __dirname,
  '../../gen-electron-builder-config.js'
)
fs.writeFileSync(
  electronBuilderConfig,
  fs
    .readFileSync(electronBuilderConfig, 'utf-8')
    .replace(
      "build['appId'] = 'chat.delta.desktop.electron'",
      "build['appId'] = 'chat.delta.desktop.electron.dev'"
    )
)
