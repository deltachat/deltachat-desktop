import React from 'react'
import { C } from '@deltachat/jsonrpc-client'
import { useContactSearch } from '../CreateChat'
import Dialog, {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import styles from './styles.module.scss'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import type { T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../../contexts/DialogContext'
import { useContactsMap } from '../../contact/ContactList'
import { ContactListItem } from '../../contact/ContactListItem'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

/**
 * display a dialog with a react-window of contacts
 * and pass it to provided onOk function immediately
 * after one contact is selected (clicked)
 *
 * TODO: this is a a adjusted copy of CreateChat dialog,
 * we should provide one generic list of contacts components
 * with some configurable extensions
 */
export default function SelectContactDialog({
  onOk,
  onClose,
}: {
  onOk: (contact: T.Contact) => void
} & DialogProps) {
  const [searchContacts, updateSearchContacts] = useContactsMap(
    C.DC_GCL_ADD_SELF,
    ''
  )
  const [queryStr, onSearchChange] = useContactSearch(updateSearchContacts)
  const tx = useTranslationFunction()
  return (
    <Dialog width={400} onClose={onClose} fixed>
      <DialogHeader>
        <input
          className='search-input'
          onChange={onSearchChange}
          value={queryStr}
          placeholder={tx('contacts_enter_name_or_email')}
          autoFocus
          spellCheck={false}
        />
      </DialogHeader>
      <DialogBody className={styles.selectContactDialogBody}>
        {/* <AutoSizer> not working here ?? */}
        <div className={styles.selectContactList}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <FixedSizeList
                itemCount={Array.from(searchContacts).length}
                itemKey={index => Array.from(searchContacts)[index][0]}
                height={height}
                width='100%'
                itemSize={64}
              >
                {({ index, style }) => {
                  const item = Array.from(searchContacts)[index][1]
                  console.log(item)
                  const el = (() => {
                    const contact: T.Contact = item
                    return (
                      <ContactListItem
                        contact={contact}
                        onClick={onOk}
                        showCheckbox={false}
                        checked={false}
                        showRemove={false}
                      />
                    )
                  })()

                  return <div style={style}>{el}</div>
                }}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
