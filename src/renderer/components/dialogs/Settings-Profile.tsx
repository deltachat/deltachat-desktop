import { Card, Elevation } from '@blueprintjs/core'
import React, { useEffect, useState, useContext } from 'react'
import { useTranslationFunction, ScreenContext } from '../../contexts'

import { DeltaBackend } from '../../delta-remote'
import { avatarInitial } from '../Avatar'
import { DeltaInput, DeltaTextarea } from '../Login-Styles'
import {
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
  DeltaDialogBase,
  DeltaDialogHeader,
} from './DeltaDialog'
import { SettingsButton } from './Settings'
import { runtime } from '../../runtime'
import { C } from 'deltachat-node/dist/constants'
import { DialogProps } from './DialogController'
import { onDCEvent } from '../../ipc'
import SettingsAccountDialog from './Settings-Account'
import SettingsConnectivityDialog from './Settings-Connectivity'

export default function SettingsProfile({
  addr,
  displayname,
  state,
  handleDeltaSettingsChange,
}: {
  onClose: any
  addr: string | undefined
  displayname: string | undefined
  state: any
  handleDeltaSettingsChange: (key: string, value: string) => void
}) {
  const { openDialog } = useContext(ScreenContext)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [connectivityString, setConnectivityString] = useState('')

  const updateConnectivity = async () => {
    const connectivity = await DeltaBackend.call('context.getConnectivity')

    let connectivityString = ''
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      connectivityString = window.static_translate('connectivity_connected')
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      connectivityString = window
        .static_translate('connectivity_updating')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      connectivityString = window
        .static_translate('connectivity_connecting')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      connectivityString = window.static_translate('connectivity_not_connected')
    }
    setConnectivityString(`(${connectivityString})`)
  }

  const initial = avatarInitial(displayname || '', addr)
  useEffect(() => {
    updateConnectivity()

    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    return onDCEvent('DC_EVENT_CONNECTIVITY_CHANGED', updateConnectivity)
  }, [profileImagePreview])

  useEffect(() => {
    return onDCEvent('DC_EVENT_SELFAVATAR_CHANGED', () =>
      DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    )
  }, [])

  const tx = useTranslationFunction()
  return (
    <>
      <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
        <div
          className='profile-image-username'
          style={{ marginBottom: '10px' }}
        >
          <div className='profile-image-selector'>
            {profileImagePreview ? (
              <img
                src={runtime.transformBlobURL(profileImagePreview)}
                alt={tx('pref_profile_photo')}
              />
            ) : (
              <span style={{ backgroundColor: state.selfContact.color }}>
                {initial}
              </span>
            )}
          </div>
          <div className='profile-displayname-addr'>
            <div className='displayname'>{state.settings.displayname}</div>
            <div className='addr'>{addr}</div>
          </div>
        </div>
        <SettingsButton
          onClick={() =>
            openDialog(SettingsProfileDialog, {
              state,
              handleDeltaSettingsChange,
            })
          }
        >
          {tx('pref_edit_profile')}
        </SettingsButton>
        <SettingsButton
          onClick={() =>
            openDialog(SettingsAccountDialog, {
              state,
              handleDeltaSettingsChange,
            })
          }
        >
          {tx('pref_password_and_account_settings')}
        </SettingsButton>
        <SettingsButton
          onClick={async () => {
            openDialog(SettingsConnectivityDialog, {
              state,
              handleDeltaSettingsChange,
            })
          }}
        >
          {tx('connectivity') + ' ' + connectivityString}
        </SettingsButton>
      </Card>
    </>
  )
}

export function ProfileImageSelector({
  displayName,
  addr,
  color,
  profilePicture,
  setProfilePicture,
}: {
  displayName: string
  addr: string
  color: string
  profilePicture: string
  setProfilePicture: (path: string) => void
}) {
  const tx = window.static_translate

  const onClickSelectPicture = async () => {
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [{ name: tx('images'), extensions: ['jpg', 'png', 'gif','jpeg','icon','apng','ico','webp'] }],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('pictures'),
    })
    if (file) setProfilePicture(file)
  }

  const onClickRemovePicture = () => setProfilePicture('')

  const initial = avatarInitial(displayName, addr)

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profilePicture ? (
        <img src={'file://' + profilePicture} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <>
        <button
          aria-label={tx('profile_image_select')}
          onClick={onClickSelectPicture}
          className={'delta-button-round'}
        >
          {tx('profile_image_select')}
        </button>
        <button
          aria-label={tx('profile_image_delete')}
          onClick={onClickRemovePicture}
          className={'delta-button-round'}
          disabled={!profilePicture}
        >
          {tx('profile_image_delete')}
        </button>
      </>
    </div>
  )
}

export function SettingsEditProfileDialogInner({
  onClose,
  state,
  handleDeltaSettingsChange,
}: {
  onClose: DialogProps['onClose']
  state: any
  handleDeltaSettingsChange: (key: string, value: string) => void
}) {
  const tx = useTranslationFunction()
  const [displayname, setDisplayname] = useState(state.settings.displayname)
  const [selfstatus, setSelfstatus] = useState(state.settings.selfstatus)

  const [profilePicture, setProfilePicture] = useState('')
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfilePicture)
  }, [])

  const onCancel = () => {
    onClose()
  }
  const onOk = async () => {
    await DeltaBackend.call('setProfilePicture', profilePicture)
    handleDeltaSettingsChange('displayname', displayname)
    handleDeltaSettingsChange('selfstatus', selfstatus)
    onClose()
  }
  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            <ProfileImageSelector
              displayName={state.settings['displayname']}
              addr={state.selfContact.address}
              color={state.selfContact.color}
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
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onCancel} onOk={onOk} />
    </>
  )
}

export function SettingsProfileDialog({
  onClose,
  isOpen,
  state,
  handleDeltaSettingsChange,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  state: any
  handleDeltaSettingsChange: (key: string, value: string) => void
}) {
  const tx = useTranslationFunction()
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DeltaDialogHeader title={tx('pref_edit_profile')} />
      {SettingsEditProfileDialogInner({
        state,
        handleDeltaSettingsChange,
        onClose,
      })}
    </DeltaDialogBase>
  )
}
