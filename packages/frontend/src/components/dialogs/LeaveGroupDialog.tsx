import React from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type LeaveGroupResult = 'leave' | 'leave-and-delete' | 'cancel'

export type Props = {
  isGroup: boolean
  cb: (result: LeaveGroupResult) => void
} & DialogProps

export default function LeaveGroupDialog({ isGroup, cb, onClose }: Props) {
  const tx = useTranslationFunction()

  const handleResult = (result: LeaveGroupResult) => {
    onClose()
    cb(result)
  }

  const handleClose = () => {
    onClose()
    cb('cancel')
  }

  return (
    <Dialog onClose={handleClose}>
      <DialogBody>
        <DialogContent>
          <p className='whitespace'>{tx('ask_leave_group')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => handleResult('cancel')}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            styling='danger'
            onClick={() => handleResult('leave')}
          >
            {isGroup ? tx('menu_leave_group') : tx('menu_leave_channel')}
          </FooterActionButton>
          <FooterActionButton
            styling='danger'
            onClick={() => handleResult('leave-and-delete')}
          >
            {tx('menu_leave_and_delete')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
