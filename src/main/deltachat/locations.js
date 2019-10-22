const SplitOut = require('./splitout')
module.exports = class DCLocations extends SplitOut {
  setLocation (latitude, longitude, accuracy) {
    return this._dc.setLocation(latitude, longitude, accuracy)
  }

  getLocations (chatId, contactId, timestampFrom, timestampTo) {
    return this._dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
  }
}
