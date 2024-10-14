import React, { PropsWithChildren, useState } from 'react'

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
  const [checked, setChecked] = useState(props.checked)

  const toggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const v = event.target.checked
    props.onChange(v)
    setChecked(v)
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
        })}
      ></span>
    </div>
  )
}
