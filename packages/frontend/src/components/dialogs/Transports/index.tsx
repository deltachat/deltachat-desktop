import React, { useCallback, useEffect, useState } from 'react'
import { DialogProps } from '../../../contexts/DialogContext'
import Dialog, { DialogBody, DialogHeader, DialogFooter } from '../../Dialog'
import { BackendRemote } from '../../../backend-com'

import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'
import TransportQrScanner from '../TransportScanner'
import EditAccountAndPasswordDialog from '../EditAccountAndPasswordDialog'
import Button from '../../Button'

import styles from './styles.module.scss'

import { EnteredLoginParam } from '@deltachat/jsonrpc-client/dist/generated/types'
import classNames from 'classnames'
import useDialog from '../../../hooks/dialog/useDialog'

/**
 * Dialog for transports configuration

 */
export default function TransportsDialog(
  props: DialogProps & {
    accountId: number
    configured: boolean
    newTransport?: string
  }
) {
  const tx = useTranslationFunction()

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

  // const addTransport = useCallback(async (transport: EnteredLoginParam) => {
  //   await BackendRemote.rpc
  //     .addTransport(accountId, transport)
  //     .then(() => {
  //       // refresh transport list
  //       setTransports((prev) => [
  //         ...prev,
  //         transport,
  //       ])
  //     })
  // }, [accountId])

  const { openDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const changeDefaultTransport = (transport: EnteredLoginParam) => {
    const setDefaultConfig = async (addr: string) => {
      await BackendRemote.rpc.setConfig(accountId, 'configured_addr', addr)
      await BackendRemote.rpc.stopIo(accountId)
      await BackendRemote.rpc.startIo(accountId)
      setTransports(prev =>
        prev.map(t => ({ ...t, isDefault: t.addr === transport.addr }))
      )
    }
    setDefaultConfig(transport.addr)
  }

  const openQrScanner = useCallback(() => {
    openDialog(TransportQrScanner, {
      onSuccess: (result: string) => {
        BackendRemote.rpc.addTransportFromQr(accountId, result).then(() => {
          // refresh transport list
          getTransports()
        })
      },
    })
  }, [openDialog, accountId, getTransports])

  useEffect(() => {
    getTransports()
  }, [getTransports])

  const deleteTransport = async (transport: EnteredLoginParam) => {
    const confirmed = await openConfirmationDialog({
      message: tx('confirm_remove_transport', transport.addr),
    })
    if (confirmed) {
      await BackendRemote.rpc.deleteTransport(accountId, transport.addr)
      setTransports(prev => prev.filter(t => t.addr !== transport.addr))
    }
  }

  const editTransport = (transport: EnteredLoginParam) => {
    openDialog(EditAccountAndPasswordDialog, {
      addr: transport.addr,
    })
  }

  return (
    <Dialog
      fixed
      width={500}
      dataTestid='transports-dialog'
      canOutsideClickClose={false}
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
              <div className={styles.transportRow} key={index}>
                <div
                  onClick={() => changeDefaultTransport(transport)}
                  className={classNames(styles.transportItem, {
                    [styles.transportLabel]: transport.isDefault,
                  })}
                >
                  <span className={styles.transportRadioButton}>
                    <input
                      id={`proxy-${index}`}
                      name='proxy-selection'
                      type='radio'
                      value={transport.addr}
                      checked={transport.isDefault}
                      className={styles.radioButton}
                      aria-labelledby={`transport-label-${index}`}
                    />
                  </span>
                  <span>{transport.addr}</span>
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
          ＋
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
