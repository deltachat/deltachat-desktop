import React from 'react'
import classNames from 'classnames'

import DialogFooter from './DialogFooter'
import FooterActions from './FooterActions'
import { useTranslationFunction } from '../../contexts'

type Props = {
  onCancel: () => any
  onOk: () => any
  disableOK?: boolean
  cancelLabel?: string
  confirmLabel?: string
}

export default function OkCancelFooterAction({
  onCancel,
  onOk,
  disableOK,
  cancelLabel,
  confirmLabel,
}: Props) {
  const tx = useTranslationFunction()

  disableOK = disableOK === true ? true : false
  cancelLabel = cancelLabel || tx('cancel')
  confirmLabel = confirmLabel || tx('ok')

  return (
    <DialogFooter>
      <FooterActions>
        <p
          className='delta-button primary bold'
          style={{ marginRight: '10px' }}
          onClick={onCancel}
        >
          {cancelLabel}
        </p>
        <p
          className={classNames(
            'delta-button bold primary test-selector-confirm',
            {
              disabled: disableOK,
            }
          )}
          onClick={onOk}
        >
          {confirmLabel}
        </p>
      </FooterActions>
    </DialogFooter>
  )
}
