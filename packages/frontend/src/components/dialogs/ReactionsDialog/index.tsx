import React, {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote, onDCEvent } from '../../../backend-com'
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
import { useRpcFetch } from '../../../hooks/useFetch'
import { default as asyncThrottle } from '@jcoreio/async-throttle'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BasicMessageInfo } from '../MessageDetail/BasicMessageInfo'
import { unknownErrorToString } from '@deltachat-desktop/shared/unknownErrorToString'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ReactionsBar from '../../ReactionsBar'

export type Props = {
  message: Pick<T.Message, 'id' | 'reactions'>
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
  message: originalMessage,
  showContacts,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  /**
   * The `originalMessage` prop will not update as reactions change,
   * so we have to update it ourselves.
   * Similar to {@linkcode BasicMessageInfo}.
   */
  const [originalIsOutdated, setOriginalIsOutdated] = useState(false)
  const freshMessageFetch = useRpcFetch(
    useMemo(
      () =>
        asyncThrottle(
          BackendRemote.rpc.getMessage.bind(BackendRemote.rpc),
          250
        ),
      []
    ),
    originalIsOutdated ? [selectedAccountId(), originalMessage.id] : null
  )
  const refresh = useEffectEvent(() => freshMessageFetch?.refresh())
  useEffect(() => {
    return onDCEvent(selectedAccountId(), 'ReactionsChanged', ({ msgId }) => {
      if (msgId !== originalMessage.id) {
        return
      }

      setOriginalIsOutdated(true)
      refresh()
    })
  }, [originalMessage.id])
  const message = freshMessageFetch?.lingeringResult?.ok
    ? freshMessageFetch.lingeringResult.value
    : originalMessage

  const totalReactions =
    message.reactions == null
      ? 0
      : message.reactions.reactions
          .values()
          .map(r => r.count)
          .reduce((a, v) => a + v)

  return (
    <Dialog width={400} onClose={onClose}>
      <DialogHeader
        title={
          <span aria-live='polite'>
            {tx('n_reactions', totalReactions.toLocaleString(), {
              quantity: totalReactions,
            })}
          </span>
        }
        onClose={onClose}
      />
      <DialogBody>
        <div
          aria-live='polite'
          aria-relevant='all'
          style={{ display: 'contents' }}
        >
          <DialogContent>
            {message.reactions == null ||
            message.reactions.reactions.length === 0 ? (
              <></>
            ) : (
              <>
                <AccumulatedReactionsList
                  message={
                    message as typeof message & {
                      reactions: typeof message.reactions
                    }
                  }
                />
                {showContacts && (
                  <ReactionsDialogList
                    reactionsByContact={message.reactions.reactionsByContact}
                    onClose={onClose}
                  />
                )}
              </>
            )}
          </DialogContent>
        </div>
      </DialogBody>
    </Dialog>
  )
}

/**
 * This is very similar to {@linkcode ReactionsBar}.
 */
function AccumulatedReactionsList({
  message,
}: {
  message: Pick<T.Message, 'id' | 'reactions'> & {
    reactions: NonNullable<T.Message['reactions']>
  }
}) {
  const ref = useRef<HTMLUListElement>(null)
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()

  const toggleReaction = async (emoji: string) => {
    try {
      await BackendRemote.rpc.sendReaction(
        selectedAccountId(),
        message.id,
        emoji === message.reactions.reactions.find(v => v.isFromSelf)?.emoji
          ? []
          : [emoji]
      )
    } catch (error) {
      openAlertDialog({
        message: tx(
          'error_x',
          'failed to send reaction: ' + unknownErrorToString(error)
        ),
      })
    }
  }

  return (
    <ul
      ref={ref}
      className={styles.accumulatedReactionsList}
      role='menubar'
      aria-label={tx('react')}
      aria-orientation='horizontal'
    >
      <RovingTabindexProvider wrapperElementRef={ref} direction='horizontal'>
        {message.reactions.reactions.map(({ emoji, count, isFromSelf }) => (
          <li role='presentation' key={emoji}>
            <ReactionButton
              key={emoji}
              emoji={emoji}
              count={count}
              isChecked={isFromSelf}
              onClick={() => toggleReaction(emoji)}
            />
          </li>
        ))}
      </RovingTabindexProvider>
    </ul>
  )
}

function ReactionButton(props: {
  emoji: string
  count: number
  isChecked: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      ref={ref}
      type='button'
      role='menuitemradio'
      aria-checked={props.isChecked}
      onClick={props.onClick}
      className={classNames(
        rovingTabindex.className,
        styles.accumulatedReactionsButton,
        {
          [styles.isFromSelf]: props.isChecked,
        }
      )}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <span className={styles.accumulatedReactionsEmoji}>{props.emoji}</span>{' '}
      <span className={styles.accumulatedReactionsCount}>{props.count}</span>
    </button>
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
