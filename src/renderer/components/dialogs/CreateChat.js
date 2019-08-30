import React, { Fragment, useState, useEffect, useContext } from 'react'
import SmallDialog, { DeltaButton } from '../helpers/SmallDialog'
import styled, { createGlobalStyle, css } from 'styled-components'
import { useContacts, ContactList2, ContactListItem, PseudoContactListItem } from '../helpers/ContactList'
import { AvatarBubble, AvatarImage } from '../helpers/Contact'
import ScreenContext from '../../contexts/ScreenContext'
import { Card, Classes, Dialog } from '@blueprintjs/core'
import { callDcMethodAsync } from '../../ipc'
import classNames from 'classnames'
import { DeltaDialogBase, DeltaDialogCloseButton } from '../helpers/DeltaDialog'
import debounce from 'debounce'
import C from 'deltachat-node/constants'
import { DeltaButtonPrimary, DeltaButtonDanger } from '../helpers/SmallDialog'
import { remote } from 'electron'

const OvalDeltaButton = styled.button`
  background-color: ${props => props.theme.ovalButtonBg};
  padding: 10px;
  border-style: none;
  border-radius: 180px;
  margin: 10px;
  font-weight: bold;
  color: ${props => props.theme.ovalButtonText};
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${props => props.theme.ovalButtonBgHover};
    color: ${props => props.theme.ovalButtonTextHover};
  }
`

const CreateChatContactListWrapper = styled.div`
  background-color: var(--bp3DialogBgPrimary);
`


export const CreateChatSearchInput = styled.input`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  margin: 0;
  line-height: inherit;
  border: 0px;
  font-size: 18px;
`

export default function CreateChat (props) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { changeScreen, userFeedback } = useContext(ScreenContext)
  const [show, setShow] = useState('main')

  const [queryStr, setQueryStr] = useState('')
  const queryStrIsEmail = isValidEmail(queryStr)
  const [contacts, updateContacts] = useContacts(C.DC_GCL_ADD_SELF, queryStr)
  
  const closeDialogAndSelectChat = chatId => { 
    onClose()
    changeScreen('ChatView', { chatId })
  }

  const chooseContact = async ({ id }) => {
    const chatId = await callDcMethodAsync('createChatByContactId', id)

    if (!chatId) {
      return userFeedback({ type: 'error', text: tx('create_chat_error_desktop') })
    }
    closeDialogAndSelectChat(chatId)
  }


  const onSearchChange = e => {
    let queryStr = e.target.value
    setQueryStr(queryStr)
    updateContacts(C.DC_GCL_ADD_SELF, queryStr)
  }

  const renderAddGroupIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <Fragment>
        <PseudoContactListItem
          id='newgroup'
          cutoff='+'
          text={tx('menu_new_group')}
          onClick={() => setShow('createGroup')}
        />
        <PseudoContactListItem
          id='newverifiedgroup'
          cutoff='+'
          text={tx('menu_new_verified_group')}
        />
      </Fragment>
    )
  }
  
  const addContactOnClick = async () => {
    if (!queryStrIsEmail) return
    
    const contactId = await callDcMethodAsync('createContact', [queryStr, queryStr])
    const chatId = await callDcMethodAsync('createChatByContactId', contactId)
    closeDialogAndSelectChat(chatId)
  }

  const renderAddContactIfNeeded = () => {
    if (queryStr === '' ||
        (contacts.length === 1 && contacts[0].address.toLowerCase() == queryStr.toLowerCase())) {
      return null
    }
    return (
      <PseudoContactListItem
        id='newcontact'
        cutoff='+'
        text={tx('menu_new_contact')}
        subText={queryStrIsEmail ? queryStr + ' ...' : tx('contacts_type_email_above')}
        onClick={addContactOnClick}
      />
    )
  }


  return (
     <DeltaDialogBase 
       isOpen={isOpen}
       onClose={onClose}
       style={{ width: '400px' }}
       fixed
     >
        { show === 'main' && 
          (<>
            <div className='bp3-dialog-header'>
              <CreateChatSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} autoFocus />
              <DeltaDialogCloseButton onClick={onClose} />
            </div>
            <div className={Classes.DIALOG_BODY}>
              <CreateChatContactListWrapper>
                { renderAddGroupIfNeeded()}
                <ContactList2 contacts={contacts} onClick={chooseContact} />
                {renderAddContactIfNeeded()}
              </CreateChatContactListWrapper>
            </div>
            <div className={Classes.DIALOG_FOOTER} />
          </>)
        }
        { show === 'createGroup' && <CreateGroupInner {...{show, setShow, onClose}} />}
     </DeltaDialogBase>
  )
}

export const GroupNameInput = styled.input`
  margin-left: 20px;
  font-size: x-large;
  width: 78%;
  border: 0;
  border-bottom: solid;
  border-color: var(--loginInputFocusColor);
  height: 32px;
  margin-top: calc((54px - 27px) / 2);
`

const CreateGroupSettingsContainer = styled.div`
  margin-left: -20px;
  margin-right: -20px;
  padding: 0px 40px 0px 40px;
`
const CreateGroupSeperator = styled.div`
  margin: ${({noMargin}) => noMargin ? '0px' : '20px -20px 0px -20px'};
  padding: 10px 20px;
  background-color: lightgrey;
  color: grey;
`

const CreateGroupMemberContactListWrapper = styled.div`
  margin-left: -20px;
  margin-right: -20px;
`

const CreateGroupMemberSearchInput = styled(CreateChatSearchInput)`
  margin-left: 40px;
  padding: 10px 0px;
  width: calc(100% - 80px);
`

const NoSearchResultsAvatarBubble = styled(AvatarBubble)`
  transform: rotate(45deg); 
  line-height: 46px;
  letter-spacing: 1px;
  &::after {
    content: ':-(';
  }
`


const Circle = styled.div`
  position: relative;
  width: 26px;
  height: 25px;
  left: -8px;
  background-color: #e56555;
  border-radius: 50%;
`

const CrossWrapperSpanMixin = css`
    display: block;
    position: relative;
    width: 22px;
    height: 3px;
    top: 11px;
    left: 2px;
    background-color: white;
`
const CrossWrapper = styled.div`
   span:nth-child(1) {
    ${CrossWrapperSpanMixin}
    transform: rotate(135deg);
  }
  span:nth-child(2) {
    ${CrossWrapperSpanMixin}
    transform: rotate(-135deg);
    top: 8px;
  }
`

const Cross = (props) => <CrossWrapper><span/><span/></CrossWrapper>
const GroupImageUnsetButton = (props) => {
  const { onClick } = props
  return <Circle onClick={onClick}><Cross/></Circle>
}

const GroupImage = (props) => {
  const { groupImage, onSetGroupImage, onUnsetGroupImage } = props
  if (groupImage) return <><AvatarImage src={groupImage} onClick={onSetGroupImage} {...props}/><GroupImageUnsetButton onClick={onUnsetGroupImage}/></>
  return <AvatarBubble onClick={onSetGroupImage} {...props}>G</AvatarBubble>
}

export function CreateGroupInner({show, setShow, onClose}) {
  const tx = window.translate
  const { openD } = useContext(ScreenContext)

  const [queryStr, setQueryStr] = useState('')
  const [groupMembers, setGroupMembers] = useState([1])
  const [groupImage, setGroupImage] = useState('')
  const [searchContacts, updateSearchContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const searchContactsToAdd = queryStr !== '' ?  
    searchContacts.filter(({id}) => groupMembers.indexOf(id) === -1).filter((_, i) => i < 5) :
    []
  const onSearchChange = e => {
    let queryStr = e.target.value
    setQueryStr(queryStr)
    updateSearchContacts(C.DC_GCL_ADD_SELF, queryStr)
  }

  const onSetGroupImage = () => { 
    remote.dialog.showOpenDialog({
      title: tx('select_group_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
      properties: ['openFile']
    }, files => {
      if (Array.isArray(files) && files.length > 0) {
        setGroupImage(files[0])
      }
    })
  }

  const onUnsetGroupImage = () => setGroupImage('')

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoContactListItem
          id='addmember'
          cutoff='+'
          text={tx('group_add_members')}
          onClick={() => {}}
        />
        <PseudoContactListItem
          id='showqrcode'
          cutoff='+'
          text={tx('qrshow_title')}
        />
      </>   
    )   
  }

  const removeGroupMember = ({id}) => id !== 1 && setGroupMembers(groupMembers.filter(gId => gId !== id))
  const addGroupMember = ({id}) => setGroupMembers([...groupMembers, id])

  return (
    <>
      <div className='bp3-dialog-header'>
        <button onClick={() => setShow('main')} className='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left' />
        <h4 className='bp3-heading'>{tx('menu_new_group')}</h4>
        <DeltaDialogCloseButton onClick={onClose} />
      </div>

      <div className={Classes.DIALOG_BODY}>
        <Card>
          <CreateGroupSettingsContainer>
            <GroupImage style={{float: 'left'}} groupImage={groupImage} onSetGroupImage={onSetGroupImage} onUnsetGroupImage={onUnsetGroupImage}/>
            <GroupNameInput placeholder={tx('group_name')} autoFocus />
          </CreateGroupSettingsContainer>
          <CreateGroupSeperator>{tx('n_members', groupMembers.length, groupMembers.length <= 1 ? 'one' : 'other' )}</CreateGroupSeperator>
          <CreateGroupMemberContactListWrapper>
            <CreateGroupMemberSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} />
            {renderAddMemberIfNeeded()}  
            <ContactList2
              contacts={searchContacts.filter(({id}) => groupMembers.indexOf(id) !== -1)}
              onClick={()=>{}}
              showCheckbox
              isChecked={() => true}
              onCheckboxClick={removeGroupMember}
            />
            {queryStr !== '' && searchContactsToAdd.length !== 0 && (
              <>
                <CreateGroupSeperator noMargin>{tx('group_add_members')}</CreateGroupSeperator>
                <ContactList2
                  contacts={searchContactsToAdd}
                  onClick={()=>{}}
                  showCheckbox
                  isChecked={() => false}
                  onCheckboxClick={addGroupMember}
                />
              </>
            )}
            {queryStr !== '' && searchContacts.length === 0 && (
              <>
              <PseudoContactListItem
                id='addmember'
                text={tx('search_no_result_for_x', queryStr)}
                onClick={() => {}}
              >
                <NoSearchResultsAvatarBubble />
              </PseudoContactListItem>
              </>
            )}
          </CreateGroupMemberContactListWrapper>
        </Card>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div
          className={Classes.DIALOG_FOOTER_ACTIONS}
        >
          <DeltaButtonPrimary
            noPadding
            onClick={() => onClick(true)}
          >
            {tx('group_create_button')}
          </DeltaButtonPrimary>
        </div>
      </div>
    </>
  )

}

function isValidEmail(email) {
  // empty string is not allowed
  if (email == '') return false
  let parts = email.split('@')
  // missing @ character or more than one @ character
  if (parts.length !== 2) return false
  let [local, domain] = parts 
  // empty string is not valid for local part
  if(local == '') return false
  // domain is too short
  if(domain.length <= 3) return false
  let dot = domain.indexOf('.')
  // invalid domain without a dot
  if(dot === -1) return false
  // invalid domain if dot is (second) last character
  if(dot >= domain.length - 2) return false
  
  return true  
}


