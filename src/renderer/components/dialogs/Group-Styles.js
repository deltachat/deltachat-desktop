import React from 'react'
import styled from 'styled-components'
import { AvatarBubble, AvatarImage } from '../contact/Contact'

export const GroupNameInput = styled.input`
  margin-left: 0px;
  margin-bottom: 10px;
  font-size: x-large;
  width: 100%;
  border: 0;
  border-bottom: solid;
  border-color: var(--loginInputFocusColor);
  height: 33px;
  background-color: transparent;
  color: var(--bp3MenuText);
`

export const GroupSettingsContainer = styled.div`
  margin-top: -8px;
  margin-left: -20px;
  margin-right: -20px;
  padding: 0px 65px 0px 20px;
`
export const GroupSeperator = styled.div`
  margin: ${({ noMargin }) => (noMargin ? '0px' : '20px -20px 0px -20px')};
  padding: 10px 15px;
  background-color: var(--bp3DialogBgSecondary);
  color: var(--bp3MenuText);
`

export const GroupMemberContactListWrapper = styled.div`
  margin-left: -20px;
  margin-right: -20px;
`

export const GroupImageUnsetButtonWrapper = styled.div`
  position: relative;
  width: 26px;
  height: 26px;
  left: -11px;
  top: -2px;
  background-color: #e56555;
  border-radius: 50%;
  &:hover,
  span:hover {
    cursor: pointer;
  }
  span {
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

export const GroupImageUnsetButton = props => {
  return (
    <GroupImageUnsetButtonWrapper {...props}>
      <span />
      <span />
    </GroupImageUnsetButtonWrapper>
  )
}

export const GroupImageWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`

export const GroupImage = props => {
  const {
    groupImage,
    onSetGroupImage,
    onUnsetGroupImage,
    ...otherProps
  } = props
  return (
    <GroupImageWrapper>
      {groupImage && (
        <AvatarImage
          avatarPath={groupImage}
          onClick={onSetGroupImage}
          {...otherProps}
          large
        />
      )}
      {!groupImage && (
        <AvatarBubble onClick={onSetGroupImage} {...otherProps} large>
          G
        </AvatarBubble>
      )}
      <GroupImageUnsetButton
        style={{ visibility: groupImage ? 'visible' : 'hidden' }}
        onClick={onUnsetGroupImage}
      />
    </GroupImageWrapper>
  )
}
