import React, { MouseEventHandler } from 'react'
import Contact from './Contact'
import classNames from 'classnames'
import { Type } from '../../backend-com'
import Icon from '../Icon'

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
  contact: Type.Contact
  onClick?: (contact: Type.Contact) => void
  showCheckbox: boolean
  checked: boolean
  showRemove: boolean
  onCheckboxClick?: (contact: Type.Contact) => void
  onRemoveClick?: (contact: Type.Contact) => void
  disabled?: boolean
  onContextMenu?: MouseEventHandler<HTMLButtonElement>
}) {
  const {
    contact,
    onClick,
    showCheckbox,
    checked,
    showRemove,
    disabled,
    onContextMenu,
  } = props
  const onCheckboxClick = () => {
    if (disabled) return
    if (!showCheckbox) return
    typeof props.onCheckboxClick === 'function' &&
      props.onCheckboxClick(contact)
  }
  const onRemoveClick = () => {
    if (disabled) return
    if (!showRemove) return
    typeof props.onRemoveClick === 'function' && props.onRemoveClick(contact)
  }
  return (
    <div
      className={classNames('contact-list-item', { disabled })}
      key={contact.id}
    >
      <button
        className={classNames('contact-list-item-button', { disabled })}
        // `aria-disabled` instead of just `disabled` because we probably
        // still want to keep it focusable so that the context menu can be
        // activated, and for screen-readers.
        aria-disabled={disabled}
        disabled={disabled && !onContextMenu}
        onClick={() => {
          if (disabled) return
          onClick && onClick(contact)
          // TODO improvement: in "Add Members" dialog,
          // this button and the checkbox are both focusable
          // and they both do the same thing...
          // This could be confusing for keyboard users.
          // Perhaps we should make this button take full width,
          // and make the checkbox unfocusable?
          // Or is it not a big deal since we're gonna add arrow key shortcuts?
          onCheckboxClick()
        }}
        onContextMenu={onContextMenu}
      >
        <Contact contact={contact} />
      </button>
      {showCheckbox && (
        <DeltaCheckbox
          checked={checked}
          disabled={disabled || contact.id === 1}
          onClick={onCheckboxClick}
        />
      )}
      {showRemove && contact.id !== 1 && (
        <button
          className='btn-remove'
          onClick={onRemoveClick}
          disabled={disabled}
        >
          <Icon icon='cross' coloring='remove' />
        </button>
      )}
    </div>
  )
}
