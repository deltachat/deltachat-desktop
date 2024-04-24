import React from 'react'

import styles from './styles.module.scss'

type Props = {
  checked?: boolean
  disabled?: boolean
  id?: string
  name?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export default function Checkbox({
  checked = false,
  disabled = false,
  ...props
}: Props) {
  return (
    <input
      className={styles.checkbox}
      type='checkbox'
      disabled={disabled}
      checked={checked}
      {...props}
    />
  )
}
