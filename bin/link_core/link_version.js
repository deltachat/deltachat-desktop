#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const newVersion = process.argv[2]

if (!newVersion) {
  console.error('You need to enter a version code as first argument')
  process.exit(1)
}

console.log(`You entered version: ${newVersion}`)

const filePath = resolve('pnpm-workspace.yaml')
const fileContent = readFileSync(filePath, 'utf8')

const updatedContent = fileContent
  .replace(
    /('@deltachat\/jsonrpc-client')\s*: \s*(.*?)\n/g,
    `$1: ${newVersion}\n`
  )
  .replace(
    /('@deltachat\/stdio-rpc-server')\s*: \s*(.*?)\n/g,
    `$1: ${newVersion}\n`
  )

writeFileSync(filePath, updatedContent, 'utf8')

execSync('./bin/link_core/link_catalog.sh', { stdio: 'inherit' })
execSync('pnpm i', { stdio: 'inherit' })