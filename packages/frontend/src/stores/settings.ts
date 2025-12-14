import { C } from '@deltachat/jsonrpc-client'
import { DesktopSettingsType, RC_Config } from '../../../shared/shared-types'
import { BackendRemote, Type } from '../backend-com'
import { onReady } from '../onready'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { Store, useStore } from './store'
import { throttledUpdateBadgeCounter } from '../system-integration/badge-counter'

export interface SettingsStoreState {
  accountId: number
  selfContact: Type.Contact
  settings: {
    [P in (typeof settingsKeys)[number]]: {
      mvbox_move: string
      configured_addr: string
      displayname: string
      selfstatus: string
      mdns_enabled: string
      show_emails: string
      bcc_self: string
      delete_device_after: string
      delete_server_after: string
      download_limit: string
      only_fetch_mvbox: string
      media_quality: string
      is_chatmail: '0' | '1'
      webxdc_realtime_enabled: string
    }[P]
  }
  desktopSettings: DesktopSettingsType
  rc: RC_Config
}

const settingsKeys = [
  'mvbox_move',
  'configured_addr',
  'displayname',
  'selfstatus',
  'mdns_enabled',
  'show_emails',
  'bcc_self',
  'delete_device_after',
  'delete_server_after',
  'download_limit',
  'only_fetch_mvbox',
  'media_quality',
  'is_chatmail',
  'webxdc_realtime_enabled',
] as const

class SettingsStore extends Store<SettingsStoreState | null> {
  reducer = {
    setState: (newState: SettingsStoreState | null) => {
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
    clear: () => {
      this.reducer.setState(null)
      this.log.info('cleared settings store')
    },
    load: async () => {
      const accountId = window.__selectedAccountId
      if (accountId === undefined) {
        throw new Error('can not load settings when no account is selected')
      }
      const settings = (await BackendRemote.rpc.batchGetConfig(
        accountId,
        settingsKeys as unknown as Array<(typeof settingsKeys)[number]>
      )) as SettingsStoreState['settings']
      const selfContact = await BackendRemote.rpc.getContact(
        accountId,
        C.DC_CONTACT_ID_SELF
      )
      const desktopSettings = await runtime.getDesktopSettings()

      const rc = runtime.getRC_Config()
      this.reducer.setState({
        settings,
        selfContact,
        accountId,
        desktopSettings,
        rc,
      })
    },
    loadCoreKey: async (
      accountId: number,
      key: keyof SettingsStoreState['settings']
    ) => {
      if (
        this.state &&
        this.state.accountId === accountId &&
        settingsKeys.includes(key)
      ) {
        const newValue = await BackendRemote.rpc.getConfig(
          this.state.accountId,
          key
        )
        // console.info('loadCoreKey', key, newValue)

        this.setState(state => {
          if (state === null || state.accountId !== accountId) {
            return
          }
          return { ...state, settings: { ...state.settings, [key]: newValue } }
        }, 'set')
      }
    },
    setDesktopSetting: async (
      key: keyof DesktopSettingsType,
      value: string | number | boolean
    ) => {
      try {
        await runtime.setDesktopSetting(key, value)
        if (key === 'syncAllAccounts') {
          if (value) {
            BackendRemote.rpc.startIoForAllAccounts()
          } else {
            BackendRemote.rpc.stopIoForAllAccounts()
          }
          if (this.state?.accountId) {
            BackendRemote.rpc.startIo(this.state.accountId)
          }
          throttledUpdateBadgeCounter()
          window.__updateAccountListSidebar?.()
        }
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

onReady(() => {
  const updateSelfAvatar = async (accountId: number) => {
    if (accountId === window.__selectedAccountId) {
      const selfContact = await BackendRemote.rpc.getContact(
        accountId,
        C.DC_CONTACT_ID_SELF
      )
      SettingsStoreInstance.reducer.setSelfContact(selfContact)
    }
  }
  // SelfavatarChanged is marked as deprecated in jsonrpc api, but ConfigSynced does not have selfavatar yet
  // will probably change with https://github.com/deltachat/deltachat-core-rust/pull/5158
  BackendRemote.on('SelfavatarChanged', updateSelfAvatar)
  BackendRemote.on('ConfigSynced', (accountId, { key }) => {
    if (key === 'selfavatar') {
      updateSelfAvatar(accountId)
    }
    SettingsStoreInstance.effect.loadCoreKey(accountId, key as any)
  })
})

const SettingsStoreInstance = new SettingsStore(null, 'SettingsStore')
export const useSettingsStore = () => useStore(SettingsStoreInstance)

export default SettingsStoreInstance
