import React, { useEffect, useState } from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import SettingsStoreInstance from '../../stores/settings'
import SettingsButton from './SettingsButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Lang = { locale: string; name: string; dir: 'ltr' | 'rtl' }

export default function Language() {
  const tx = useTranslationFunction()
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
    await SettingsStoreInstance.effect.setDesktopSetting('locale', locale)
    await runtime.setLocale(locale)
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
