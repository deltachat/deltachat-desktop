import React, { useEffect } from 'react'

import { gitHubUrl, donationUrl } from '@deltachat-desktop/shared/constants'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import { LogDialog } from '../Log'
import SettingsSeparator, {
  SettingsEndSeparator,
} from '../../Settings/SettingsSeparator'
import SettingsIconButton from '../../Settings/SettingsIconButton'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

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
          <div className={styles.aboutContent}>
            <img src='./images/intro1.png' />
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
