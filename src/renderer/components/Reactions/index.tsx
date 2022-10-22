import React from 'react'

import type { T } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'

type Props = {
  messageId: number
  reactions: T.Reactions
}

export default function Reaction(props: Props) {
  console.log(props.reactions)

  return <div className={styles.reaction}></div>
}
