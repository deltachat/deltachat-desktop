import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'

import Checkbox from '../Checkbox'

import styles from './styles.module.scss'

type Props = {
  checked?: boolean
  disabled?: boolean
  name: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export default function CheckboxWithLabel({
  checked = false,
  children,
  disabled = false,
  name,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <label
      className={classNames(styles.label, {
        [styles.disabled]: disabled,
      })}
      htmlFor={name}
    >
      <Checkbox
        id={name}
        name={name}
        disabled={disabled}
        checked={checked}
        {...props}
      />
      <span className={styles.labelInner}>{children}</span>
    </label>
  )
}
