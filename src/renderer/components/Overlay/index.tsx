import React from 'react'

import classNames from 'classnames'

import styles from './style.module.scss'

type Props = React.PropsWithChildren<{
  className?: string
  isOpen: boolean
  onClick?: (ev: React.MouseEvent) => void
}>

export default function Overlay({
  className,
  children,
  isOpen,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={classNames(className, {
        [styles.overlayOpen]: isOpen,
        [styles.overlayClosed]: !isOpen,
      })}
    >
      <div className={styles.overlayBackdrop}></div>
      <div className={styles.overlayContent}>{children}</div>
    </div>
  )
}
