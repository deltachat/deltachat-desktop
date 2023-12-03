import React, { useRef, useState } from 'react'
import { RenderDTSettingSwitchType } from './Settings'
import { DesktopSettingsType } from '../../../shared/shared-types'
import classNames from 'classnames'
import SettingsStoreInstance from '../../stores/settings'
import { runtime } from '../../runtime'

export default function SettingsNotifications({
  desktopSettings,
  renderDTSettingSwitch,
}: {
  desktopSettings: DesktopSettingsType
  renderDTSettingSwitch: RenderDTSettingSwitchType
}) {
  const tx = window.static_translate
  return (
    <div className='notification-settings'>
      {renderDTSettingSwitch({
        key: 'notifications',
        label: tx('pref_notifications_explain'),
      })}
      {renderDTSettingSwitch({
        key: 'showNotificationContent',
        label: tx('pref_show_notification_content_explain'),
        disabled: !desktopSettings['notifications'],
      })}
      <h3>{tx('pref_notification_tone')}</h3>
      <ToneSelector selectedTone={desktopSettings.notificationTonePath} />
    </div>
  )
}

type Tone =
  | { type: 'special'; label: string; value: 'silent' | 'system' }
  | { type: 'default'; label: string; subtitle?: string; value: string }
  | { type: 'custom'; label: string; value: string } // label = filename

function ToneSelector({
  selectedTone,
}: {
  selectedTone: DesktopSettingsType['notificationTonePath']
}) {
  const tx = window.static_translate
  const values: Tone[] = [
    { type: 'special', label: tx('pref_silent'), value: 'silent' },
    { type: 'special', label: tx('pref_system_default'), value: 'system' },
    {
      type: 'default',
      label: 'Drop',
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/drop.ogg',
    },
    {
      type: 'default',
      label: 'KnockKnock',
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/knockknock.ogg',
    },
    {
      type: 'default',
      label: 'NOTI',
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/NOTI.ogg',
    },
    {
      type: 'default',
      label: 'Pakeeeet', // maybe remove after testing
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/Pakeeeet.ogg',
    },
    {
      type: 'default',
      label: 'Shutter',
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/shutter.ogg',
    },
    {
      type: 'default',
      label: 'Letter Opening',
      subtitle: 'Delta Chat Collection 00',
      value: 'built-in:own/letter_opening.ogg',
    },
    {
      type: 'default',
      label: 'A440',
      subtitle: 'Lomori',
      value: 'built-in:lomori/A440.ogg',
    },
    {
      type: 'default',
      label: 'Ede',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Ede.ogg',
    },
    {
      type: 'default',
      label: 'Mallet',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Mallet.ogg',
    },
    {
      type: 'default',
      label: 'Positive',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Positive.ogg',
    },
    {
      type: 'default',
      label: 'Sintesis',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Sintesis.ogg',
    },
    {
      type: 'default',
      label: 'Soft delay',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Soft_delay.ogg',
    },
    {
      type: 'default',
      label: 'Blip',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Blip.ogg',
    },
    {
      type: 'default',
      label: 'LowBattery',
      subtitle: 'Lomori',
      value: 'built-in:lomori/LowBattery.ogg',
    },
    {
      type: 'default',
      label: 'Noti Karinding',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Noti_Karinding.ogg',
    },
    {
      type: 'default',
      label: 'Rhodes',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Rhodes.ogg',
    },
    {
      type: 'default',
      label: 'Slick',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Slick.ogg',
    },
    {
      type: 'default',
      label: 'Xylo',
      subtitle: 'Lomori',
      value: 'built-in:lomori/Xylo.ogg',
    },
  ]
  // TODO add custom preferences

  const [playing, setPlaying] = useState<string | null>(null)

  const audio_player = useRef<HTMLAudioElement | null>()

  const playPreview = (value: string) => {
    if (audio_player.current) {
      audio_player.current.pause()
    }
    if(playing === value){
      setPlaying(null)
      return
    }

    // get audio path
    let audio_path: string | null = runtime.resolveNotificationSound(value)
    if (!audio_path) {
      setPlaying(null)
      return
    }

    setPlaying(value)
    audio_player.current = new Audio(audio_path)
    audio_player.current.addEventListener('ended', () => {
      setPlaying(null)
    })
    audio_player.current.play()
  }

  return (
    <div>
      <form>
        <fieldset className='notification-tone-selector'>
          {values.map(tone => {
            return (
              <AudioOption
                key={tone.value}
                data={tone}
                selected={tone.value === selectedTone}
                onSelect={() =>
                  SettingsStoreInstance.effect.setDesktopSetting(
                    'notificationTonePath',
                    tone.value
                  )
                }
                playing={tone.value === playing}
                onPreviewButton={playPreview.bind(null, tone.value)}
              />
            )
          })}
        </fieldset>
      </form>
    </div>
  )
}

function AudioOption({
  selected,
  data,
  onSelect,
  playing,
  onPreviewButton,
}: {
  selected: boolean
  data: Tone
  onSelect: () => void
  playing: boolean
  onPreviewButton: () => void
}) {
  const id = 'noti-tone' + data.value

  let icon =
    playing ? 'stop' : 'play_arrow'

  if (data.type === 'special') {
    if(data.value === 'silent'){
      icon = "volume_off"
    } else if (data.value === 'system'){
      icon = "settings_input_component"
    }
  }

  const buttonImage = `url(../images/icons/${
    icon
  }.svg)`
 
  return (
    <div
      className={classNames('notification-tone', {
        'special-option': data.type === 'special',
        'selected': selected,
      })}
    >

      <label
        htmlFor={id}
        className={classNames({
          'no-subtitle': data.type === 'default' && data.subtitle,
        })}
      >
        <button
          onClick={ev => {
            ev.preventDefault()
            onPreviewButton()
          }}
          style={{
            WebkitMaskImage: buttonImage,
            maskImage: buttonImage,
          }}
        ></button>
        <div>
          <span>{data.label}</span>
          {data.type === 'default' && data.subtitle && (
            <span>{data.subtitle}</span>
          )}
        </div>
      </label>
      {/* toggled by css */}
      <span className='selection-indicator'></span>
      <input
        id={id}
        type='radio'
        name='notification-tone'
        onClick={() => onSelect && onSelect()}
        value={data.value}
        defaultChecked={Boolean(selected)}
      />
    </div>
  )
}
