// this file gets run BEFORE `pnpm i` so you CAN NOT use npm packages here
//@ts-check

import { join, dirname } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const appConfig = join(
  __dirname,
  '../../packages/target-electron/src/application-config.ts'
)

const fileContent = readFileSync(appConfig, 'utf-8').replace(
  "const appConfig = applicationConfig('DeltaChat')",
  "const appConfig = applicationConfig('DeltaChatDev')"
)

writeFileSync(appConfig, fileContent)

const electronBuilderConfig = join(
  __dirname,
  '../../packages/target-electron/build/gen-electron-builder-config.js'
)
writeFileSync(
  electronBuilderConfig,
  readFileSync(electronBuilderConfig, 'utf-8').replace(
    'const previewBuild = false',
    'const previewBuild = true'
  )
)
