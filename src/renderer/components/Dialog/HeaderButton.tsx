import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'
import Icon from '../Icon'

import type { IconName } from '../Icon'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  iconSize: number
}

export default function HeaderButton({
  className,
  icon,
  iconSize,
  ...props
}: Props) {
  return (
    <button className={classNames(styles.headerButton, className)} {...props}>
      <Icon className={styles.headerButtonIcon} icon={icon} size={iconSize} />
    </button>
  )
}
