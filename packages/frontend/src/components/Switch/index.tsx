import React, { PropsWithChildren, useRef } from 'react'

import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = {
  disabled?: boolean
  checked?: boolean
  label?: string
  id?: string
  onChange: (value: boolean) => void
}
export default function Switch({ ...props }: PropsWithChildren<Props>) {
  const inputRef = useRef<HTMLInputElement>(null)

  const toggle = () => {
    if (!inputRef.current) {
      return
    }
    const prev = !!inputRef.current.checked

    inputRef.current.checked = !prev
  }
  return (
    <>
      <div onClick={toggle} className={styles.switchWrapper}>
        <input
          id={props.id}
          ref={inputRef}
          onChange={event => {
            props.onChange(event.currentTarget.checked)
          }}
          type='checkbox'
          disabled={props.disabled}
          checked={props.checked}
          aria-label={props.label}
        />
        <span
          className={classNames(styles.switchIndicator, {
            [styles.switchIndicatorOn]: props.checked,
          })}
        ></span>
      </div>
    </>
  )
}
