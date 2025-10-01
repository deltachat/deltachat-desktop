import { register } from 'node:module';

// this script is used to run typescript tests
// with mocha without precompiling

const packageRoot = new URL('../', import.meta.url);

register('./node_modules/ts-node/esm.mjs', packageRoot);
