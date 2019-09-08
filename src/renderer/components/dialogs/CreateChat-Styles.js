import React from 'react'
import styled from 'styled-components'
import { AvatarBubble, AvatarImage, QRAvatar } from '../helpers/Contact'
import { PseudoContactListItem } from '../helpers/ContactList'

export const CreateChatContactListWrapper = styled.div`
  margin: -20px;
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

export const GroupNameInput = styled.input`
  margin-left: 20px;
  font-size: x-large;
  width: 78%;
  border: 0;
  border-bottom: solid;
  border-color: var(--loginInputFocusColor);
  height: 32px;
`

export const GroupSettingsContainer = styled.div`
  margin-top: -8px;
  margin-left: -20px;
  margin-right: -20px;
  padding: 0px 40px 0px 40px;
`
export const GroupSeperator = styled.div`
  margin: ${({ noMargin }) => noMargin ? '0px' : '20px -20px 0px -20px'};
  padding: 10px 20px;
  background-color: lightgrey;
  color: grey;
`

export const GroupMemberContactListWrapper = styled.div`
  margin-left: -20px;
  margin-right: -20px;
`

export const GroupMemberSearchInput = styled(CreateChatSearchInput)`
  margin-left: 40px;
  padding: 10px 0px;
  width: calc(100% - 80px);
`

export const NoSearchResultsAvatarBubble = styled(AvatarBubble)`
  transform: rotate(45deg); 
  line-height: 46px;
  letter-spacing: 1px;
  &::after {
    content: ':-(';
  }
`

export const GroupImageUnsetButtonWrapper = styled.div`
  position: relative;
  width: 26px;
  height: 26px;
  left: -11px;
  top: -2px;
  background-color: #e56555;
  border-radius: 50%;
  &:hover, span:hover {
    cursor: pointer;
  }
  span {GroupSettingsContainer
    display: block;
    position: relative;
    width: 16px;
    height: 3px;
    left: 5px;
    background-color: white;
    &:nth-child(1) {
      transform: rotate(130deg);
      top: 11px;
    }
    &:nth-child(2) {
      transform: rotate(-130deg);
      top: 8px;
    }
  }
`

export const GroupImageUnsetButton = (props) => {
  return <GroupImageUnsetButtonWrapper {...props} ><span /><span /></GroupImageUnsetButtonWrapper>
}

export const GroupImageWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`

export const GroupImage = (props) => {
  const { groupImage, onSetGroupImage, onUnsetGroupImage, ...otherProps } = props
  return (
    <GroupImageWrapper>
      { groupImage && <AvatarImage src={groupImage} onClick={onSetGroupImage} {...otherProps} /> }
      { !groupImage && <AvatarBubble onClick={onSetGroupImage} {...otherProps}>G</AvatarBubble> }
      <GroupImageUnsetButton style={{ visibility: groupImage ? 'visible' : 'hidden' }} onClick={onUnsetGroupImage} />
    </GroupImageWrapper>
  )
}

export const PseudoContactListItemNoSearchResults = ({ queryStr }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='addmember'
      text={tx('search_no_result_for_x', queryStr)}
    >
      <NoSearchResultsAvatarBubble />
    </PseudoContactListItem>
  )
}

export const PseudoContactListItemShowQrCode = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='showqrcode'
      text={tx('qrshow_title')}
      onClick={onClick}
    >
      <QRAvatar />
    </PseudoContactListItem>
  )
}

export const PseudoContactListItemAddMember = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='addmember'
      cutoff='+'
      text={tx('group_add_members')}
      onClick={onClick}
    />
  )
}
