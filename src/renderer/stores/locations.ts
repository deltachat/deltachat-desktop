import { JsonLocations } from '../../shared/shared-types'
import { callDcMethod } from '../ipc'
import { Store, Action } from './store'

const { ipcRenderer } = window.electron_functions

class state {
  selectedChat: { [key: string]: todo; contacts: todo[] } = null
  mapSettings = {
    timestampFrom: 0,
    timestampTo: 0,
  }
  locations: JsonLocations = []
}

export const locationStore = new Store(new state(), 'location')

const getLocations = (chatId: number, mapSettings: todo) => {
  const { timestampFrom, timestampTo } = mapSettings
  callDcMethod(
    'locations.getLocations',
    [chatId, 0, timestampFrom, timestampTo],
    (locations: JsonLocations) =>
      locationStore.setState({ ...locationStore.getState(), locations })
  )
}

const onLocationChange = (evt: any, [chatId]: [number]) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  if (selectedChat && chatId === selectedChat.id) {
    getLocations(chatId, mapSettings)
  }
}

ipcRenderer.on('DC_EVENT_LOCATION_CHANGED', (evt, contactId) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  if (contactId === 0) {
    // this means all locations were deleted
    getLocations(selectedChat.id, mapSettings)
  }
  if (selectedChat && selectedChat.contacts) {
    const isMemberOfSelectedChat = selectedChat.contacts.find(
      contact => contact.id === contactId
    )
    if (isMemberOfSelectedChat) {
      getLocations(selectedChat.id, mapSettings)
    }
  }
})

// sometimes a MSGS_CHANGED is sent instead of locations changed
ipcRenderer.on('DC_EVENT_MSGS_CHANGED', onLocationChange)
ipcRenderer.on('DC_EVENT_INCOMING_MSG', onLocationChange)

locationStore.attachReducer((action, state) => {
  if (action.type === 'DC_GET_LOCATIONS') {
    const { timestampFrom, timestampTo } = action.payload
    state = { ...state, mapSettings: { timestampFrom, timestampTo } }
    return state
  }
})

locationStore.attachEffect((action, state) => {
  if (action.type === 'DC_GET_LOCATIONS') {
    const { chatId } = action.payload
    getLocations(chatId, state.mapSettings)
  }
})
