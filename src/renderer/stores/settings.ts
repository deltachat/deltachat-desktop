import { C } from 'deltachat-node/node/dist/constants'
import { DesktopSettingsType, RC_Config } from '../../shared/shared-types'
import { BackendRemote, Type } from '../backend-com'
import { ipcBackend } from '../ipc'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'
import { Store, useStore } from './store'

export interface SettingsStoreState {
  accountId: number
  selfContact: Type.Contact
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
    'ui.lastchatid': string
  }
  desktopSettings: DesktopSettingsType
  rc: RC_Config
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
  'ui.lastchatid',
]

class SettingsStore extends Store<SettingsStoreState | null> {
  reducer = {
    setState: (newState: SettingsStoreState) => {
      this.setState(_state => {
        return newState
      }, 'set')
    },
    setSelfContact: (selfContact: Type.Contact) => {
      this.setState(state => {
        if (state === null) return
        return {
          ...state,
          selfContact,
        }
      }, 'setSelfContact')
    },
    setDesktopSetting: (
      key: keyof DesktopSettingsType,
      value: string | number | boolean
    ) => {
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
            [key]: value,
          },
        }
      }, 'setDesktopSetting')
    },
    setCoreSetting: (
      key: keyof SettingsStoreState['settings'],
      value: string | boolean
    ) => {
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
            [key]: value,
          },
        }
      }, 'setCoreSetting')
    },
  }
  effect = {
    load: async () => {
      const accountId = window.__selectedAccountId
      if (accountId === undefined) {
        throw new Error('can not load settings when no account is selected')
      }
      const settings = (await BackendRemote.rpc.batchGetConfig(
        accountId,
        settingsKeys
      )) as SettingsStoreState['settings']
      const selfContact = await BackendRemote.rpc.contactsGetContact(
        accountId,
        C.DC_CONTACT_ID_SELF
      )
      const desktopSettings = await runtime.getDesktopSettings()

      const rc = await runtime.getRC_Config()
      this.reducer.setState({
        settings,
        selfContact,
        accountId,
        desktopSettings,
        rc,
      })
    },
    setDesktopSetting: async (
      key: keyof DesktopSettingsType,
      value: string | number | boolean
    ) => {
      try {
        await runtime.setDesktopSetting(key, value)
        this.reducer.setDesktopSetting(key, value)
      } catch (error) {
        this.log.error('failed to apply desktop setting:', error)
      }
    },
    setCoreSetting: async (
      key: keyof SettingsStoreState['settings'],
      value: string | boolean
    ) => {
      try {
        if (!this.state) {
          throw new Error('no account selected')
        }
        await BackendRemote.rpc.setConfig(
          this.state.accountId,
          key,
          String(value)
        )
        this.reducer.setCoreSetting(key, value)
      } catch (error) {
        this.log.warn('setConfig failed:', error)
      }
    },
  }
}

BackendRemote.on('SelfavatarChanged', async accountId => {
  if (accountId === window.__selectedAccountId) {
    const selfContact = await BackendRemote.rpc.contactsGetContact(
      accountId,
      C.DC_CONTACT_ID_SELF
    )
    SettingsStoreInstance.reducer.setSelfContact(selfContact)
  }
})

const SettingsStoreInstance = new SettingsStore(null, 'SettingsStore')
export const useSettingsStore = () => useStore(SettingsStoreInstance)

export default SettingsStoreInstance
