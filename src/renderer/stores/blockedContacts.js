const { ipcRenderer } = require('electron')
const { Store } = require('./store')

const defaultState = {
  blockedContacts: []
}
const blockedContactsStore = new Store(defaultState)

ipcRenderer.on('DD_EVENT_BLOCKED_CONTACTS_UPDATED', (evt, payload) => {
  blockedContactsStore.setState(payload.blockedContacts)
})

module.exports = blockedContactsStore
