import { callDcMethod, ipcBackend } from '../ipc'
import { Store } from './store'

const defaultState = {
  selectedChat: null,
  mapSettings: {
    timestampFrom: 0,
    timestampTo: 0
  },
  locations: []
}
export const locationStore = new Store(defaultState)

const getLocations = (chatId, mapSettings) => {
  const { timestampFrom, timestampTo } = mapSettings
  callDcMethod(
    'locations.getLocations',
    [chatId, 0, timestampFrom, timestampTo],
    (locations) => locationStore.setState({ ...locationStore.getState(), locations })
  )
}

const onLocationChange = (evt, payload) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  const [chatId] = payload
  if (selectedChat && chatId === selectedChat.id) {
    getLocations(chatId, mapSettings)
  }
}

ipcBackend.on('DC_EVENT_LOCATION_CHANGED', (evt, contactId) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  if (contactId === 0) {
    // this means all locations were deleted
    getLocations(selectedChat.id, mapSettings)
  }
  if (selectedChat && selectedChat.contacts) {
    const isMemberOfSelectedChat = selectedChat.contacts.find(contact => contact.id === contactId)
    if (isMemberOfSelectedChat) {
      getLocations(selectedChat.id, mapSettings)
    }
  }
})

// sometimes a MSGS_CHANGED is sent instead of locations changed
ipcBackend.on('DC_EVENT_MSGS_CHANGED', onLocationChange)
ipcBackend.on('DC_EVENT_INCOMING_MSG', onLocationChange)

locationStore.reducers.push((action, state) => {
  if (action.type === 'DC_GET_LOCATIONS') {
    const { timestampFrom, timestampTo } = action.payload
    state = { ...state, mapSettings: { timestampFrom, timestampTo } }
    return state
  }
})

locationStore.effects.push((action, state) => {
  if (action.type === 'DC_GET_LOCATIONS') {
    const { chatId } = action.payload
    getLocations(chatId, state.mapSettings)
  }
})
