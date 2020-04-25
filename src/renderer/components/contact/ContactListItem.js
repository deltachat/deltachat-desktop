import React from 'react'
import Contact from './Contact'
import { Icon } from '@blueprintjs/core'

const DeltaCheckbox = props => {
  const { checked, disabled } = props
  const _onClick = props.onClick
  const onClick = e => typeof _onClick === 'function' && _onClick(e)
  return (
    <div className='checkbox' checked={checked} disabled={disabled}>
      <input
        type='checkbox'
        disabled={disabled}
        onChange={onClick}
        checked={checked}
      />
      <div
        className='checkmark'
        onClick={onClick}
        style={{ visibility: checked ? 'visible' : 'hidden' }}
      >
        <span />
        <span />
      </div>
    </div>
  )
}
export function ContactListItem(props) {
  const { contact, onClick, showCheckbox, checked, showRemove } = props
  const onCheckboxClick = e => {
    if (!showCheckbox) return
    e && e.stopPropagation()
    typeof props.onCheckboxClick === 'function' &&
      props.onCheckboxClick(contact)
  }
  const onRemoveClick = e => {
    if (!showRemove) return
    e && e.stopPropagation()
    typeof props.onRemoveClick === 'function' && props.onRemoveClick(contact)
  }
  return (
    <div
      className='contact-list-item'
      key={contact.id}
      onClick={() => {
        onClick(contact)
        onCheckboxClick()
      }}
    >
      <div style={{ width: '100%' }}>
        <Contact contact={contact} />
      </div>
      {showCheckbox && (
        <DeltaCheckbox
          checked={checked}
          disabled={contact.id === 1}
          onClick={onCheckboxClick}
        />
      )}
      {showRemove && contact.id !== 1 && (
        <div className='remove-icon' onClick={onRemoveClick}>
          <Icon icon='cross' />
        </div>
      )}
    </div>
  )
}
