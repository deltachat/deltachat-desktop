import React, { useCallback, useEffect, useState } from 'react'
import { DialogProps } from '../../../contexts/DialogContext'
import Dialog, { DialogBody, DialogHeader, DialogFooter } from '../../Dialog'
import { BackendRemote } from '../../../backend-com'

import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import BasicQrScanner from '../BasicScanner'
import EditAccountAndPasswordDialog from '../EditAccountAndPasswordDialog'
import Button from '../../Button'

import styles from './styles.module.scss'

import { EnteredLoginParam } from '@deltachat/jsonrpc-client/dist/generated/types'
import classNames from 'classnames'
import useDialog from '../../../hooks/dialog/useDialog'
import { processQr } from '../../../backend/qr'
import Icon from '../../Icon'

export const addTransportConfirmationDialog = async (
  domainOrAddress: string,
  multiDeviceMode: boolean,
  openConfirmationDialog: (options: { message: string }) => Promise<boolean>,
  confirmLabel: string
): Promise<boolean> => {
  let message = `${confirmLabel}\n ${domainOrAddress}`
  if (multiDeviceMode) {
    message +=
      '\n\nNote if using multi-device:\nbefore changing or adding transports make sure all other devices have at least version 2.33.0 installed. Otherwise they will run out of sync.'
  }
  const confirmed = await openConfirmationDialog({
    message,
  })
  return confirmed
}

/**
 * Dialog for transports configuration
 */
export default function TransportsDialog(
  props: DialogProps & {
    accountId: number
    newTransport?: string
  }
) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const { accountId, onClose } = props

  // used in  new transport form
  const [transports, setTransports] = useState<
    (EnteredLoginParam & { isDefault: boolean })[]
  >([])

  const getTransports = useCallback(() => {
    const fetchTransports = async () => {
      const configuredAddress = await BackendRemote.rpc.getConfig(
        accountId,
        'configured_addr'
      )
      const transports = await BackendRemote.rpc.listTransports(accountId)
      setTransports(
        transports.map(t => ({ ...t, isDefault: t.addr === configuredAddress }))
      )
    }

    fetchTransports()
  }, [accountId])

  const { openDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const changeDefaultTransport = useCallback(
    async (transport: EnteredLoginParam) => {
      // optimistically update UI
      setTransports(prev =>
        prev.map(t => ({ ...t, isDefault: t.addr === transport.addr }))
      )
      await BackendRemote.rpc.setConfig(
        accountId,
        'configured_addr',
        transport.addr
      )
      // now load transports again to be sure
      getTransports()
    },
    [accountId, getTransports]
  )

  const openQrScanner = useCallback(async () => {
    const multiDeviceMode = await BackendRemote.rpc.getConfig(
      accountId,
      'bcc_self'
    )
    openDialog(BasicQrScanner, {
      onSuccess: async (result: string) => {
        const { qr } = await processQr(accountId, result)
        if (qr.kind === 'account' || qr.kind === 'login') {
          const confirmed = await addTransportConfirmationDialog(
            qr.kind === 'account' ? qr.domain : qr.address,
            multiDeviceMode === '1',
            openConfirmationDialog,
            tx('confirm_add_transport')
          )
          if (!confirmed) {
            return
          }
          await BackendRemote.rpc.addTransportFromQr(accountId, result)
          // refresh transport list
          getTransports()
        } else {
          openAlertDialog({
            message: tx('invalid_transport_qr'),
          })
        }
      },
    })
  }, [
    openDialog,
    accountId,
    getTransports,
    openAlertDialog,
    openConfirmationDialog,
    tx,
  ])

  useEffect(() => {
    getTransports()
  }, [getTransports])

  const deleteTransport = useCallback(
    async (transport: EnteredLoginParam) => {
      const confirmed = await openConfirmationDialog({
        message: tx('confirm_remove_transport', transport.addr),
      })
      if (confirmed) {
        await BackendRemote.rpc.deleteTransport(accountId, transport.addr)
        getTransports()
      }
    },
    [openConfirmationDialog, tx, accountId, getTransports]
  )

  const editTransport = useCallback(
    (transport: EnteredLoginParam) => {
      openDialog(EditAccountAndPasswordDialog, {
        addr: transport.addr,
      })
    },
    [openDialog]
  )

  return (
    <Dialog
      fixed
      onClose={onClose}
      width={500}
      dataTestid='transports-dialog'
      canOutsideClickClose={true}
    >
      <DialogHeader
        title={tx('transports')}
        onClose={onClose}
        dataTestid='transports-settings'
      />
      <DialogBody className={styles.transportDialogBody}>
        <div className={styles.container}>
          <div className={styles.transportList}>
            {transports.map((transport, index) => (
              <div className={styles.transportRow} key={transport.addr}>
                <div
                  onClick={() => changeDefaultTransport(transport)}
                  className={styles.transportItem}
                >
                  <span className={styles.transportRadioButton}>
                    <input
                      id={`transport-${index}`}
                      name='transport-selection'
                      type='radio'
                      value={transport.addr}
                      checked={transport.isDefault}
                      className={styles.radioButton}
                      aria-labelledby={`transport-label-${index}`}
                      readOnly
                    />
                  </span>
                  <label id={`transport-label-${index}`}>
                    {transport.addr}{' '}
                    {transport.isDefault ? ` (${tx('def')})` : ''}
                  </label>
                </div>
                <div>
                  <Button
                    onClick={() => editTransport(transport)}
                    aria-label={`${tx('edit_transport')}`}
                    title={tx('edit_transport')}
                    styling='borderless'
                    className={styles.editButton}
                  >
                    <i
                      className={classNames(
                        'material-svg-icon',
                        'material-icon-edit',
                        styles.edit
                      )}
                      aria-hidden='true'
                    />
                  </Button>
                  {!transport.isDefault && (
                    <Button
                      onClick={() => deleteTransport(transport)}
                      aria-label={`${tx('delete')}`}
                      title={tx('delete')}
                      styling='borderless'
                      className={styles.deleteButton}
                    >
                      <i
                        className={classNames(
                          'material-svg-icon',
                          'material-icon-trash',
                          styles.trash
                        )}
                        aria-hidden='true'
                      />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          className={styles.addTransportButton}
          onClick={() => openQrScanner()}
          aria-label={tx('add_transport')}
          title={tx('add_transport')}
        >
          <Icon icon='plus' size={16} />
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
