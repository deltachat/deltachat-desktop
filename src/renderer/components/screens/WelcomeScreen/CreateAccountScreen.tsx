import React from 'react'

import { DialogBody, DialogHeader } from '../../Dialog'

type Props = {
  onCancel: () => void
}

export default function CreateAccountScreen({ onCancel }: Props) {
  return (
    <>
      <DialogHeader title='Create new account' onClickBack={onCancel} />
      <DialogBody></DialogBody>
    </>
  )
}
