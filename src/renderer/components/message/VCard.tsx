import React from 'react'
import styles from './styles.module.scss'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { createChatByContactId } from '../../backend/chat'
import useChat from '../../hooks/chat/useChat'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'

/**
 * displays a VCard attachement with avatar, mail & name
 * onClick imports VCard and creates chat
 * (only first if multiple contacts are included in VCard)
 */
export default function VCardComponent({ message }: { message: T.Message }) {
  const { selectChat } = useChat()
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()
  if (!message.vcardContact) {
    return null
  }
  const { profileImage, color, displayName, addr } = message.vcardContact
  const startChatWithContact = async (addr: string) => {
    const confirmed = await openConfirmationDialog({
      message: tx('ask_start_chat_with', displayName),
      confirmLabel: tx('ok'),
    })
    if (!confirmed) {
      return null
    }
    const contactIds = await BackendRemote.rpc.importVcard(
      accountId,
      message.file ?? '' // vCard messages always have a file property
    )
    const chatId = await createChatByContactId(accountId, contactIds[0])
    if (chatId) {
      await BackendRemote.rpc.createContact(accountId, addr, displayName)
      await selectChat(selectedAccountId(), chatId)
    }
  }
  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'
  return (
    <div className={styles.vcard} onClick={() => startChatWithContact(addr)}>
      <div
        className={classNames('avatar', styles.avatar)}
        aria-label={displayName}
      >
        {profileImage ? (
          <img
            alt={displayName}
            className='content'
            src={'data:image/jpeg;base64,' + profileImage}
          />
        ) : (
          <div style={{ backgroundColor: color }} className='content'>
            {initial}
          </div>
        )}
      </div>
      <div className={styles.contactInfo}>
        <div className={styles.displayName}>{displayName}</div>
        <div>{addr}</div>
      </div>
    </div>
  )
}
