import { callDcMethod, ipcBackend } from '../ipc'
import { Store } from './store'
import logger from '../../logger'
import debounce from 'debounce'
const log = logger.getLogger('renderer/stores/contacts')

const defaultState = {
  contacts: [],
  blockedContacts: [],
  queryGroupContacts: '',
  queryNonGroupContacts: ''
}
const contactsStore = new Store(defaultState)

contactsStore.effects.push((action) => {
  if (action.type === 'UI_UNBLOCK_CONTACT') {
    const contactId = action.payload
    callDcMethod('contacts.unblockContact', [contactId], () => {
      callDcMethod('updateBlockedContacts')
    })
  }
})

ipcBackend.on('DD_EVENT_BLOCKED_CONTACTS_UPDATED', (evt, payload) => {
  const { blockedContacts } = payload
  const state = contactsStore.getState()
  contactsStore.setState({ ...state, blockedContacts })
})

ipcBackend.on('DD_EVENT_CONTACTS_UPDATED', debounce((evt, payload) => {
  const { contacts } = payload
  const state = contactsStore.getState()
  log.debug('DD_EVENT_CONTACTS_UPDATED', contacts)
  contactsStore.setState({ ...state, contacts })
}), 500, true)

export default contactsStore
