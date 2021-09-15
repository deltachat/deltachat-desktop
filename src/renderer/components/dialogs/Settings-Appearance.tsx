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
import { RC_Config, Theme } from '../../../shared/shared-types'

function BackgroundSelector({
  onChange,
}: {
  onChange: (value: string) => void
}) {
  // the #color-input element is located in index.html outside of react
  const colorInput = document.getElementById('color-input') as HTMLInputElement

  const { setDesktopSetting, desktopSettings } = useContext(SettingsContext)

  useEffect(() => {
    colorInput.onchange = (ev: any) => onChange(ev.target.value)
    return () => (colorInput.onchange = null)
  }, [onChange, colorInput])

  const openColorInput = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // opens the color input and sets its offset so it lines up with the button
    if (colorInput) {
      const y =
        (ev.clientY || 0) -
        (Number(window.getComputedStyle(colorInput).height.replace('px', '')) ||
          0)
      colorInput.setAttribute(
        'style',
        `position:absolute;top:${y}px;left:${ev.clientX}px;`
      )
      if (!desktopSettings.chatViewBgImg?.startsWith('url(')) {
        colorInput.value = desktopSettings.chatViewBgImg
      }
      setTimeout(() => colorInput.click(), 0)
    }
  }

  const onButton = async (
    type: string,
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    let url
    switch (type) {
      case 'def':
        onChange(undefined)
        break
      case 'def_color':
        onChange('var(--chatViewBg)')
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
            (ev.target as any).dataset.url,
            true
          )
        )
        break
      case 'color':
        openColorInput(ev)
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
                ...(desktopSettings.chatViewBgImg?.startsWith('url(')
                  ? {
                      backgroundImage: `url("file://${desktopSettings.chatViewBgImg.slice(
                        5,
                        desktopSettings.chatViewBgImg.length - 2
                      )}")`,
                    }
                  : {
                      backgroundColor: desktopSettings.chatViewBgImg,
                      backgroundImage: 'unset',
                    }),
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
  rc
}: {
  handleDesktopSettingsChange: todo
  rc: RC_Config
}) {
  const { desktopSettings, setDesktopSetting } = useContext(SettingsContext)
  const { activeTheme } = desktopSettings

  const { openDialog } = useContext(ScreenContext)

  const [availableThemes, setAvailableThemes] = useState<Theme[]>([])
  useEffect(() => {
    ;(async () => {
      const availableThemes = await DeltaBackend.call(
        'extras.getAvailableThemes'
      )
      console.log({availableThemes, rc});
      
      setAvailableThemes(
        availableThemes.filter(
          t => !t.is_prototype || t.address === activeTheme || rc.devmode
        )
      )
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
      ...availableThemes.map(({ address, name, is_prototype }: Theme) => {
        return [
          address,
          `${name}${address.startsWith('custom') ? ' (Custom)' : ''}${
            is_prototype ? ' (prototype)' : ''
          }`,
        ]
      }),
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
