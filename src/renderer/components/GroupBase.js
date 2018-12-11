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

const { QrCode } = require('./dialogs')
const NavbarWrapper = require('./NavbarWrapper')
const ContactList = require('./ContactList')

class GroupBase extends React.Component {
  constructor (props, state) {
    super(props)
    this.state = state
    this.state.group = this.state.group || {}
    this.state.name = this.state.name || ''
    this.state.qrCode = ''
    this.back = this.back.bind(this)
    this.closeQrCode = this.closeQrCode.bind(this)
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
    this.setState({
      qrCode: ipcRenderer.sendSync('dispatchSync', 'getQrCode')
    })
  }

  onShowQrInviteCode () {
    const { chatId } = this.state
    this.setState({
      qrCode: ipcRenderer.sendSync('dispatchSync', 'getQrCode', chatId)
    })
  }

  closeQrCode () {
    this.setState({ qrCode: '' })
  }

  back () {
    this.props.changeScreen('CreateChat')
  }

  render () {
    const {
      deltachat,
      showQrVerifyCodeButton,
      showQrInviteCodeButton,
      qrCode
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
                placeholder={tx('groupName')} />
              <Button
                disabled={this.isButtonDisabled()}
                onClick={this.onSubmit.bind(this)}
                text={tx(this.state.buttonLabel)} />
            </ControlGroup>
            <div className='SelectGroupImage'>
              <img className='GroupImage' src={image} onClick={this.onSelectGroupImage.bind(this)} />
              <button disabled={!this.state.image} className='RemoveGroupImage' onClick={this.onRemoveImage.bind(this)}>{tx('remove')}</button>
            </div>
            { showQrVerifyCodeButton && (<button onClick={this.onShowQrVerifyCode.bind(this)}>{tx('showQrVerifyCode')}</button>) }
            { showQrInviteCodeButton && (<button onClick={this.onShowQrInviteCode.bind(this)}>{tx('showQrInviteCode')}</button>) }
            <QrCode qrCode={qrCode} onClose={this.closeQrCode} />
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
