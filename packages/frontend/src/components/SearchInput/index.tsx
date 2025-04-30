import React from 'react'

import QrCode from '../dialogs/QrCode'
import SearchInputButton from './SearchInputButton'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import styles from './styles.module.scss'

type Props = {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: '' } }
  ) => void
  value: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
  /** If this is defined clear button is always shown, like with search in chat */
  onClear?: () => void
}

export default function SearchInput(props: Props) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { onChange, value, id, onClear } = props

  const handleClear = () => {
    onChange({ target: { value: '' } })
    onClear?.()
  }

  const handleQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    openDialog(QrCode, { qrCode, qrCodeSVG })
  }

  const hasValue = value.length > 0 || onClear

  return (
    <>
      <input
        id={id}
        placeholder={tx('search')}
        aria-label={tx('search')}
        aria-description={tx('search_explain')}
        autoFocus
        onChange={onChange}
        value={value}
        className={styles.searchInput}
        data-no-drag-region
        ref={props.inputRef}
        spellCheck={false}
        // FYI there is also Ctrl + Shift + F to search in chat.
        aria-keyshortcuts='Control+F'
      />
      {hasValue && (
        <SearchInputButton
          aria-label={tx('clear_search')}
          icon='cross'
          onClick={handleClear}
        />
      )}
      {!hasValue && (
        <SearchInputButton
          aria-label={tx('qrscan_title')}
          size={17}
          icon='qr'
          onClick={handleQRScan}
          dataTestid='qr-scan-button'
        />
      )}
    </>
  )
}
