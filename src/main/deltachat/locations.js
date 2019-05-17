function setLocation (latitude, longitude, accuracy) {
  return this._dc.setLocation(latitude, longitude, accuracy)
}

function getLocations (chatId, contactId, timestampFrom, timestampTo) {
  const locations = this._dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
  this.sendToRenderer('DD_EVENT_LOCATIONS_UPDATED', { locations, chatId, contactId, timestampFrom, timestampTo })
}

module.exports = function () {
  this.setLocation = setLocation.bind(this)
  this.getLocations = getLocations.bind(this)
}
