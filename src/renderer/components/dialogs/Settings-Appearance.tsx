import { SettingsContext, ScreenContext } from '../../contexts'
import React, { useContext, useEffect, useState } from 'react'
import { H5, H6, Card, Elevation } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { ThemeManager } from '../../ThemeManager'
import { SettingsSelector } from './Settings'
import { SmallSelectDialog } from './DeltaDialog'

function BackgroundSelector({
  onChange,
}: {
  onChange: (value: string) => void
}) {
  const colorInput = document.getElementById('color-input') // located in index.html outside of react

  const { setDesktopSetting } = useContext(SettingsContext)

  const onColor = (ev: any) => setValue(ev.target.value)
  colorInput.onchange = (ev: any) => onColor.bind(this)(ev)
  useEffect(() => {
    return () => (colorInput.onchange = null)
  }, [])

  const setValue = (val: string) => onChange(val)

  const onButton = async (type: string, ev: any) => {
    let url
    switch (type) {
      case 'def':
        setValue(undefined)
        break
      case 'def_color':
        setValue('var(--chatViewBg)')
        break
      case 'image':
        url = await DeltaBackend.call('settings.selectBackgroundImage')
        if (url) setDesktopSetting('chatViewBgImg', url)
        break
      case 'pimage':
        url = await DeltaBackend.call(
          'settings.selectBackgroundImage',
          ev.target.dataset.url
        )
        if (url) setDesktopSetting('chatViewBgImg', url)
        break
      case 'color':
        colorInput && colorInput.click()
        break
      default:
        /* ignore-console-log */
        console.error("this shouldn't happen")
    }
  }

  const tx = window.translate
  return (
    <div>
      <div className={'bg-option-wrap'}>
        <SettingsContext.Consumer>
          {({ desktopSettings }) => (
            <div
              style={{
                backgroundImage: desktopSettings.chatViewBgImg,
                backgroundSize: 'cover',
              }}
              aria-label={tx('a11y_background_preview_label')}
              className={'background-preview'}
            />
          )}
        </SettingsContext.Consumer>
        <div className={'background-options'}>
          <button onClick={onButton.bind(this, 'def')} className={'bp3-button'}>
            {tx('pref_background_default')}
          </button>
          <button
            onClick={onButton.bind(this, 'def_color')}
            className={'bp3-button'}
          >
            {tx('pref_background_default_color')}
          </button>
          <button
            onClick={onButton.bind(this, 'image')}
            className={'bp3-button'}
          >
            {tx('pref_background_custom_image')}
          </button>
          <button
            onClick={onButton.bind(this, 'color')}
            className={'bp3-button'}
          >
            {tx('pref_background_custom_color')}
          </button>
        </div>
      </div>
      <div className={'background-default-images'}>
        {[
          'flower.webp',
          'bee.webp',
          'wheat.webp',
          'mm-1.webp',
          'mm-2.webp',
          'lake-tekapo.jpg',
          'nz-beach.webp',
          'petito-moreno.webp',
        ].map(elem => (
          <div
            onClick={onButton.bind(this, 'pimage')}
            style={{
              backgroundImage: `url(../images/backgrounds/thumb/${elem})`,
            }}
            key={elem}
            data-url={elem}
          />
        ))}
      </div>
    </div>
  )
}

export default function SettingsAppearance({
  handleDesktopSettingsChange,
}: {
  handleDesktopSettingsChange: todo
}) {
  const { desktopSettings, setDesktopSetting } = useContext(SettingsContext)
  const { activeTheme } = desktopSettings

  const { openDialog } = useContext(ScreenContext)

  const [availableThemes, setAvailableThemes] = useState<
    { [key: string]: any }[]
  >([])
  useEffect(() => {
    ;(async () => {
      const availableThemes = await DeltaBackend.call(
        'extras.getAvailableThemes'
      )
      setAvailableThemes(availableThemes)
    })()
  }, [])

  const setTheme = async (theme: string) => {
    if (await DeltaBackend.call('extras.setTheme', theme)) {
      setDesktopSetting('activeTheme', theme)
      await ThemeManager.refresh()
    }
  }

  const onCancel = async () => setTheme(activeTheme)
  const onSelect = setTheme

  const onOpenSelectThemeDialog = async () => {
    const label = 'Theme'
    let values = [
      ['system', tx('automatic')],
      ...availableThemes.map(
        ({ address, name }: { address: string; name: string }) => {
          return [
            address,
            `${name}${address.startsWith('custom') ? ' (Custom)' : ''}`,
          ]
        }
      ),
    ]

    openDialog(SmallSelectDialog, {
      values,
      selectedValue: activeTheme,
      title: tx('pref_theme'),
      onSelect,
      onCancel,
    })
  }

  const shortCurrentValue = () => {
    if (activeTheme === 'system') {
      return tx('automatic')
    }
    const theme = availableThemes.find(
      ({ address }: { address: string }) => address === activeTheme
    )
    if (!theme) return 'Loading...'

    return theme.name
  }

  const tx = window.translate
  return (
    <Card elevation={Elevation.ONE}>
      <H5>{tx('pref_appearance')}</H5>
      <SettingsSelector
        onClick={onOpenSelectThemeDialog}
        currentValue={shortCurrentValue()}
      >
        {tx('pref_theme')}
      </SettingsSelector>
      <br />
      <H6>{tx('pref_background')}</H6>
      <BackgroundSelector
        onChange={(val: string) =>
          handleDesktopSettingsChange('chatViewBgImg', val)
        }
      />
    </Card>
  )
}
