import SplitOut from './splitout'
export default class DCLocations extends SplitOut {
  setLocation(latitude: number, longitude: number, accuracy: number) {
    return this._dc.setLocation(latitude, longitude, accuracy)
  }

  getLocations(
    chatId: number,
    contactId: number,
    timestampFrom: number,
    timestampTo: number
  ) {
    return this._dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
  }
}
