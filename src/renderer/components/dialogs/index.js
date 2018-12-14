const SetupMessage = require('./SetupMessage')
const MessageDetail = require('./MessageDetail')
const RenderMedia = require('./RenderMedia')
const ContactDetail = require('./ContactDetail')
const DeadDrop = require('./DeadDrop')
const KeyTransfer = require('./KeyTransfer')
const QrCode = require('./QrCode')
const ImexProgress = require('./ImexProgress')
const About = require('./About')
const Settings = require('./Settings')
const ForwardMessage = require('./ForwardMessage')
const confirmation = require('./confirmationDialog')
const encrInfo = require('./EncrInfo')

module.exports = {
  SetupMessage,
  ContactDetail,
  DeadDrop,
  RenderMedia,
  MessageDetail,
  KeyTransfer,
  QrCode,
  ImexProgress,
  About,
  Settings,
  ForwardMessage,
  confirmation,
  encrInfo
}
