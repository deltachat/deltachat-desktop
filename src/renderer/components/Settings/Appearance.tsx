import { join } from 'path'
import React, { useEffect, useState } from 'react'
import { Icon } from '@blueprintjs/core'

import { ThemeManager } from '../../ThemeManager'
import { runtime } from '../../runtime'
import {
  DesktopSettingsType,
  RC_Config,
  Theme,
} from '../../../shared/shared-types'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import { getLogger } from '../../../shared/logger'
import SettingsSelector from './SettingsSelector'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import SmallSelectDialog, { SelectDialogOption } from '../SmallSelectDialog'
import SettingsHeading from './SettingsHeading'
import { DialogContent } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../utils/cachedLastUsedPath'

const log = getLogger('renderer/settings/appearance')

type Props = {
  rc: RC_Config
  desktopSettings: DesktopSettingsType
  settingsStore: SettingsStoreState
}

export default function Appearance({
  rc,
  desktopSettings,
  settingsStore,
}: Props) {
  const { activeTheme } = desktopSettings
  const { openDialog } = useDialog()
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([])
  const tx = useTranslationFunction()

  useEffect(() => {
    ;(async () => {
      const availableThemes = await runtime.getAvailableThemes()

      setAvailableThemes(
        availableThemes.filter(
          t => !t.is_prototype || t.address === activeTheme || rc.devmode
        )
      )
    })()
  }, [rc.devmode, activeTheme])

  const setTheme = async (theme: string) => {
    if (await setThemeFunction(theme)) {
      SettingsStoreInstance.effect.setDesktopSetting('activeTheme', theme)
      await ThemeManager.refresh()
    }
  }

  const onCancel = async () => setTheme(activeTheme)
  const onSelect = setTheme

  const onOpenSelectThemeDialog = async () => {
    const values: SelectDialogOption[] = [
      ['system', tx('automatic')],
      ...availableThemes.map(({ address, name, is_prototype }: Theme) => {
        return [
          address,
          `${name}${address.startsWith('custom') ? ' (Custom)' : ''}${
            is_prototype ? ' (prototype)' : ''
          }`,
        ] as SelectDialogOption
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

  return (
    <>
      <SettingsSelector
        onClick={onOpenSelectThemeDialog}
        currentValue={shortCurrentValue()}
      >
        {tx('pref_theme')}
      </SettingsSelector>
      <SettingsHeading>{tx('pref_background')}</SettingsHeading>
      <DialogContent>
        <BackgroundSelector
          desktopSettings={desktopSettings}
          onChange={(val: string) => {
            val.startsWith('#')
              ? SettingsStoreInstance.effect.setDesktopSetting(
                  'chatViewBgImg',
                  `color: ${val}`
                )
              : SettingsStoreInstance.effect.setDesktopSetting(
                  'chatViewBgImg',
                  val
                )
          }}
        />
      </DialogContent>
      <br />
      <br />
      <SettingsTrayIcon settingsStore={settingsStore} />
    </>
  )
}

const enum SetBackgroundAction {
  default,
  defaultColor,
  customImage,
  presetImage,
  customColor,
}

function BackgroundSelector({
  onChange,
  desktopSettings,
}: {
  onChange: (value: string) => void
  desktopSettings: DesktopSettingsType
}) {
  // the #color-input element is located in index.html outside of react
  const colorInput = document.getElementById('color-input') as HTMLInputElement

  useEffect(() => {
    colorInput.oninput = (ev: any) => onChange(ev.target.value)
    return () => {
      colorInput.oninput = null
    }
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
      if (desktopSettings?.chatViewBgImg?.startsWith('color: ')) {
        colorInput.value = desktopSettings?.chatViewBgImg.slice(7) || ''
      }
      setTimeout(() => colorInput.click(), 0)
      if (colorInput.value) {
        onChange(colorInput.value)
      }
    }
  }

  const onButton = async (
    type: SetBackgroundAction,
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.BackgroundImage,
      runtime.getAppPath('pictures')
    )
    let url
    switch (type) {
      case SetBackgroundAction.default:
        onChange('')
        break
      case SetBackgroundAction.defaultColor:
        onChange('var(--chatViewBg)')
        break
      case SetBackgroundAction.customImage:
        url = await runtime.showOpenFileDialog({
          title: 'Select Background Image',
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
          defaultPath,
        })
        if (!url) {
          break
        }
        setLastPath(url)
        SettingsStoreInstance.effect.setDesktopSetting(
          'chatViewBgImg',
          await runtime.saveBackgroundImage(url, false)
        )
        break
      case SetBackgroundAction.presetImage:
        SettingsStoreInstance.effect.setDesktopSetting(
          'chatViewBgImg',
          await runtime.saveBackgroundImage(
            (ev.target as any).dataset.url,
            true
          )
        )
        break
      case SetBackgroundAction.customColor:
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
        <div
          style={{
            ...(desktopSettings.chatViewBgImg?.startsWith('img: ')
              ? {
                  backgroundImage: `url("file://${join(
                    runtime.getConfigPath(),
                    'background/',
                    desktopSettings.chatViewBgImg.slice(5)
                  )}")`,
                }
              : {
                  backgroundColor: desktopSettings.chatViewBgImg?.slice(7),
                  backgroundImage: 'unset',
                }),
            backgroundSize: 'cover',
          }}
          aria-label={tx('a11y_background_preview_label')}
          className={'background-preview'}
        />
        <div className={'background-options'}>
          <div
            onClick={onButton.bind(null, SetBackgroundAction.default)}
            style={{
              backgroundImage: 'var(--chatViewBgImgPath)',
              backgroundColor: 'var(--chatViewBg)',
              backgroundSize: '400%',
            }}
            aria-label={tx('pref_background_default')}
          />
          <div
            onClick={onButton.bind(null, SetBackgroundAction.defaultColor)}
            style={{ backgroundColor: 'var(--chatViewBg)' }}
            aria-label={tx('pref_background_default_color')}
          />
          <div
            onClick={onButton.bind(null, SetBackgroundAction.customImage)}
            className='custom-image'
            aria-label={tx('pref_background_custom_image')}
          >
            <Icon icon='media' size={30} />
          </div>
          <div
            onClick={onButton.bind(null, SetBackgroundAction.customColor)}
            className='custom-color'
            aria-label={tx('pref_background_custom_color')}
          >
            <Icon icon='tint' size={30} />
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
            onClick={onButton.bind(null, SetBackgroundAction.presetImage)}
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

async function setThemeFunction(address: string) {
  try {
    runtime.resolveThemeAddress(address)
    await runtime.setDesktopSetting('activeTheme', address)
    return true
  } catch (error) {
    log.error('set theme failed: ', error)
    return false
  }
}

function SettingsTrayIcon({
  settingsStore,
}: {
  settingsStore: SettingsStoreState
}) {
  const tx = useTranslationFunction()

  return (
    <>
      <DesktopSettingsSwitch
        settingsKey='minimizeToTray'
        label={tx('pref_show_tray_icon')}
        disabled={settingsStore.rc.minimized}
        disabledValue={settingsStore.rc.minimized}
      />
      {settingsStore.rc.minimized && (
        <div className='bp4-callout'>
          {tx('explain_desktop_minimized_disabled_tray_pref')}
        </div>
      )}
    </>
  )
}
