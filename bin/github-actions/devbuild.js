// this file gets run BEFORE `npm i` so you CAN NOT use npm packages here

const { join } = require('path')
const fs = require('fs')

const packageJSON = join(__dirname, '../../package.json')

const p = JSON.parse(fs.readFileSync(packageJSON))

p.name = 'deltachat-desktop-dev'
p.productName = 'DeltaChat-DevBuild'
p.build.appId = 'chat.delta.desktop.electron.dev'

fs.writeFileSync(packageJSON, JSON.stringify(p, null, 1))
