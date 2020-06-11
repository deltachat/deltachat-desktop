import { SettingsContext, ScreenContext } from '../../contexts'
import React, { useContext, useEffect, useState } from 'react'
import { H5, H6, Card, Elevation } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { ThemeManager } from '../../ThemeManager'
import { SettingsSelector } from './Settings'
import { SmallSelectDialog } from './DeltaDialog'
const { ipcRenderer } = window.electron_functions

class BackgroundSelector extends React.Component {
  fileInput: todo
  colorInput: todo
  constructor(
    public props: {
      onChange: (value: string) => void
    }
  ) {
    super(props)
    this.fileInput = React.createRef()
    this.colorInput = document.getElementById('color-input') // located in index.html outside of react
    this.colorInput.onchange = (ev: any) => this.onColor.bind(this)(ev)
  }

  componentWillUnmount() {
    this.colorInput.onchange = null
  }

  render() {
    const tx = window.translate
    return (
      <div>
        <div className={'bg-option-wrap'}>
          <SettingsContext.Consumer>
            {(settings: any) => (
              <div
                style={{
                  backgroundImage: settings['chatViewBgImg'],
                  backgroundSize: 'cover',
                }}
                aria-label={tx('a11y_background_preview_label')}
                className={'background-preview'}
              />
            )}
          </SettingsContext.Consumer>
          <div className={'background-options'}>
            <button
              onClick={this.onButton.bind(this, 'def')}
              className={'bp3-button'}
            >
              {tx('pref_background_default')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'def_color')}
              className={'bp3-button'}
            >
              {tx('pref_background_default_color')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'image')}
              className={'bp3-button'}
            >
              {tx('pref_background_custom_image')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'color')}
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
              onClick={this.onButton.bind(this, 'pimage')}
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

  setValue(val: string) {
    this.props.onChange(val)
  }

  onButton(type: string, ev: any) {
    switch (type) {
      case 'def':
        this.setValue(undefined)
        break
      case 'def_color':
        this.setValue('var(--chatViewBg)')
        break
      case 'image':
        ipcRenderer.send('selectBackgroundImage')
        break
      case 'pimage':
        ipcRenderer.send('selectBackgroundImage', ev.target.dataset.url)
        break
      case 'color':
        this.colorInput && this.colorInput.click()
        break
      default:
        /* ignore-console-log */
        console.error("this shouldn't happen")
    }
  }

  onColor(ev: any) {
    // TODO debounce
    this.setValue(ev.target.value)
  }
}

export default function SettingsAppearance({
  handleDesktopSettingsChange,
}: {
  handleDesktopSettingsChange: todo
}) {
  const { activeTheme } = useContext(SettingsContext)
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
    await DeltaBackend.call('extras.setTheme', theme)
    await ThemeManager.refresh()
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
