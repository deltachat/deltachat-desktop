import React, { useState } from 'react'

import { AutodeleteDuration } from '../../../../shared/constants'
import { DeltaCheckbox } from '../contact/ContactListItem'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsSelector from './SettingsSelector'
import SmallSelectDialog, { SelectDialogOption } from '../SmallSelectDialog'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

function durationToString(
  configValue: number | string,
  neverMeansAutomatic: boolean
) {
  if (typeof configValue === 'string') configValue = Number(configValue)
  const tx = window.static_translate
  switch (configValue) {
    case AutodeleteDuration.NEVER:
      return neverMeansAutomatic ? tx('automatic') : tx('never')
    case AutodeleteDuration.AT_ONCE:
      return tx('autodel_at_once')
    case AutodeleteDuration.ONE_HOUR:
      return tx('autodel_after_1_hour')
    case AutodeleteDuration.ONE_DAY:
      return tx('autodel_after_1_day')
    case AutodeleteDuration.ONE_WEEK:
      return tx('autodel_after_1_week')
    case AutodeleteDuration.FIVE_WEEKS:
      return tx('after_5_weeks')
    case AutodeleteDuration.ONE_YEAR:
      return tx('autodel_after_1_year')
    default:
      return configValue + ' seconds'
  }
}

export default function Autodelete({
  settingsStore,
}: {
  settingsStore: SettingsStoreState
}) {
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const isChatMail = settingsStore.settings.is_chatmail === '1'

  const AUTODELETE_DURATION_OPTIONS_DEVICE = [
    AutodeleteDuration.NEVER,
    AutodeleteDuration.ONE_HOUR,
    AutodeleteDuration.ONE_DAY,
    AutodeleteDuration.ONE_WEEK,
    AutodeleteDuration.FIVE_WEEKS,
    AutodeleteDuration.ONE_YEAR,
  ].map(
    value =>
      [String(value), durationToString(value, false)] as SelectDialogOption
  )

  const AUTODELETE_DURATION_OPTIONS_SERVER = [
    AutodeleteDuration.NEVER,
    AutodeleteDuration.AT_ONCE,
    // These do not make sense for Chatmail servers.
    // See https://github.com/deltachat/deltachat-desktop/issues/4113
    ...(isChatMail
      ? []
      : [
          AutodeleteDuration.ONE_HOUR,
          AutodeleteDuration.ONE_DAY,
          AutodeleteDuration.ONE_WEEK,
          AutodeleteDuration.FIVE_WEEKS,
          AutodeleteDuration.ONE_YEAR,
        ]),
  ].map(
    value =>
      [String(value), durationToString(value, isChatMail)] as SelectDialogOption
  )

  const onOpenDialog = async (fromServer: boolean) => {
    openDialog(SmallSelectDialog, {
      values: fromServer
        ? AUTODELETE_DURATION_OPTIONS_SERVER
        : AUTODELETE_DURATION_OPTIONS_DEVICE,
      initialSelectedValue: fromServer
        ? settingsStore.settings['delete_server_after']
        : settingsStore.settings['delete_device_after'],
      title: fromServer
        ? tx('autodel_server_title')
        : tx('autodel_device_title'),
      onSave: async (_seconds: string) => {
        const seconds = Number(_seconds)
        const estimateCount = await BackendRemote.rpc.estimateAutoDeletionCount(
          accountId,
          fromServer,
          seconds
        )

        if (seconds === 0) {
          // No need to have a confirmation dialog on disabling
          SettingsStoreInstance.effect.setCoreSetting(
            fromServer ? 'delete_server_after' : 'delete_device_after',
            seconds.toString()
          )
          return
        }

        openDialog(AutodeleteConfirmationDialog, {
          fromServer,
          estimateCount,
          seconds,
        })
      },
    })
  }

  return (
    <>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, false)}
        currentValue={durationToString(
          settingsStore.settings['delete_device_after'],
          false
        )}
      >
        {tx('autodel_device_title')}
      </SettingsSelector>
      {!isChatMail && (
        <SettingsSelector
          onClick={onOpenDialog.bind(null, true)}
          currentValue={durationToString(
            settingsStore.settings['delete_server_after'],
            isChatMail
          )}
        >
          {tx('autodel_server_title')}
        </SettingsSelector>
      )}
    </>
  )
}

function AutodeleteConfirmationDialog({
  fromServer,
  estimateCount,
  seconds,
  onClose,
}: {
  fromServer: boolean
  estimateCount: number
  seconds: number
} & DialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const toggleIsConfirmed = () => setIsConfirmed(isConfirmed => !isConfirmed)

  const onOk = () => {
    if (isConfirmed === false) return
    SettingsStoreInstance.effect.setCoreSetting(
      fromServer ? 'delete_server_after' : 'delete_device_after',
      seconds.toString()
    )
    onClose()
  }

  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={
          fromServer ? tx('autodel_server_title') : tx('autodel_device_title')
        }
      />
      <DialogBody>
        <DialogContent>
          <p style={{ whiteSpace: 'pre-line' }}>
            {tx(fromServer ? 'autodel_server_ask' : 'autodel_device_ask', [
              String(estimateCount),
              durationToString(seconds, false),
            ])}
          </p>
          <div style={{ display: 'flex' }}>
            <DeltaCheckbox checked={isConfirmed} onClick={toggleIsConfirmed} />
            <div style={{ alignSelf: 'center' }}>{tx('autodel_confirm')}</div>
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            onClick={() => {
              onClose()
            }}
          >
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton disabled={!isConfirmed} onClick={onOk}>
            {tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
