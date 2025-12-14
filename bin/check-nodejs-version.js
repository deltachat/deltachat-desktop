//@ts-check
import { versions } from 'process'

const MIN_NODE_VERSION = 22

const majorVersion = versions.node.split('.')[0]
if (Number(majorVersion) < MIN_NODE_VERSION) {
  console.log(
    `ERROR:\n!!!\nThe oldest nodejs you may use is ${MIN_NODE_VERSION}, but you have ${majorVersion}\n!!!`
  )
  process.exit(1)
}
