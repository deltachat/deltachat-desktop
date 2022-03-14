import { C } from 'deltachat-node/dist/constants'
import { JsonContact } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'
import { Store, useStore } from './store'

interface SettingsStoreState {
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
  }
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
    set: (newState: SettingsStoreState) => {
      this.setState(state => {
        return newState
      }, 'set')
    },
  }
  effect = {
    load: async () => {
      const settings = (await DeltaBackend.call(
        'settings.getConfigFor',
        settingsKeys
      )) as SettingsStoreState['settings']
      const selfContact = await DeltaBackend.call(
        'contacts.getContact',
        C.DC_CONTACT_ID_SELF
      )
      this.reducer.set({ settings, selfContact, accountId: -1 })
    },
  }
}

const SettingsStoreInstance = new SettingsStore(null, 'SettingsStore')
export const useSettingsStore = () => useStore(SettingsStoreInstance)

export default SettingsStoreInstance
