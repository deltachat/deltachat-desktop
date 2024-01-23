import React, { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/useDialog'
import ReactionsDialog from '../dialogs/ReactionsDialog'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const SHOW_MAX_DIFFERENT_EMOJIS = 5

type Props = {
  reactions: T.Reactions
}

export default function Reactions(props: Props) {
  const { openDialog } = useDialog()
  const { reactionsByContact, reactions } = props.reactions

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      reactionsByContact,
    })
  }

  // proably makes more sense to have some contacts cache to not make too many requests to core
  const reactionContactIds = useMemo(
    () => Object.keys(reactionsByContact).map(key => Number(key)),
    [reactionsByContact]
  )
  const [reactionContacts, setReactionContacts] = useState<Record<
    number,
    T.Contact
  > | null>(null)
  useEffect(() => {
    BackendRemote.rpc
      .getContactsByIds(selectedAccountId(), reactionContactIds)
      .then(setReactionContacts)
  }, [reactionContactIds])

  return (
    <div className={styles.reactions} onClick={handleClick}>
      {reactions
        .slice(0, SHOW_MAX_DIFFERENT_EMOJIS)
        .map(({ emoji, isFromSelf, count }) => {
          const contacts = []

          if (reactionContacts) {
            for (const contactId in reactionsByContact) {
              if (
                Object.prototype.hasOwnProperty.call(
                  reactionsByContact,
                  contactId
                )
              ) {
                if (reactionsByContact[contactId].includes(emoji)) {
                  const contact = reactionContacts[contactId]
                  contact && contacts.push(contact.displayName)
                }
              }
            }
          }

          // todo translation string
          const title = `${emoji} reacted by ${contacts.join(', ')}`

          return (
            <span
              className={classNames(styles.emoji, {
                [styles.isFromSelf]: isFromSelf,
              })}
              key={emoji}
              title={title}
            >
              {emoji}
              {count > 1 && <span className={styles.emojiCount}>{count}</span>}
            </span>
          )
        })}
      {reactions.length > SHOW_MAX_DIFFERENT_EMOJIS && (
        <span className={classNames(styles.emoji, styles.showMore)} />
      )}
    </div>
  )
}
