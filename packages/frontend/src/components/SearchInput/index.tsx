import React from 'react'

import QrCode from '../dialogs/QrCode'
import SearchInputButton from './SearchInputButton'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import styles from './styles.module.scss'
import { SCAN_CONTEXT_TYPE } from '../../hooks/useProcessQr'

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
    openDialog(QrCode, {
      qrCode,
      qrCodeSVG,
      scanContext: SCAN_CONTEXT_TYPE.DEFAULT,
    })
  }

  const hasValue = value.length > 0 || onClear

  return (
    <>
      <div
        role='search'
        // `aria-label={tx('search')}` is not required,
        // a "search" landmark is enough.
        // Note that `_explain` strings are generally verbose
        // and are more suitable for `aria-description`,
        // but here it's fine to use it as the label.
        // We must speecify the label, because we have multiple searches
        // in the app, another one being the attachments search.
        aria-label={tx('search_explain')}
        className={styles.inputAndClearButton}
      >
        <input
          id={id}
          placeholder={tx('search')}
          autoFocus
          onChange={onChange}
          value={value}
          className={styles.searchInput}
          data-no-drag-region
          // eslint-disable-next-line react-hooks/refs
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
      </div>
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
