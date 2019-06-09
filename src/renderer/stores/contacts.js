const { ipcRenderer } = require('electron')
const { Store } = require('./store')

const defaultState = {
  contacts: [],
  blockedContacts: []
}
const contactsStore = new Store(defaultState)

ipcRenderer.on('DD_EVENT_BLOCKED_CONTACTS_UPDATED', (evt, payload) => {
  const { blockedContacts } = payload
  contactsStore.setState({ blockedContacts })
})

ipcRenderer.on('DD_EVENT_CONTACTS_UPDATED', (evt, payload) => {
  const { contacts } = payload
  contactsStore.setState({ contacts })
})

module.exports = contactsStore
