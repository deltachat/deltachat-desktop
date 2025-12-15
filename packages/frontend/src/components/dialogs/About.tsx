import React, { useEffect } from 'react'

import { gitHubUrl, donationUrl } from '../../../../shared/constants'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { DialogBody, DialogContent, DialogWithHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

import useDialog from '../../hooks/dialog/useDialog'
import { LogDialog } from './Log'
import SettingsSeparator, {
  SettingsEndSeparator,
} from '../Settings/SettingsSeparator'
import SettingsIconButton from '../Settings/SettingsIconButton'

export default function About({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  useEffect(() => {
    window.__aboutDialogOpened = true
    return () => {
      window.__aboutDialogOpened = false
    }
  }, [])

  const { openDialog } = useDialog()
  const viewLog = () => openDialog(LogDialog)

  const runtimeInfo = runtime.getRuntimeInfo()
  const { VERSION, GIT_REF } = runtimeInfo.buildInfo

  return (
    <DialogWithHeader
      width={400}
      title={tx('global_menu_help_about_desktop')}
      onClose={onClose}
    >
      <DialogBody>
        <DialogContent>
          <div
            style={{
              // TODO: own styles file (move about page to own folder)
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <img src='./images/intro1.png' style={{ width: '40%' }} />
            <h1>
              Delta Chat{' '}
              {/* TODO: add tauri or browser edition hint if not electron */}
            </h1>
            <div>{tx('about_deltachat_claim')}</div>
            <br />
            <div>
              Version: {VERSION}
              {runtime.getRC_Config().devmode && (
                <>
                  <br />
                  <small>git: {GIT_REF}</small>
                </>
              )}
            </div>
          </div>
        </DialogContent>
        <SettingsSeparator />
        <SettingsIconButton
          icon='language'
          onClick={() => runtime.openLink('https://delta.chat')}
          isLink
        >
          {tx('delta_chat_homepage')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='code-tags'
          onClick={() => runtime.openLink(gitHubUrl)}
          isLink
        >
          {tx('source_code')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='forum'
          onClick={() => runtime.openLink('https://support.delta.chat')}
          isLink
        >
          {tx('community_forum')}
        </SettingsIconButton>
        {!runtime.getRuntimeInfo().isMac && (
          <SettingsIconButton
            icon='favorite'
            onClick={() => runtime.openLink(donationUrl)}
            isLink
          >
            {tx('donate')}
          </SettingsIconButton>
        )}
        <SettingsSeparator />
        <SettingsIconButton icon='frame_bug' onClick={viewLog}>
          {tx('pref_view_log')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='question_mark'
          onClick={() => runtime.openHelpWindow()}
        >
          {tx('menu_help')}
        </SettingsIconButton>
        <SettingsEndSeparator />
      </DialogBody>
    </DialogWithHeader>
  )
}
