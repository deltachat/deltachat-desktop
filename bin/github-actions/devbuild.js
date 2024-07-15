// this file gets run BEFORE `pnpm i` so you CAN NOT use npm packages here
//@ts-check

import { join, dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const packageJSON = join(__dirname, '../../package.json')

const p = JSON.parse(readFileSync(packageJSON, { encoding: 'utf-8' }))

p.name = 'deltachat-desktop-dev'
p.productName = 'DeltaChat-DevBuild'
p.version = p.version + '-DevBuild'

writeFileSync(packageJSON, JSON.stringify(p, null, 1))

const packageLockJSON = join(__dirname, '../../package-lock.json')

const pLock = JSON.parse(readFileSync(packageLockJSON, { encoding: 'utf-8' }))
pLock.version = p.version
writeFileSync(packageLockJSON, JSON.stringify(pLock, null, 1))

const appConfig = join(__dirname, '../../src/main/application-config.ts')

const fileContent = readFileSync(appConfig, 'utf-8').replace(
  "const appConfig = applicationConfig('DeltaChat')",
  "const appConfig = applicationConfig('DeltaChatDev')"
)

writeFileSync(appConfig, fileContent)

const electronBuilderConfig = join(
  __dirname,
  '../../build/gen-electron-builder-config.js'
)
writeFileSync(
  electronBuilderConfig,
  readFileSync(electronBuilderConfig, 'utf-8').replace(
    "build['appId'] = 'chat.delta.desktop.electron'",
    "build['appId'] = 'chat.delta.desktop.electron.dev'"
  )
)
