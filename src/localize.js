const log = require('./shared/logger').getLogger('localize')

function translate (messages) {
  function getMessage (key, substitutions, opts) {
    if (typeof opts === 'string') opts = { quantity: opts }
    if (!opts) opts = {}

    const entry = messages[key]

    if (!entry) {
      log.error(`Missing translation for key '${key}'`)
      return key
    }

    let message = entry.message
    if (typeof opts.quantity !== 'undefined') {
      if (typeof opts.quantity === 'string') {
        message = entry[opts.quantity]
      } else if (typeof opts.quantity === 'number') {
        message = entry[opts.quantity] || opts.quantity === 1 ? entry['one'] : entry['other']
      } else {
        message = undefined
      }
      if (typeof message === 'undefined') {
        log.error(`Missing quantity '${opts.quantity}' for key '${key}'`)
        return `${key}:${opts.quantity}`
      }
    }

    if (substitutions) {
      if (!Array.isArray(substitutions)) {
        substitutions = [substitutions]
      }

      let c = 0
      return message.replace(/(?:%\d\$[\w\d])|(?:%[\w\d])/g, () => {
        if (typeof substitutions[c] === 'undefined') {
          log.error(`Missing ${c} argument for key %c'${key}'`)
          return ''
        }
        return substitutions[c++].toString()
      })
    }

    return message
  }

  return getMessage
}

module.exports = { translate }
