import { useContext } from 'react'

import { I18nContext } from '../contexts/I18nContext'

/**
 * Convenience wrapper function for `useContext(I18nContext).tx`.
 *
 * This is a react hook, make sure you only use it where you can use reactHooks,
 * as example in functional components.
 *
 * Otherwise use the `<I18nContext.Consumer>` or when you don't need
 * the dynamic updating functionality use `window.static_translate` directly.
 */
export default function useTranslationFunction() {
  return useContext(I18nContext).tx
}

export function useTranslationWritingDirection() {
  return useContext(I18nContext).writingDirection
}
