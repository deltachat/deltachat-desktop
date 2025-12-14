console.log('\x1b[31mHint:\x1b[0m')
console.log(
  '\x1b[33mIf there are many errors and/or you just packaged deltachat-desktop-electron, then try resetting node_modules with "\x1b[1m\x1b[36mpnpm -w run reset:node_modules\x1b[0m"'
)

// This file is only executed on error, so let's make sure the entire command
// also gives an error.
process.exitCode = -1
