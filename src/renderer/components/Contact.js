const React = require('react')
const { ContactListItem } = require('./conversations')

function convertContactProps (contact) {
  var props = {
    name: contact.name,
    phoneNumber: contact.address,
    avatarPath: contact.profileImage,
    profileName: contact.displayName,
    isMe: contact.displayName === 'Me',
    verified: contact.verified
  }
  return props
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
