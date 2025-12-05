import React, { MouseEventHandler, useRef } from 'react'
import Contact from './Contact'
import classNames from 'classnames'
import { Type } from '../../backend-com'
import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useRovingTabindex } from '../../contexts/RovingTabindex'

export const DeltaCheckbox = (props: {
  checked: boolean
  disabled?: boolean
  onClick?: (event: React.SyntheticEvent) => void
  tabIndex?: 0 | -1
}) => {
  const { checked, disabled, tabIndex } = props
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
        tabIndex={tabIndex}
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
export function ContactListItem(
  props: {
    tagName: 'li' | 'div'
    style?: React.CSSProperties
    contact: Type.Contact
    onClick?: (contact: Type.Contact) => void
    showCheckbox: boolean
    checked: boolean
    showRemove: boolean
    onCheckboxClick?: (contact: Type.Contact) => void
    onRemoveClick?: (contact: Type.Contact) => void
    disabled?: boolean
    onContextMenu?: MouseEventHandler<HTMLButtonElement>
  } & Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'aria-setsize' | 'aria-posinset'
  >
) {
  const tx = useTranslationFunction()

  const {
    contact,
    onClick,
    showCheckbox,
    checked,
    showRemove,
    disabled,
    onContextMenu,
  } = props

  const checkboxDisabled = disabled || contact.id === 1

  const refMain = useRef<HTMLButtonElement>(null)

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

  // Keep in mind that this component is not always placed inside of
  // `RovingTabindexContext`. It's fine, because `useRovingTabindex`
  // will simply always return `tabIndex === 0` in this case.
  const rovingTabindex = useRovingTabindex(refMain)

  return (
    <props.tagName
      className={classNames('contact-list-item', { disabled })}
      style={props.style}
      key={contact.id}
      // Apply these to the wrapper element,
      // because there may be several interactive elements in this component.
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
      // FYI NVDA doesn't announce these, as of 2025-04.
      // They probably need to be on the focusable item
      // in order for it to work.
      aria-setsize={props['aria-setsize']}
      aria-posinset={props['aria-posinset']}
    >
      <button
        type='button'
        ref={refMain}
        className={classNames(
          'contact-list-item-button',
          rovingTabindex.className,
          { disabled }
        )}
        // `aria-disabled` instead of just `disabled` because we probably
        // still want to keep it focusable so that the context menu can be
        // activated, and for screen-readers.
        aria-disabled={disabled}
        // Keep in mind that we have to be careful with disabled elements
        // that are also part of the roving tabindex widget,
        // because `tabindex="0"` does _not_ make disabled elements focusable.
        disabled={disabled && !onContextMenu}
        tabIndex={rovingTabindex.tabIndex}
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
        aria-haspopup={onContextMenu != undefined ? 'menu' : undefined}
      >
        <Contact contact={contact} />
      </button>
      {showCheckbox && (
        <DeltaCheckbox
          checked={checked}
          disabled={checkboxDisabled}
          tabIndex={checkboxDisabled ? undefined : rovingTabindex.tabIndex}
          onClick={onCheckboxClick}
        />
      )}
      {showRemove && contact.id !== 1 && (
        <button
          type='button'
          className='btn-remove'
          onClick={onRemoveClick}
          disabled={disabled}
          tabIndex={disabled ? undefined : rovingTabindex.tabIndex}
          aria-label={tx('remove_desktop')}
        >
          <Icon icon='cross' coloring='remove' />
        </button>
      )}
    </props.tagName>
  )
}
