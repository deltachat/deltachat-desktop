import { getLogger } from './logger.js'
import { TranslationKey } from './translationKeyType.js'
const log = getLogger('localize')

export interface LocaleData {
  locale: string
  messages: {
    [key: string]: {
      [P in Intl.LDMLPluralRule]?: string
    } & {
      message?: string
    }
  }
}

// Solution to typescript thinking our variants can be just combined into the type string
// adapted from https://github.com/sindresorhus/type-fest/blob/cabce984e5c19558f2f0061c3cd9488a945f60e6/source/literal-union.d.ts
export type LiteralUnion<LiteralType> =
  | LiteralType
  | (string & Record<never, never>)

// 'other' should exists for all languages (source?)
// https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html
type getMessageOptions = { quantity?: 'other' | number }

export type getMessageFunction = (
  key: LiteralUnion<TranslationKey>,
  substitutions?: string | string[],
  raw_opts?: 'other' | getMessageOptions
) => string

export function translate(
  locale: string,
  messages: LocaleData['messages']
): getMessageFunction {
  const localeBCP47 = locale.replace('_', '-')
  let pluralRules: Intl.PluralRules
  try {
    pluralRules = new Intl.PluralRules(localeBCP47)
  } catch (err) {
    // Ideally we'd want a build-time check for this.
    // But let's not crash for this silly reason and apply the rules that apply
    // for many languages (see https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html#Cardinal-Integer)
    // Although keep in mind that English only has 'one' and 'other'
    // plural categorues, but some languages, such as Korean,
    // do not have 'one': only 'other'.
    // Before you ask, yes, _all_ languages have 'other' (source?)
    log.errorWithoutStackTrace(err)

    pluralRules = new Intl.PluralRules('en')
  }

  function getMessage(
    key: LiteralUnion<TranslationKey>,
    substitutions?: string | string[],
    raw_opts?: 'other' | getMessageOptions
  ) {
    const translationKey = key as string
    let opts: getMessageOptions = {}
    if (typeof raw_opts === 'string') opts = { quantity: raw_opts }
    else opts = Object.assign({}, raw_opts)

    const entry = messages[translationKey]

    if (!entry) {
      log.error(`Missing translation for key '${translationKey}'`)
      return translationKey
    }

    let message: string | undefined = entry.message
    if (typeof opts.quantity !== 'undefined') {
      if (typeof opts.quantity === 'string') {
        message = entry[opts.quantity]
      } else if (typeof opts.quantity === 'number') {
        message =
          entry[opts.quantity as unknown as keyof LocaleData['messages'][0]] ||
          // TODO fix: simply using `pluralRules.select()` to index
          // into the object is not quite right,
          // because the string could be untranslated, and it'd fall back to
          // English, with only 'one' and 'other' plural categories,
          // in which case we must apply the English
          // plural rules instead of the current locale's rules.
          //
          // Currently this is behaves incorrectly e.g. for untranslated
          // Indonesian (id), which only has the 'other' plural category,
          // so even when we have to use 'one' for English, we'd use 'other'.
          //
          // But currently we don't have a way to distinguish between translated
          // and untranslated strings in this code.
          // See https://github.com/deltachat/deltachat-desktop/blob/b342a1d47b505e68caaec71f79c381c3f304405a/src/main/load-translations.ts#L44-L64
          entry[pluralRules.select(opts.quantity)] ||
          // This also catches the case where we failed to construct
          // `Intl.PluralRules` for the currentl locale, and fall back to
          // English (see `try catch` above).
          entry['other']
      } else {
        message = undefined
      }
      if (typeof message === 'undefined') {
        log.error(
          `Missing quantity '${opts.quantity}' for key '${translationKey}'`
        )
        return `${translationKey}:${opts.quantity}`
      }
    }

    if (typeof message === 'undefined') {
      log.error(
        `Missing 'message' for key '${translationKey}', maybe you need to specify quantity`
      )
      return `${translationKey}:?`
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
          log.error(`Missing ${c} argument for key %c'${translationKey}'`)
          return ''
        }
        return substitutions[c++].toString()
      })
    }

    return message
  }

  return getMessage
}
