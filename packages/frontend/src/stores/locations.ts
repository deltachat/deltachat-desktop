import { DcEvent, T } from '@deltachat/jsonrpc-client'
import { BackendRemote, Type } from '../backend-com'
import { onReady } from '../onready'
import { selectedAccountId } from '../ScreenController'
import { Store } from './store'

interface MapSettings {
  timestampFrom: number
  timestampTo: number
}

export class State {
  selectedChat: Type.FullChat | null = null
  mapSettings: MapSettings = {
    timestampFrom: 0,
    timestampTo: 0,
  }
  locations: T.Location[] = []
}

export const locationStore = new Store(new State(), 'location')

/*
 * Fetch all sent locations(in live location sharing) for a given chat during a given timeframe.
 * Then store them all in the location store.
 */
const getLocations = async (chatId: number, mapSettings: MapSettings) => {
  const { timestampFrom, timestampTo } = mapSettings
  const locations: T.Location[] = await BackendRemote.rpc.getLocations(
    selectedAccountId(),
    chatId,
    null,
    timestampFrom,
    timestampTo
  )
  locationStore.setState(_state => {
    return { ...locationStore.getState(), locations }
  }, 'getLocations')
}

/*
 * Add callbacks for fetching locations and storing them in LocationStore
 */
onReady(() => {
  BackendRemote.on('LocationChanged', (accountId, { contactId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    const { selectedChat, mapSettings } = locationStore.getState()
    if (!selectedChat || !selectedChat.id) {
      return
    }
    if (contactId === null) {
      // this means all locations were deleted
      getLocations(selectedChat.id, mapSettings)
    } else if (selectedChat && selectedChat.contactIds) {
      const isMemberOfSelectedChat = selectedChat.contactIds.includes(contactId)
      if (isMemberOfSelectedChat) {
        getLocations(selectedChat.id, mapSettings)
      }
    }
  })

  const onLocationChange = (
    accountId: number,
    { chatId }: Extract<DcEvent, { kind: 'MsgsChanged' | 'IncomingMsg' }>
  ) => {
    if (accountId === window.__selectedAccountId) {
      const { selectedChat, mapSettings } = locationStore.getState()
      if (selectedChat && chatId === selectedChat.id) {
        getLocations(chatId, mapSettings)
      }
    }
  }

  // sometimes a MSGS_CHANGED is sent instead of locations changed
  BackendRemote.on('MsgsChanged', onLocationChange)
  BackendRemote.on('IncomingMsg', onLocationChange)
})

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
