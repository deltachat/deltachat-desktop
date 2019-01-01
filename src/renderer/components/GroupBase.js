const { ipcRenderer } = require('electron')
const React = require('react')
const { dialog } = require('electron').remote

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

const NavbarWrapper = require('./NavbarWrapper')
const ContactList = require('./ContactList')

class GroupBase extends React.Component {
  constructor (props, state) {
    super(props)
    this.state = state
    this.state.group = this.state.group || {}
    this.state.name = this.state.name || ''
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

  toggleContact (contact) {
    var contactId = contact.id
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
      title: tx('select_group_image_desktop'),
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
    const qrCode = ipcRenderer.sendSync('dispatchSync', 'getQrCode')
    this.props.openDialog('QrCode', { qrCode })
  }

  onShowQrInviteCode () {
    const { chatId } = this.state
    const qrCode = ipcRenderer.sendSync('dispatchSync', 'getQrCode', chatId)
    this.props.openDialog('QrCode', { qrCode })
  }

  back () {
    this.props.changeScreen('CreateChat')
  }

  render () {
    const {
      showQrVerifyCodeButton,
      showQrInviteCodeButton
    } = this.state
    const tx = window.translate
    const image = this.state.image || '../images/group_default.png'

    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              <Button className={Classes.MINIMAL} icon='undo' onClick={this.back} />
              <NavbarHeading>{tx(this.state.heading)}</NavbarHeading>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div className='window'>
          <div className='GroupBase'>
            <ControlGroup fill vertical={false}>
              <InputGroup
                type='text'
                id='name'
                value={this.state.name}
                onChange={this.handleNameChange.bind(this)}
                placeholder={tx('group_name_desktop')} />
              <Button
                disabled={this.isButtonDisabled()}
                onClick={this.onSubmit.bind(this)}
                text={tx(this.state.buttonLabel)} />
            </ControlGroup>
            <div className='SelectGroupImage'>
              <img className='GroupImage' src={image} onClick={this.onSelectGroupImage.bind(this)} />
              <button disabled={!this.state.image} className='RemoveGroupImage' onClick={this.onRemoveImage.bind(this)}>{tx('remove_desktop')}</button>
            </div>
            { showQrVerifyCodeButton && (<button onClick={this.onShowQrVerifyCode.bind(this)}>{tx('show_qr_verify_code_desktop')}</button>) }
            { showQrInviteCodeButton && (<button onClick={this.onShowQrInviteCode.bind(this)}>{tx('show_qr_invite_code_desktop')}</button>) }
            <ContactList
              childProps={(contact) => {
                return { color: this.contactInGroup(contact.id) ? 'green' : '' }
              }}
              onContactClick={this.toggleContact.bind(this)}
            />
          </div>
        </div>
      </div>
    )
  }
}

module.exports = GroupBase
