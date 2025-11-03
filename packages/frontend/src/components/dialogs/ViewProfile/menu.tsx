import React, { useState, useContext, useEffect } from 'react'
import { BackendRemote, onDCEvent } from '../../../backend-com'

import { DeltaInput } from '../../Login-Styles'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../../Dialog'
import { ContextMenuItem } from '../../ContextMenu'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'

import { selectedAccountId } from '../../../ScreenController'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useChatDialog from '../../../hooks/chat/useChatDialog'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'

import type { T } from '@deltachat/jsonrpc-client'
import { C } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'

import { throttle } from '@deltachat-desktop/shared/util'
import useCreateDraftMessage from '../../../hooks/chat/useCreateDraftMesssage'
import { runtime } from '@deltachat-desktop/runtime-interface'
import SelectChat from '../SelectChat'

export default function useViewProfileMenu(
  contact: T.Contact,
  onClose: () => void
) {
  const { openContextMenu } = useContext(ContextMenuContext)

  const [isBlocked, setBlocked] = useState(false)

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()

  const { openBlockContactById, openEncryptionInfoDialog } = useChatDialog()

  const onUnblockContact = async () => {
    const confirmed = await openConfirmationDialog({
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
    })

    if (confirmed) {
      await BackendRemote.rpc.unblockContact(accountId, contact.id)
    }
  }

  useEffect(() => {
    const onContactsUpdate = async () => {
      const allBlocked = await BackendRemote.rpc.getBlockedContacts(accountId)

      setBlocked(
        !!allBlocked &&
          allBlocked.length > 0 &&
          allBlocked.some(bContact => bContact.id === contact.id)
      )
    }
    onContactsUpdate()
    return onDCEvent(
      accountId,
      'ContactsChanged',
      throttle(onContactsUpdate, 500)
    )
  }, [accountId, contact.id])

  const { openDialog } = useDialog()

  const onClickEdit = () => {
    openDialog(EditContactNameDialog, {
      contactName: contact.name,
      originalName:
        contact.authName !== '' ? contact.authName : contact.address,
      onOk: async (contactName: string) => {
        await BackendRemote.rpc.changeContactName(
          accountId,
          contact.id,
          contactName
        )
      },
    })
  }

  const onClickShareContact = () => {
    openDialog(ShareProfileDialog, {
      contact,
      onParentClose: onClose,
    })
  }

  const menu: (ContextMenuItem | false)[] = [
    // we show Edit Name option every time since this menu
    // is only accessible from ViewProfile which you can edit name for
    {
      label: tx('menu_edit_name'),
      action: onClickEdit,
      dataTestid: 'edit-contact-name',
    },
    {
      label: tx('menu_share'),
      action: onClickShareContact,
      dataTestid: 'share-contact',
    },
    {
      type: 'separator',
    },
    {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({ chatId: null, dmChatContact: contact.id }),
      dataTestid: 'encryption-info',
    },
    isBlocked
      ? {
          label: tx('menu_unblock_contact'),
          action: onUnblockContact,
          dataTestid: 'unblock-contact',
        }
      : {
          label: tx('menu_block_contact'),
          action: () => openBlockContactById(accountId, contact.id),
          dataTestid: 'block-contact',
        },
  ]

  return (event: React.MouseEvent<any, MouseEvent>) => {
    const threeDotButtonElement = document.querySelector(
      '#view-profile-menu'
    ) as HTMLDivElement

    const boundingBox = threeDotButtonElement.getBoundingClientRect()

    const [x, y] = [boundingBox.x + 3, boundingBox.y + boundingBox.height - 2]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      x,
      y,
      items: menu,
    })
  }
}

function EditContactNameDialog({
  onClose,
  onOk,
  contactName: initialGroupName,
  originalName,
}: {
  onOk: (contactName: string) => void
  contactName: string
  originalName: string
} & DialogProps) {
  const [contactName, setContactName] = useState(initialGroupName)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
  }

  const onClickOk = () => {
    onClose()
    onOk(contactName)
  }

  const haveUnsavedChanges = contactName !== initialGroupName

  return (
    <Dialog canOutsideClickClose={!haveUnsavedChanges} fixed onClose={onClose}>
      <DialogHeader title={tx('menu_edit_name')} />
      <DialogBody>
        <DialogContent>
          <p>{tx('edit_name_explain', originalName)}</p>
          <DeltaInput
            key='contactname'
            id='contactname'
            placeholder={tx('edit_name_placeholder', originalName)}
            value={contactName}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setContactName(event.target.value)
            }}
            dataTestId='edit-contact-name-input'
          />
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}

function ShareProfileDialog(
  props: { contact: T.Contact; onParentClose: () => void } & DialogProps
) {
  const { onClose, onParentClose, contact } = props

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const createDraftMessage = useCreateDraftMessage()

  const onChatClick = async (chatId: number) => {
    if (contact.isKeyContact) {
      const vcard = await BackendRemote.rpc.makeVcard(accountId, [contact.id])

      const filePath = await runtime.writeTempFile('contact.vcard', vcard)
      // treefit: I would like to use setDraftVcard here, but it requires a draft message, which we may now have:
      // BackendRemote.rpc.setDraftVcard(accountId, msgId, contacts)
      // and there is no way to create an empty draft message with the current api as far as I know
      //
      // why is this better? because we then only would need to ask to replace draft when there is a file

      await createDraftMessage(accountId, chatId, '', {
        name: `${contact.displayName}.vcard`,
        path: filePath,
        viewType: 'Vcard',
        deleteTempFileWhenDone: true,
      })
    } else {
      await createDraftMessage(accountId, chatId, contact.address)
    }
    onClose()
    onParentClose()
  }

  return (
    <SelectChat
      headerTitle={tx('chat_share_with_title')}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
    />
  )
}
