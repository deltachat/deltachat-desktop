import React from 'react'
import classNames from 'classnames'
import { Icon } from '@blueprintjs/core'

import type { ButtonHTMLAttributes } from 'react'
import type { IconProps } from '@blueprintjs/core'

import styles from './styles.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconProps['icon']
  iconSize: IconProps['size']
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
