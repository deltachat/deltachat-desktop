const log = require('./logger').getLogger('localize')

export interface LocaleData {
  locale: string;
  messages: {
    [key: string]: {
      message: string,
      [key: string]: string
    }
  }
}

type getMessageOptions = { quantity?:string | number }

export type getMessageFunction = (key:string, substitutions?: string | string[], raw_opts?:string | getMessageOptions) => string

export function translate (messages:LocaleData['messages']):getMessageFunction {
  function getMessage (key:string, substitutions?: string | string[], raw_opts?:string | getMessageOptions) {
    let opts: getMessageOptions = {}
    if (typeof raw_opts === 'string') 
    opts = { quantity: raw_opts }
    else
    opts = Object.assign({},raw_opts)

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
