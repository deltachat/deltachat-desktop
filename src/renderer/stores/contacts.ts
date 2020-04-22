import { ipcBackend, callDcMethodAsync } from '../ipc'
import { Store, Action } from './store'
import logger from '../../shared/logger'
import debounce from 'debounce'
import { JsonContact } from '../../shared/shared-types'
const log = logger.getLogger('renderer/stores/contacts')

class state {
  contacts: JsonContact[] = []
  blockedContacts: JsonContact[] = []
  queryGroupContacts = ''
  queryNonGroupContacts = ''
}
const contactsStore = new Store(new state(), 'contact')

contactsStore.attachEffect(async action => {
  if (action.type === 'UI_UNBLOCK_CONTACT') {
    const contactId = action.payload
    await callDcMethodAsync('contacts.unblockContact', contactId)
    await callDcMethodAsync('updateBlockedContacts')
  }
})

ipcBackend.on(
  'DD_EVENT_BLOCKED_CONTACTS_UPDATED',
  (evt, payload: { blockedContacts: JsonContact[] }) => {
    const { blockedContacts } = payload
    const state = contactsStore.getState()
    contactsStore.setState({ ...state, blockedContacts })
  }
)

ipcBackend.on(
  'DD_EVENT_CONTACTS_UPDATED',
  debounce(
    (evt, payload: { contacts: JsonContact[] }) => {
      const { contacts } = payload
      const state = contactsStore.getState()
      log.debug('DD_EVENT_CONTACTS_UPDATED', contacts)
      contactsStore.setState({ ...state, contacts })
    },
    500,
    true
  )
)

export default contactsStore
