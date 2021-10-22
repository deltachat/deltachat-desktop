import React from 'react'
import Contact from './Contact'
import { Icon } from '@blueprintjs/core'
import { JsonContact } from '../../../shared/shared-types'
import classNames from 'classnames'

export const DeltaCheckbox = (props: {
  checked: boolean
  disabled?: boolean
  onClick?: (event: React.SyntheticEvent) => void
}) => {
  const { checked, disabled } = props
  const _onClick = props.onClick
  const onClick = (
    event: React.ChangeEvent<any> | React.MouseEvent<any, MouseEvent>
  ) => {
    typeof _onClick === 'function' && _onClick(event)
  }
  return (
    <div className='delta-checkbox'>
      <input
        type='checkbox'
        disabled={disabled === true}
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
export function ContactListItem(props: {
  contact: JsonContact
  onClick?: (contact: JsonContact) => void
  showCheckbox: boolean
  checked: boolean
  showRemove: boolean
  onCheckboxClick?: (contact: JsonContact) => void
  onRemoveClick?: (contact: JsonContact) => void
  disabled?: boolean
}) {
  const {
    contact,
    onClick,
    showCheckbox,
    checked,
    showRemove,
    disabled,
  } = props
  const onCheckboxClick = (e?: React.SyntheticEvent) => {
    if (disabled) return
    if (!showCheckbox) return
    e && e.stopPropagation()
    typeof props.onCheckboxClick === 'function' &&
      props.onCheckboxClick(contact)
  }
  const onRemoveClick = (e?: React.SyntheticEvent) => {
    if (disabled) return
    if (!showRemove) return
    e && e.stopPropagation()
    typeof props.onRemoveClick === 'function' && props.onRemoveClick(contact)
  }
  return (
    <div
      className={classNames('contact-list-item', { disabled })}
      key={contact.id}
      onClick={() => {
        if (disabled) return
        onClick && onClick(contact)
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
