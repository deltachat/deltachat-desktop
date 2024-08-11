import React, { useEffect, useState } from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from '../../Dialog'
import FooterActionButton from '../../Dialog/FooterActionButton'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../../ScreenController'
import { BackendRemote } from '../../../backend-com'
import { AvatarFromContact } from '../../Avatar'
import ContactName from '../../ContactName'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import type { T } from '@deltachat/jsonrpc-client'

export type Props = {
  reactionsByContact: T.Reactions['reactionsByContact']
}

type ContactWithReaction = T.Contact & {
  emoji: string
}

export default function ReactionsDialog({
  reactionsByContact,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog width={400} onClose={onClose}>
      <DialogHeader title={tx('reactions')} />
      <DialogBody>
        <DialogContent>
          <ReactionsDialogList reactionsByContact={reactionsByContact} />
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

function ReactionsDialogList({ reactionsByContact }: Props) {
  const accountId = selectedAccountId()
  const [contacts, setContacts] = useState<ContactWithReaction[]>([])

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
    <ul className={styles.reactionsDialogList}>
      {contacts.map(contact => {
        return (
          <li key={contact.id} className={styles.reactionsDialogListItem}>
            <div className={styles.reactionsDialogAvatar}>
              <AvatarFromContact contact={contact} />
            </div>
            <div className={styles.reactionsDialogContactName}>
              <ContactName
                displayName={contact.displayName}
                address={contact.address}
              />
            </div>
            <div className={styles.reactionsDialogEmoji}>{contact.emoji}</div>
          </li>
        )
      })}
    </ul>
  )
}
