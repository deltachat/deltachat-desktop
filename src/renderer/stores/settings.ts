import { C } from 'deltachat-node/dist/constants'
import { DesktopSettingsType, JsonContact } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'
import {ipcBackend} from '../ipc'
import { Store, useStore } from './store'

export interface SettingsStoreState {
  accountId: number
  selfContact: JsonContact
  settings: {
    sentbox_watch: string
    mvbox_move: string
    e2ee_enabled: string
    addr: string
    displayname: string
    selfstatus: string
    mdns_enabled: string
    show_emails: string
    bcc_self: string
    delete_device_after: string
    delete_server_after: string
    webrtc_instance: string
    download_limit: string
    only_fetch_mvbox: string
  },
  desktopSettings: DesktopSettingsType
}

const settingsKeys: Array<keyof SettingsStoreState['settings']> = [
  'sentbox_watch',
  'mvbox_move',
  'e2ee_enabled',
  'addr',
  'displayname',
  'selfstatus',
  'mdns_enabled',
  'show_emails',
  'bcc_self',
  'delete_device_after',
  'delete_server_after',
  'webrtc_instance',
  'download_limit',
  'only_fetch_mvbox',
]

class SettingsStore extends Store<SettingsStoreState | null> {
  reducer = {
    setState: (newState: SettingsStoreState) => {
      this.setState(_state => {
        return newState
      }, 'set')
    },
    setSelfContact: (selfContact: JsonContact) => {
      this.setState(state => {
        if (state === null) return
        return {
          ...state,
          selfContact
        }
      }, 'setSelfContact')
    },
    setDesktopSetting: (key: keyof DesktopSettingsType, value: string | number | boolean) => {
      this.setState(state => {
        if (state === null) {
          this.log.warn(
            'trying to update local version of desktop settings object, but it was not loaded yet'
          )
          return
        }
        return {
          ...state,
          desktopSettings: {
            ...state.desktopSettings,
            [key]: value
          }
        }
      }, 'setDesktopSetting')
    },
    setCoreSetting: (key: keyof SettingsStoreState['settings'], value: string | boolean) => {
      this.setState(state => {
        if (state === null) {
          this.log.warn(
            'trying to update local version of desktop settings object, but it was not loaded yet'
          )
          return
        }
        return {
          ...state,
          settings: {
            ...state.settings,
            [key]: value
          }
        }
      }, 'setCoreSetting')
    }
  }
  effect = {
    load: async () => {
      const settings = (await DeltaBackend.call(
        'settings.getConfigFor',
        settingsKeys
      )) as SettingsStoreState['settings']
      const desktopSettings = await DeltaBackend.call(
        'settings.getDesktopSettings'
      )
      const selfContact = await DeltaBackend.call(
        'contacts.getContact',
        C.DC_CONTACT_ID_SELF
      )
      this.reducer.setState({ settings, selfContact, accountId: -1, desktopSettings })
    },
    setDesktopSetting: async(key: keyof DesktopSettingsType, value: string | number | boolean) => {
      if (
        (await DeltaBackend.call('settings.setDesktopSetting', key, value)) ===
        true
      ) {
        this.reducer.setDesktopSetting(key, value)
      }
    },
    setCoreSetting: async(key: keyof SettingsStoreState['settings'], value: string | boolean) => {
      if (
        (await DeltaBackend.call('settings.setConfig', key, String(value))) ===
        true
      ) {
        this.reducer.setCoreSetting(key, value)
        return
      }
      this.log.warn('settings.setConfig returned false for: ', key, value)
    }
  }
}

ipcBackend.on('DC_EVENT_SELFAVATAR_CHANGED', async (_evt, [_chatId]) => {
  const selfContact = await DeltaBackend.call(
    'contacts.getContact',
    C.DC_CONTACT_ID_SELF
  )
  SettingsStoreInstance.reducer.setSelfContact(selfContact)
})

const SettingsStoreInstance = new SettingsStore(null, 'SettingsStore')
export const useSettingsStore = () => useStore(SettingsStoreInstance)

export default SettingsStoreInstance
