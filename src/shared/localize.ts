import { getLogger } from './logger'
const log = getLogger('localize')

export interface LocaleData {
  locale: string
  messages: {
    [key: string]: {
      message?: string
      one?: string
      other?: string
    }
  }
}

type getMessageOptions = { quantity?: 'one' | 'other' | number }

export type getMessageFunction = (
  key: string,
  substitutions?: string | string[],
  raw_opts?: 'one' | 'other' | getMessageOptions
) => string

export function translate(
  messages: LocaleData['messages']
): getMessageFunction {
  function getMessage(
    key: string,
    substitutions?: string | string[],
    raw_opts?: 'one' | 'other' | getMessageOptions
  ) {
    let opts: getMessageOptions = {}
    if (typeof raw_opts === 'string') opts = { quantity: raw_opts }
    else opts = Object.assign({}, raw_opts)

    const entry = messages[key]

    if (!entry) {
      log.error(`Missing translation for key '${key}'`)
      return key
    }

    let message: string | undefined = entry.message
    if (typeof opts.quantity !== 'undefined') {
      if (typeof opts.quantity === 'string') {
        message = entry[opts.quantity]
      } else if (typeof opts.quantity === 'number') {
        message =
          entry[
            (opts.quantity as unknown) as keyof LocaleData['messages'][0]
          ] || opts.quantity === 1
            ? entry['one']
            : entry['other']
      } else {
        message = undefined
      }
      if (typeof message === 'undefined') {
        log.error(`Missing quantity '${opts.quantity}' for key '${key}'`)
        return `${key}:${opts.quantity}`
      }
    }

    if (typeof message === 'undefined') {
      log.error(
        `Missing 'message' for key '${key}', maybe you need to specify quantity`
      )
      return `${key}:?`
    }

    if (substitutions) {
      if (!Array.isArray(substitutions)) {
        substitutions = [substitutions]
      }

      let c = 0
      return message.replace(/(?:%\d\$[\w\d])|(?:%[\w\d])/g, () => {
        if (
          substitutions === undefined ||
          typeof substitutions[c] === 'undefined'
        ) {
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
