const React = require('react')
const { ContactListItem } = require('./conversations')
const DCConstants = require('deltachat-node/constants')

function convertContactProps (contact) {
  return {
    name: contact.name,
    phoneNumber: contact.address,
    avatarPath: contact.profileImage,
    profileName: contact.displayName,
    isMe: contact.id === DCConstants.DC_CONTACT_ID_SELF,
    verified: contact.isVerified
  }
}

function RenderContact (props) {
  const contact = props.contact

  var outgoingProps = convertContactProps(contact)

  const oldOnClick = props.onClick
  outgoingProps.onClick = function (event) {
    if (oldOnClick) oldOnClick(contact)
  }

  outgoingProps.color = props.color

  return (<ContactListItem {...outgoingProps} />)
}

module.exports = {
  RenderContact,
  convertContactProps
}
