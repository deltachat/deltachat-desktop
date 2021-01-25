import {
  SettingsContext,
  ScreenContext,
  useTranslationFunction,
} from '../../contexts'
import React, { useContext, useEffect, useState } from 'react'
import { H5, H6, Card, Elevation, Icon } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { ThemeManager } from '../../ThemeManager'
import { SettingsSelector } from './Settings'
import { SmallSelectDialog } from './DeltaDialog'
import { runtime } from '../../runtime'

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
        url = await runtime.showOpenFileDialog({
          title: 'Select Background Image',
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        })
        if (!url) {
          break
        }
        setDesktopSetting(
          'chatViewBgImg',
          await DeltaBackend.call('settings.saveBackgroundImage', url, false)
        )
        break
      case 'pimage':
        setDesktopSetting(
          'chatViewBgImg',
          await DeltaBackend.call(
            'settings.saveBackgroundImage',
            ev.target.dataset.url,
            true
          )
        )
        break
      case 'color':
        colorInput && colorInput.click()
        break
      default:
        /* ignore-console-log */
        console.error("this shouldn't happen")
    }
  }

  const tx = useTranslationFunction()
  return (
    <div>
      <div className={'bg-option-wrap'}>
        <SettingsContext.Consumer>
          {({ desktopSettings }) => (
            <div
              style={{
                backgroundImage: desktopSettings?.chatViewBgImg.startsWith(
                  'url('
                )
                  ? `url("misc://background/${desktopSettings.chatViewBgImg.slice(
                      5,
                      desktopSettings.chatViewBgImg.length - 2
                    )}")`
                  : desktopSettings.chatViewBgImg,
                backgroundSize: 'cover',
              }}
              aria-label={tx('a11y_background_preview_label')}
              className={'background-preview'}
            />
          )}
        </SettingsContext.Consumer>
        <div className={'background-options'}>
          <div
            onClick={onButton.bind(this, 'def')}
            style={{
              backgroundImage: 'var(--chatViewBgImgPath)',
              backgroundColor: 'var(--chatViewBg)',
              backgroundSize: '400%',
            }}
            aria-label={tx('pref_background_default')}
          />
          <div
            onClick={onButton.bind(this, 'def_color')}
            style={{ backgroundColor: 'var(--chatViewBg)' }}
            aria-label={tx('pref_background_default_color')}
          />
          <div
            onClick={onButton.bind(this, 'image')}
            className='custom-image'
            aria-label={tx('pref_background_custom_image')}
          >
            <Icon icon='media' iconSize={30} />
          </div>
          <div
            onClick={onButton.bind(this, 'color')}
            className='custom-color'
            aria-label={tx('pref_background_custom_color')}
          >
            <Icon icon='tint' iconSize={30} />
          </div>
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
    const values = [
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

  const tx = useTranslationFunction()
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
