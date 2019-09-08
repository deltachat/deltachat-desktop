function setLocation (latitude, longitude, accuracy) {
  return this._dc.setLocation(latitude, longitude, accuracy)
}

function getLocations (chatId, contactId, timestampFrom, timestampTo) {
  return this._dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
}

module.exports = function () {
  this.setLocation = setLocation.bind(this)
  this.getLocations = getLocations.bind(this)
}
