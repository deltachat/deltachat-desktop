import React from 'react'
import { Icon, IconProps } from '@blueprintjs/core'

import type { PropsWithChildren } from 'react'
import type { DialogProps } from '../dialogs/DialogController'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  /* Choose an icon from BlueprintJS */
  iconName?: IconProps['icon']
  /* Choose an icon via file path */
  iconPath?: string
  /* Additionally indicate that this is a link */
  isLink?: boolean
}> &
  Pick<DialogProps, 'onClick'>

export default function SettingsIconButton({
  children,
  iconName,
  iconPath,
  isLink = false,
  onClick,
}: Props) {
  return (
    <button className={styles.settingsIconButton} onClick={onClick}>
      {iconPath && (
        <div
          className={styles.settingsIconMask}
          style={{
            WebkitMask: `url(${iconPath}) no-repeat center`,
          }}
        />
      )}
      {iconName && (
        <Icon className={styles.settingsIconSVG} icon={iconName} size={22} />
      )}
      <span className={styles.settingsIconButtonLabel}>{children}</span>
      {isLink && (
        <div
          className={styles.settingsIconMask}
          style={{
            WebkitMask: 'url(../images/icons/open_in_new.svg) no-repeat center',
          }}
        />
      )}
    </button>
  )
}
