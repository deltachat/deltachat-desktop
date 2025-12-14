//@ts-ignore
import type english from '../../_locales/en.json'
//@ts-ignore
import type untranslated from '../../_locales/_untranslated_en.json'

//@ts-ignore
export type TranslationKey = keyof typeof english | keyof typeof untranslated

// The ignore here is to make it optional,
// if the import fails (because resolveJsonModule=false) it should bring down everything with it.
// currently this type is not used for checking, but just for autocompletion
