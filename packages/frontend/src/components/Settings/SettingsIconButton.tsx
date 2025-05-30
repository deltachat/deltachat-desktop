import React from 'react'

import Icon from '../Icon'

import type { IconName } from '../Icon'
import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  icon: IconName
  isLink?: boolean
  onClick: () => void
  dataTestid?: string
}>

export default function SettingsIconButton({
  children,
  icon,
  isLink = false,
  onClick,
  dataTestid,
}: Props) {
  return (
    <button
      className={styles.settingsIconButton}
      onClick={onClick}
      data-testid={dataTestid}
    >
      <Icon className={styles.settingsIcon} icon={icon} />
      <span className={styles.settingsIconButtonLabel}>{children}</span>
      {isLink && <Icon className={styles.settingsIcon} icon='open_in_new' />}
    </button>
  )
}
