import React from 'react'

import { InlineVerifiedIcon } from '../VerifiedIcon'

import styles from './styles.module.scss'

type Props = {
  displayName: string
  address?: string
  isVerified?: boolean
  isPgpContact?: boolean
}

export default function ContactName(props: Props) {
  return (
    <div className={styles.contactName}>
      <div className={styles.contactNameDisplay}>
        <span className={styles.contactNameTruncated}>{props.displayName}</span>
        {props.isVerified && <InlineVerifiedIcon />}
      </div>
      {!!props.address && (
        <div className={styles.contactNameAddress}>{props.address}</div>
      )}
    </div>
  )
}
