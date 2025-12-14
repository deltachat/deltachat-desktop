import React from 'react'

import styles from './styles.module.scss'

type Props = {
  displayName: string
  address?: string
  isVerified?: boolean
}

export default function ContactName(props: Props) {
  return (
    <div className={styles.contactName}>
      <div className={styles.contactNameDisplay}>
        <span className={styles.contactNameTruncated}>{props.displayName}</span>
      </div>
      {!!props.address && (
        <div className={styles.contactNameAddress}>{props.address}</div>
      )}
    </div>
  )
}
