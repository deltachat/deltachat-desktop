import React, { useEffect, useState } from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import { DesktopSettingsStoreInstance } from '../../stores/settings'
import SettingsButton from './SettingsButton'

type Lang = { locale: string; name: string; dir: 'ltr' | 'rtl' }

type Props = {
  /** Called after a language was selected and applied. */
  onClose?: () => void
}

export default function Language({ onClose }: Props) {
  const [languages, setLanguages] = useState<Lang[] | null>(null)
  const currentLocale = window.localeData.locale

  useEffect(() => {
    runtime
      .getAvailableLanguages?.()
      .then(setLanguages)
      .catch(error => {
        console.error('Failed to load available languages', error)
        setLanguages([])
      })
  }, [])

  const choose = async (locale: string) => {
    if (locale === currentLocale) return
    await DesktopSettingsStoreInstance.effect.set('locale', locale)
    // Reuse the app-wide language-change hook (setLocale + reloadLocaleData)
    // — same path as the native menu's chooseLanguage event.
    if (runtime.onChooseLanguage) {
      await runtime.onChooseLanguage(locale)
    } else {
      await runtime.setLocale(locale)
    }
    onClose?.()
  }

  return (
    <>
      {languages?.map(({ locale, name }) => (
        <SettingsButton
          key={locale}
          onClick={() => choose(locale)}
          highlight={locale === currentLocale}
        >
          {name}
        </SettingsButton>
      ))}
      {languages === null && <div>Loading…</div>}
    </>
  )
}
