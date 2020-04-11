import React, { useContext, useState } from 'react'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
} from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { Icon } from '@blueprintjs/core'
import { LocalSettings } from '../../../shared/shared-types'
import { callDcMethodAsync } from '../../ipc'
import { selectChat } from '../../stores/chat'

interface QrStates {
  [key: number]: string;
}const tx = window.translate

const qrStates: QrStates = {
  200: 'QrAskVerifyContact', // id = contact
  202: 'QrAskVerifyGroup', // text1=groupname
  210: 'QrFprOk', // finger print ok for id=contact
  220: 'QrFprMissmatch', // finger print not ok for id=contact
  230: 'QrFprWithoutAddr', 
  250: 'QrAccount', // text1=domain
  320: 'QrAddr', // id=contact
  330: 'QrText', // text1=text
  332: 'QrUrl', // text1=URL
  400: 'QrError' // text1=error string
}

declare type QrCodeResponse = {
  state: keyof QrStates;
  id: number;
  text1: string;
}


export function DeltaDialogImportQrInner({
  description, onClose
}: {
  description: string,
  onClose: () => void
}) {
  const tx = window.translate
  const [ qrCode, setQrCode ] = useState('')
  const screenContext = useContext(ScreenContext)

  const handleResponse = async(txt: string) =>
  {
    setQrCode(txt)
    const response: QrCodeResponse = await callDcMethodAsync('checkQrCode', txt)
    if (response === null) {
      return
    }
    const tx = window.translate
    const state = qrStates[response.state]
    if ( state === 'QrAskVerifyContact') {
      const contact = await callDcMethodAsync('contacts.getContact', response.id);
      screenContext.openDialog('ConfirmationDialog', {
        message: tx('ask_start_chat_with', contact.address),
        confirmLabel: tx('ok'),
        cb: async (confirmed: boolean) => {
          if (confirmed) {
            const chatId = await callDcMethodAsync('contacts.createChatByContactId', response.id)
            selectChat(chatId)
            onClose()
          }
        }
      })
    } else if ( state === 'QrAskVerifyGroup') {
      screenContext.openDialog('ConfirmationDialog', {
        message: tx('qrscan_ask_join_group', response.text1),
        confirmLabel: tx('ok'),
        cb: async (confirmed: boolean) => {
          if (confirmed) {
            const chatId = await callDcMethodAsync('chat.createGroupChat', [false, response.text1])
            selectChat(chatId)
            onClose()
          }
        }
      })
    }
  }

  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding>
          <div className='qr-data'>
            <div className='content' aria-label={tx('a11y_qr_data')}>
              {qrCode}
            </div>
            <div
              className='copy-btn'
              role='button'
              onClick={() => {
                navigator.clipboard.readText().then(handleResponse)
              }}
            >
              <Icon icon='clipboard' />
            </div>
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <p style={{ textAlign: 'center' }}>{description}</p>
      </DeltaDialogFooter>
    </>
  )
}

export default function ImportQrCode({
  onClose,
  isOpen,
  qrCode,
  deltachat,
}: {
  onClose: () => void
  isOpen: boolean
  qrCode: string
  deltachat: LocalSettings
}) {
  const tx = window.translate
  const Dialog = DeltaDialog as any // todo remove this cheat.
  return (
    <Dialog
      title={tx('qrshow_join_contact_title')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <DeltaDialogImportQrInner
        description={tx('qrshow_join_contact_hint', [
          deltachat.credentials.addr,
        ])}
        onClose={onClose}
      />
    </Dialog>
  )
}
