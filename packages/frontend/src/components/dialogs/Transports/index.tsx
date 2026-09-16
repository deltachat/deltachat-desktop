import React, { useCallback, useEffect, useState } from 'react'
import { DialogProps } from '../../../contexts/DialogContext'
import Dialog, { DialogBody, DialogHeader, DialogFooter } from '../../Dialog'
import { BackendRemote, onDCEvent } from '../../../backend-com'

import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import BasicQrScanner from '../BasicScanner'
import EditAccountAndPasswordDialog from '../EditAccountAndPasswordDialog'
import Button from '../../Button'

import styles from './styles.module.scss'

import classNames from 'classnames'
import useDialog from '../../../hooks/dialog/useDialog'
import useAddTransportDialog from '../../../hooks/dialog/useAddTransportDialog'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'

type Transport = Awaited<
  ReturnType<typeof BackendRemote.rpc.listTransports>
>[number]

/**
 * Dialog for transports configuration
 */
export default function TransportsDialog(
  props: DialogProps & {
    accountId: number
  }
) {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const openAlertDialog = useAlertDialog()
  const { accountId, onClose } = props
  const addTransportDialog = useAddTransportDialog()

  // used in  new transport form
  const [transports, setTransports] = useState<Transport[]>([])

  const getTransports = useCallback(() => {
    const fetchTransports = async () => {
      const transports = await BackendRemote.rpc.listTransports(accountId)
      setTransports(transports)
    }
    fetchTransports()
  }, [accountId])

  const { openDialog } = useDialog()

  useEffect(() => {
    return onDCEvent(accountId, 'TransportsModified', () => {
      getTransports()
    })
  }, [accountId, getTransports])

  const openQrScanner = useCallback(async () => {
    openDialog(BasicQrScanner, {
      onSuccess: async (result: string) => {
        const qr = await BackendRemote.rpc.checkQr(accountId, result)
        if (qr.kind === 'account' || qr.kind === 'login') {
          const transportAdded = await addTransportDialog(
            accountId,
            result,
            qr.kind === 'account' ? qr.domain : qr.address
          )
          if (transportAdded) {
            // refresh transport list
            getTransports()
          }
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
    tx,
    addTransportDialog,
  ])

  useEffect(() => {
    getTransports()
  }, [getTransports])

  const deleteTransport = useCallback(
    async (transport: Transport) => {
      const userConfirmed = await openConfirmationDialog({
        confirmLabel: tx('remove_transport'),
        message: tx('confirm_remove_relay_x', transport.addr),
        isConfirmDanger: true,
      })
      if (!userConfirmed) {
        return
      }

      await BackendRemote.rpc.deleteTransport(accountId, transport.addr)
      getTransports()
    },
    [accountId, getTransports, openConfirmationDialog, tx]
  )

  const editTransport = useCallback(
    (transport: Transport) => {
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
                <div className={styles.transportItem}>
                  <label id={`transport-label-${index}`}>
                    <strong>{transport.addr.split('@')[1]}</strong>
                    <br />
                    {transport.addr.split('@')[0]}
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
                  {transports.length > 1 && (
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
          <p>{tx('transport_list_hint')}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          className={styles.addTransportButton}
          onClick={() => openQrScanner()}
          aria-label={tx('add_transport')}
          title={tx('add_transport')}
        >
          {tx('add_transport')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
