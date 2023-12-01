import { Card, Elevation } from '@blueprintjs/core'
import React, { useState } from 'react'

import { useTranslationFunction } from '../../../contexts'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../../stores/settings'
import { DialogProps } from '../DialogController'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { DeltaInput, DeltaTextarea } from '../../Login-Styles'
import ProfileImageSelector from './ProfileImageSelector'
import Dialog, {
  DialogBody,
  DialogHeader,
  OkCancelFooterAction,
} from '../../Dialog'

export default function EditProfileDialog({
  onClose,
  isOpen,
  settingsStore,
  title,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  settingsStore: SettingsStoreState
  title?: string
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
}) {
  const tx = useTranslationFunction()
  title = title || tx('pref_edit_profile')
  return (
    <Dialog
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DialogHeader title={title} />
      {EditProfileDialogInner({
        settingsStore,
        onClose,
        cancelLabel,
        confirmLabel,
        firstSetup,
      })}
    </Dialog>
  )
}

function EditProfileDialogInner({
  onClose,
  settingsStore,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  onClose: DialogProps['onClose']
  settingsStore: SettingsStoreState
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
}) {
  const tx = useTranslationFunction()
  const [displayname, setDisplayname] = useState(
    settingsStore.settings.displayname
  )
  const [selfstatus, setSelfstatus] = useState(
    settingsStore.settings.selfstatus
  )

  const [profilePicture, setProfilePicture] = useState(
    settingsStore.selfContact.profileImage
  )

  const onCancel = () => {
    onClose()
  }
  const onOk = async () => {
    await BackendRemote.rpc.setConfig(
      selectedAccountId(),
      'selfavatar',
      profilePicture ? profilePicture : null
    )
    SettingsStoreInstance.effect.setCoreSetting(
      'displayname',
      displayname || ''
    )
    SettingsStoreInstance.effect.setCoreSetting('selfstatus', selfstatus || '')
    onClose()
  }
  return (
    <>
      <DialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            <ProfileImageSelector
              displayName={settingsStore.settings['displayname']}
              addr={settingsStore.selfContact.address}
              color={settingsStore.selfContact.color}
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
            />
          </div>
          <DeltaInput
            key='displayname'
            id='displayname'
            placeholder={tx('pref_your_name')}
            value={displayname}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setDisplayname(event.target.value)
            }}
          />
          {firstSetup ? (
            <p className='bp4-callout'>
              {tx('qraccount_success_enter_name', [
                settingsStore.selfContact.address,
              ])}
            </p>
          ) : null}
          {firstSetup ? null : (
            <DeltaTextarea
              key='status'
              id='status'
              placeholder={tx('pref_default_status_label')}
              value={selfstatus}
              onChange={(
                event: React.FormEvent<HTMLElement> &
                  React.ChangeEvent<HTMLTextAreaElement>
              ) => {
                setSelfstatus(event.target.value)
              }}
            />
          )}
        </Card>
      </DialogBody>
      <OkCancelFooterAction
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onOk={onOk}
      />
    </>
  )
}
