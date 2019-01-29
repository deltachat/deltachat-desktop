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

const styled = require('styled-components').default

const GroupMemberTable = styled.table`
    width:100%;
    td{
      width 50%;
      vertical-align: top;
    }
`

class GroupBase extends React.Component {
  constructor (props, state) {
    super(props)
    this.state = state
    this.state.group = this.state.group || {}
    this.state.name = this.state.name || ''
    this.back = this.back.bind(this)
    this.state.changedContacts = this.state.changedContacts || {}
  }

  addToGroup (contactId) {
    const group = this.state.group
    group[contactId] = true
    const changedContacts = this.state.changedContacts
    changedContacts[contactId] = (typeof changedContacts[contactId] === 'undefined' || changedContacts[contactId] === false)
    this.setState({ group, changedContacts })
  }

  removeFromGroup (contactId) {
    const group = this.state.group
    delete group[contactId]
    const changedContacts = this.state.changedContacts
    changedContacts[contactId] = (typeof changedContacts[contactId] === 'undefined' || changedContacts[contactId] === false)
    this.setState({ group, changedContacts })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // we don't care about the props for now, really.
    return (this.state !== nextState)
  }

  contactInGroup (contactId) {
    return !!this.state.group[contactId]
  }

  contactInGroupStateChanged (contactId) {
    const changedContacts = this.state.changedContacts
    return !(typeof changedContacts[contactId] === 'undefined' || changedContacts[contactId] === false)
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
    const qrCode = ipcRenderer.sendSync('getQrCode')
    this.props.openDialog('QrCode', { qrCode })
  }

  onShowQrInviteCode () {
    const { chatId } = this.state
    const qrCode = ipcRenderer.sendSync('getQrCode', chatId)
    this.props.openDialog('QrCode', { qrCode })
  }

  back () {
    this.props.changeScreen('CreateChat')
  }

  render () {
    const {
      showQrVerifyCodeButton,
      showQrInviteCodeButton,
      showVerifiedContacts
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
            <GroupMemberTable>
              <thead><tr><th>{tx('in_this_group_desktop')}</th><th>{tx('not_in_this_group_desktop')}</th></tr></thead>
              <tbody>
                <tr>
                  <td>
                    <ContactList
                      filter={(contact) => this.contactInGroup(contact.id)}
                      childProps={(contact) => {
                        return { color: !this.contactInGroupStateChanged(contact.id) ? 'green' : 'yellow' }
                      }}
                      onContactClick={this.toggleContact.bind(this)}
                      showVerifiedContacts={showVerifiedContacts}
                    />
                  </td>
                  <td>
                    <ContactList
                      filter={(contact) => !this.contactInGroup(contact.id)}
                      childProps={(contact) => {
                        return { color: this.contactInGroupStateChanged(contact.id) ? 'red' : '' }
                      }}
                      onContactClick={this.toggleContact.bind(this)}
                      showVerifiedContacts={showVerifiedContacts}
                    />
                  </td>
                </tr>
              </tbody>
            </GroupMemberTable>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = GroupBase
