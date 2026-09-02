import { register } from 'node:module'

// this script is used to run typescript tests
// with mocha without precompiling

const packageRoot = new URL('../', import.meta.url)

register('./node_modules/ts-node/esm.mjs', packageRoot)
// registered second so that its `resolve` hook runs first (newest-first),
// stubbing style/asset imports etc. before ts-node sees them
register('./bin/test-loader.mjs', packageRoot)
