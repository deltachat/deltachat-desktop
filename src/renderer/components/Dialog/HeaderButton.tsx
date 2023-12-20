import React from 'react'
import classNames from 'classnames'

import Icon from '../Icon'

import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '../Icon'

import styles from './styles.module.scss'

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
