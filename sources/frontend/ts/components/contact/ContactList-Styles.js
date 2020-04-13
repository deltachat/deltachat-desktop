import React from 'react'
import styled from 'styled-components'
import Contact, { PseudoContact } from './Contact'

const ContactListItemWrapper = styled.div`
  display: flex;
  &:hover {
    background-color: var(--chatListItemBgHover);
    cursor: pointer;
  }
`

const ContactListItemInitialSpacer = styled.div`
  min-width: 40px;
  max-width: 40px;
  height: 64px;
`
const ContactListItemContactWrapper = styled.div`
  width: 100%;
`

const ContactListItemCheckboxWrapper = styled.div`
  width: 40px;
  margin-right: 40px;
  input {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    margin-top: calc((64px - 20px) / 2);
    border: solid;
    border-radius: 3px;
    border-width: 2px;
    border-color: grey;
    &:checked {
      border-color: var(--loginInputFocusColor);
      background-color: var(--loginInputFocusColor);
    }
    &:disabled {
      border-color: grey;
      background-color: grey;
      cursor: default;
    }
  }

  .DeltaCheckmarkIcon {
    display: block;
    position: relative;
    top: -20px;
    visibility: ${({ checked }) => (checked ? 'visible' : 'hidden')};
  }

  input:hover,
  .DeltaCheckmarkIcon:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`

const DeltaCheckmarkIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  span:nth-child(1) {
    display: block;
    position: relative;
    width: 9px;
    height: 3px;
    right: -1px;
    bottom: -7px;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    background-color: white;
  }
  span:nth-child(2) {
    display: block;
    position: relative;
    height: 3px;
    width: 14px;
    top: 1px;
    right: -6px;
    -webkit-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
    background-color: white;
  }
`

const DeltaCheckmarkIcon = props => (
  <DeltaCheckmarkIconWrapper {...props} className='DeltaCheckmarkIcon'>
    <span />
    <span />
  </DeltaCheckmarkIconWrapper>
)

const DeltaCheckbox = props => {
  const { checked, disabled } = props
  const _onClick = props.onClick
  const onClick = e => typeof _onClick === 'function' && _onClick(e)
  return (
    <ContactListItemCheckboxWrapper checked={checked} disabled={disabled}>
      <input
        type='checkbox'
        disabled={disabled}
        onChange={onClick}
        checked={checked}
      />
      <DeltaCheckmarkIcon onClick={onClick} />
    </ContactListItemCheckboxWrapper>
  )
}
export default function ContactListItem(props) {
  const { contact, onClick, showCheckbox, checked } = props
  const onCheckboxClick = e => {
    if (!showCheckbox) return
    e && e.stopPropagation()
    typeof props.onCheckboxClick === 'function' &&
      props.onCheckboxClick(contact)
  }
  return (
    <ContactListItemWrapper
      key={contact.id}
      onClick={() => {
        onClick(contact)
        onCheckboxClick()
      }}
    >
      <ContactListItemInitialSpacer />
      <ContactListItemContactWrapper>
        <Contact contact={contact} />
      </ContactListItemContactWrapper>
      {showCheckbox && (
        <DeltaCheckbox
          checked={checked}
          disabled={contact.id === 1}
          onClick={onCheckboxClick}
        />
      )}
    </ContactListItemWrapper>
  )
}

export function PseudoContactListItem(props) {
  const { id, cutoff, text, subText, onClick, avatar } = props
  return (
    <ContactListItemWrapper key={id} onClick={onClick}>
      <ContactListItemInitialSpacer />
      <PseudoContact
        cutoff={cutoff}
        text={text}
        subText={subText}
        avatar={avatar}
      >
        {props.children}
      </PseudoContact>
    </ContactListItemWrapper>
  )
}

export const ContactListSearchInput = styled.input`
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
  margin-left: 20px;
  font-size: 18px;
`
