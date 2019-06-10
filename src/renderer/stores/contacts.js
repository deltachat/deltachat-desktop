const { ipcRenderer } = require('electron')
const { Store } = require('./store')

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
  console.log('DD_EVENT_CONTACTS_UPDATED', contacts)
  contactsStore.setState({ ...state, contacts })
})

module.exports = contactsStore
