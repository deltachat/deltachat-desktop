const { versions } = require('process')

const MIN_NODE_VERSION = 16

const majorVersion = versions.node.split('.')[0]
if (majorVersion < MIN_NODE_VERSION) {
  console.log(
    `ERROR:\n!!!\nThe oldest nodejs you may use is ${MIN_NODE_VERSION}, but you have ${majorVersion}\n!!!`
  )
  process.exit(1)
}
