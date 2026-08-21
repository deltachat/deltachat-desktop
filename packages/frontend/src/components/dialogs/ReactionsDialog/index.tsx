import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import { AvatarFromContact } from '../../Avatar'
import ContactName from '../../ContactName'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { type T, C } from '@deltachat/jsonrpc-client'

import useOpenViewProfileDialog from '../../../hooks/dialog/useOpenViewProfileDialog'
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../../contexts/RovingTabindex'

export type Props = {
  message: Pick<T.Message, 'reactions'> & {
    reactions: NonNullable<T.Message['reactions']>
  }
  /**
   * Whether it is known who reacted with what. This is not the case for
   * subscribers of a channel, they only know the accumulated reactions.
   */
  showContacts: boolean
  onClose?: () => void
}

type ContactWithReaction = T.Contact & {
  emoji: string
}

export default function ReactionsDialog({
  message,
  showContacts,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog width={400} onClose={onClose}>
      <DialogHeader title={tx('reactions')} onClose={onClose} />
      <DialogBody>
        <DialogContent>
          {showContacts ? (
            <ReactionsDialogList
              reactionsByContact={message.reactions.reactionsByContact}
              onClose={onClose}
            />
          ) : (
            <AccumulatedReactionsList reactions={message.reactions.reactions} />
          )}
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}

function AccumulatedReactionsList({
  reactions,
}: {
  reactions: T.Reactions['reactions']
}) {
  const tx = useTranslationFunction()

  return (
    <ul className={styles.reactionsDialogList}>
      {reactions.map(({ emoji, count }) => (
        <li key={emoji} className={styles.accumulatedReactionsListItem}>
          <div className={styles.reactionsDialogEmoji}>{emoji}</div>
          <div className={styles.accumulatedReactionsCount}>
            {tx('n_reactions', [String(count)], { quantity: count })}
          </div>
        </li>
      ))}
    </ul>
  )
}

function ReactionsDialogList({
  reactionsByContact,
  onClose,
}: {
  reactionsByContact: T.Reactions['reactionsByContact']
  onClose?: () => void
}) {
  const accountId = selectedAccountId()
  const [contacts, setContacts] = useState<ContactWithReaction[]>([])
  const openViewProfileDialog = useOpenViewProfileDialog({ onAction: onClose })

  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const resolveContacts = async () => {
      const contactIds = Object.keys(reactionsByContact).map(contactId =>
        parseInt(contactId, 10)
      )

      const result = await BackendRemote.rpc.getContactsByIds(
        accountId,
        contactIds
      )

      setContacts(
        Object.values(result).map(contact => {
          return {
            ...contact,
            // Even though multiple reactions are supported by the core we do
            // not display or support them here in the UI. Currently we only
            // pick the "first" reaction by that user
            emoji: reactionsByContact[contact.id][0],
          }
        })
      )
    }

    resolveContacts()
  }, [accountId, reactionsByContact])

  return (
    <ul ref={ref} className={styles.reactionsDialogList}>
      <RovingTabindexProvider wrapperElementRef={ref}>
        {contacts.map(contact => (
          <li key={contact.id}>
            <ReactionsDialogListItem
              contact={contact}
              onClickNonSelf={contactId =>
                openViewProfileDialog(accountId, contactId)
              }
            />
          </li>
        ))}
      </RovingTabindexProvider>
    </ul>
  )
}

function ReactionsDialogListItem(props: {
  contact: ContactWithReaction
  onClickNonSelf: (contactId: number) => void
}) {
  const { contact, onClickNonSelf } = props
  const notFromSelf = C.DC_CONTACT_ID_SELF !== contact.id

  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      type='button'
      ref={ref}
      onClick={() => {
        if (notFromSelf) {
          onClickNonSelf(contact.id)
        }
      }}
      // `aria-disabled` instead of just `disabled` because we probably
      // still want to keep it focusable for screen-readers.
      aria-disabled={!notFromSelf}
      className={classNames(
        styles.reactionsDialogListItem,
        rovingTabindex.className,
        {
          [styles.reactionsDialogListClickable]: notFromSelf,
        }
      )}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <div className={styles.reactionsDialogAvatar}>
        <AvatarFromContact
          contact={contact}
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the contact name below.
          aria-hidden={true}
        />
      </div>
      <div className={styles.reactionsDialogContactName}>
        <ContactName displayName={contact.displayName} />
      </div>
      <div className={styles.reactionsDialogEmoji}>{contact.emoji}</div>
    </button>
  )
}
