import React, { PropsWithChildren } from 'react'

import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = {
  disabled?: boolean
  checked: boolean
  label?: string
  id?: string
  onChange: (value: boolean) => void | Promise<void>
}
export default function Switch({ ...props }: PropsWithChildren<Props>) {
  // this component just shows the state of props.checked
  // and triggers the onChange callback when the user toggles the switch
  const checked = props.checked

  const toggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const v = event.target.checked
    props.onChange(v)
    // No local state update! Parent controls everything
  }

  return (
    <div className={styles.switchWrapper}>
      <input
        id={props.id}
        type='checkbox'
        disabled={props.disabled}
        onChange={toggle}
        checked={checked}
        aria-label={props.label}
      />
      <span
        className={classNames(styles.switchIndicator, {
          [styles.switchIndicatorOn]: checked,
          [styles.disabled]: props.disabled,
        })}
      ></span>
    </div>
  )
}
