const { ipcRenderer } = require('electron')
const { Store } = require('./store')
const log = require('../../logger').getLogger('renderer/stores/contacts')

const defaultState = {
  contacts: [],
  blockedContacts: [],
  queryGroupContacts: '',
  queryNonGroupContacts: ''
}
const contactsStore = new Store(defaultState)

ipcRenderer.on('DD_EVENT_BLOCKED_CONTACTS_UPDATED', (evt, payload) => {
  const { blockedContacts } = payload
  const state = contactsStore.getState()
  contactsStore.setState({ ...state, blockedContacts })
})

ipcRenderer.on('DD_EVENT_CONTACTS_UPDATED', (evt, payload) => {
  const { contacts } = payload
  const state = contactsStore.getState()
  log.debug('DD_EVENT_CONTACTS_UPDATED', contacts)
  contactsStore.setState({ ...state, contacts })
})

module.exports = contactsStore
