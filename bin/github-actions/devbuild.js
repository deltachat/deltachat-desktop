// this file gets run BEFORE `npm i` so you CAN NOT use npm packages here

import { join } from 'path'
import fs from 'fs'

const packageJSON = join(__dirname, '../../package.json')

const p = JSON.parse(fs.readFileSync(packageJSON))

p.name = 'deltachat-desktop-dev'
p.productName = 'DeltaChat-DevBuild'
p.build.appId = 'chat.delta.desktop.electron.dev'
p.version = p.version + '-DevBuild'

fs.writeFileSync(packageJSON, JSON.stringify(p, null, 1))

const appConfig = join(__dirname, '../../src/main/application-config.ts')

const fileContent = fs.readFileSync(appConfig, 'utf-8')
  .replace(
    "applicationConfig('DeltaChat')",
    "applicationConfig('DeltaChatDev')"
  )

fs.writeFileSync(appConfig, fileContent)
