import React from 'react'

import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import Language from '../../Settings/Language'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'

export default function LanguageDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose} fixed width={400}>
      <DialogHeader
        title={tx('pref_language')}
        onClickBack={onClose}
        onClose={onClose}
      />
      <DialogBody>
        <Language onClose={onClose} />
      </DialogBody>
    </Dialog>
  )
}
