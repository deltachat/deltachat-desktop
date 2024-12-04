import React, { useState } from 'react'
import { DialogProps } from '../../contexts/DialogContext'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import { DeltaInput } from '../Login-Styles'
import { BackendRemote } from '../../backend-com'

export function EditPrivateTagDialog({
  accountId,
  onClose,
  currentTag,
}: DialogProps & { accountId: number; currentTag: string | null }) {
  const tx = useTranslationFunction()

  const [tag, setTag] = useState(currentTag || '')

  const onOk = () => {
    BackendRemote.rpc.setConfig(
      accountId,
      'private_tag',
      tag.length === 0 ? null : tag
    )
    onClose()
  }

  return (
    <Dialog onClose={onClose} canOutsideClickClose={true}>
      <DialogHeader title={tx('profile_tag')} />
      <DialogBody>
        <DialogContent>
          <p>{tx('profile_tag_explain')}</p>
          <DeltaInput
            id='profile_tag'
            // label={tx('profile_tag')}
            placeholder={tx('profile_tag_hint')}
            value={tag}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setTag(event.target.value)
            }}
          />
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClose} onOk={onOk} />
    </Dialog>
  )
}
