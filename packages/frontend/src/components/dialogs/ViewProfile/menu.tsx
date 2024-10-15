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
import type { DialogProps } from '../../../contexts/DialogContext'

import debounce from 'debounce'

export default function useViewProfileMenu(contact: T.Contact) {
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
      debounce(onContactsUpdate, 500)
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

  const menu: (ContextMenuItem | false)[] = [
    // we show Edit Name option every time since this menu
    // is only accessible from ViewProfile which you can edit name for
    {
      label: tx('menu_edit_name'),
      action: onClickEdit,
    },
    isBlocked
      ? {
          label: tx('menu_unblock_contact'),
          action: onUnblockContact,
        }
      : {
          label: tx('menu_block_contact'),
          action: () => openBlockContactById(accountId, contact.id),
        },
    {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({ chatId: null, dmChatContact: contact.id }),
    },
  ]

  return (event: React.MouseEvent<any, MouseEvent>) => {
    const threeDotButtonElement = document.querySelector(
      '#view-profile-menu'
    ) as HTMLDivElement

    const boundingBox = threeDotButtonElement.getBoundingClientRect()

    const [cursorX, cursorY] = [
      boundingBox.x + 3,
      boundingBox.y + boundingBox.height - 2,
    ]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      cursorX,
      cursorY,
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

  return (
    <Dialog canOutsideClickClose={false} fixed onClose={onClose}>
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
          />
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}
