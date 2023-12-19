import React from 'react'

import Icon from '../Icon'

import type { PropsWithChildren } from 'react'
import type { DialogProps } from '../dialogs/DialogController'
import type { IconName } from '../Icon'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  icon: IconName
  isLink?: boolean
}> &
  Pick<DialogProps, 'onClick'>

export default function SettingsIconButton({
  children,
  icon,
  isLink = false,
  onClick,
}: Props) {
  return (
    <button className={styles.settingsIconButton} onClick={onClick}>
      <Icon className={styles.settingsIcon} icon={icon} />
      <span className={styles.settingsIconButtonLabel}>{children}</span>
      {isLink && <Icon className={styles.settingsIcon} icon='open_in_new' />}
    </button>
  )
}
