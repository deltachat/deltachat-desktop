import { JsonLocations } from '../../shared/shared-types'
import { Type } from '../backend-com'
import { DeltaBackend } from '../delta-remote'
import { Store } from './store'

const { ipcRenderer } = window.electron_functions

export class state {
  selectedChat: Type.FullChat | null = null
  mapSettings = {
    timestampFrom: 0,
    timestampTo: 0,
  }
  locations: JsonLocations = []
}

export const locationStore = new Store(new state(), 'location')

const getLocations = async (chatId: number, mapSettings: todo) => {
  const { timestampFrom, timestampTo } = mapSettings
  const locations: JsonLocations = await DeltaBackend.call(
    'locations.getLocations',
    chatId,
    0,
    timestampFrom,
    timestampTo
  )
  locationStore.setState(_state => {
    return { ...locationStore.getState(), locations }
  }, 'getLocations')
}

const onLocationChange = (_evt: any, [chatId]: [number]) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  if (selectedChat && chatId === selectedChat.id) {
    getLocations(chatId, mapSettings)
  }
}

ipcRenderer.on('DC_EVENT_LOCATION_CHANGED', (_evt, contactId) => {
  const { selectedChat, mapSettings } = locationStore.getState()
  if (!selectedChat || !selectedChat.id) {
    return
  }
  if (contactId === 0) {
    // this means all locations were deleted
    getLocations(selectedChat.id, mapSettings)
  }
  if (selectedChat && selectedChat.contactIds) {
    const isMemberOfSelectedChat = selectedChat.contactIds.includes(contactId)
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

  throw new Error('unknown action for location store:' + action.type)
})

locationStore.attachEffect((action, state) => {
  if (action.type === 'DC_GET_LOCATIONS') {
    const { chatId } = action.payload
    getLocations(chatId, state.mapSettings)
  }
})
