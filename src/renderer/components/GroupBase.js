const React = require('react')
const path = require('path')
const { dialog } = require('electron').remote
const ContactListItem = require('./ContactListItem')
const {
  Alignment,
  Classes,
  InputGroup,
  ControlGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button
} = require('@blueprintjs/core')

const DEFAULT_IMAGE = path.join(
  __dirname,
  '../../..',
  'images/group_default.png'
)

class GroupBase extends React.Component {
  constructor (props, state) {
    super(props)
    this.state = state
    this.state.group = this.state.group || {}
    this.state.name = this.state.name || ''
    this.state.image = this.state.image || ''
    this.back = this.back.bind(this)
  }

  addToGroup (contactId) {
    const group = this.state.group
    group[contactId] = true
    this.setState({ group })
  }

  removeFromGroup (contactId) {
    const group = this.state.group
    delete group[contactId]
    this.setState({ group })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  contactInGroup (contactId) {
    return !!this.state.group[contactId]
  }

  toggleContact (contactId) {
    if (this.contactInGroup(contactId)) {
      this.removeFromGroup(contactId)
    } else {
      this.addToGroup(contactId)
    }
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onSelectGroupImage () {
    const tx = window.translate
    dialog.showOpenDialog({
      title: tx('selectGroupImage'),
      filters: [ { name: 'Images', extensions: [ 'jpg', 'png', 'gif' ] } ],
      properties: [ 'openFile' ]
    }, files => {
      if (Array.isArray(files) && files.length > 0) {
        this.setState({ image: files[0] })
      }
    })
  }

  onRemoveImage () {
    this.setState({ image: '' })
  }

  onShowQrVerifyCode () {
    console.log('TODO: show qr verify code')
  }

  onShowQrInviteCode () {
    console.log('TODO: show qr invite code')
  }

  back () {
    this.props.changeScreen('CreateChat')
  }

  render () {
    const contacts = this._getContacts()
    const { showQrVerifyCode, showQrInviteCode } = this.state
    const tx = window.translate
    const image = this.state.image || DEFAULT_IMAGE

    return (
      <div>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <Button className={Classes.MINIMAL} icon='undo' onClick={this.back} />
            <NavbarHeading>{tx(this.state.heading)}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
        <div className='window'>
          <div className='GroupBase'>
            <div className='SelectGroupImage'>
              <img className='GroupImage' src={image} onClick={this.onSelectGroupImage.bind(this)} />
              <button disabled={!this.state.image} className='RemoveGroupImage' onClick={this.onRemoveImage.bind(this)}>{tx('remove')}</button>
            </div>
            { showQrVerifyCode && (<button className='QrVerifyCode' onClick={this.onShowQrVerifyCode.bind(this)}>{tx('showQrVerifyCode')}</button>) }
            { showQrInviteCode && (<button className='QrInviteCode' onClick={this.onShowQrInviteCode.bind(this)}>{tx('showQrInviteCode')}</button>) }
            <ControlGroup fill vertical={false}>
              <InputGroup
                type='text'
                id='name'
                value={this.state.name}
                onChange={this.handleNameChange.bind(this)}
                placeholder={tx('groupName')} />
              <Button
                disabled={this.isButtonDisabled()}
                onClick={this.onSubmit.bind(this)}
                text={tx(this.state.buttonLabel)} />
            </ControlGroup>
            {contacts.map((contact) => {
              return (
                <ContactListItem
                  color={this.contactInGroup(contact.id) ? 'green' : ''}
                  onClick={this.toggleContact.bind(this, contact.id)}
                  contact={contact}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  _getContacts () {
    const { contacts } = this.props.deltachat
    if (this.state.showVerifiedContacts) {
      return contacts.filter(c => c.isVerified === true)
    }
    return contacts
  }
}

module.exports = GroupBase
