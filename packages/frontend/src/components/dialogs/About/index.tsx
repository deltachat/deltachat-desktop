import React, { useEffect } from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import { DialogBody, DialogContent, DialogWithHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import { LogDialog } from '../Log'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { ClickableLink } from '../../helpers/ClickableLink'
import Button from '../../Button'

export default function About({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  useEffect(() => {
    window.__aboutDialogOpened = true
    return () => {
      window.__aboutDialogOpened = false
    }
  }, [])

  const { openDialog } = useDialog()
  const viewLog = () => {
    openDialog(LogDialog)
    // Close the about dialog so that it doesn't interfere with sharing the log.
    onClose()
  }

  const runtimeInfo = runtime.getRuntimeInfo()
  const { VERSION, GIT_REF } = runtimeInfo.buildInfo

  let edition = '' // electron is default, so don't show it
  if (runtime.constructor.name !== 'ElectronRuntime') {
    edition = `${runtime.constructor.name.replace('Runtime', '')} Edition`
  }

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
            <h1 className={styles.appName}>Delta Chat {edition}</h1>
            <div>
              v{VERSION}
              {runtime.getRC_Config().devmode && (
                <>
                  <br />
                  <small>git: {GIT_REF}</small>
                </>
              )}
            </div>
            <div>
              <ClickableLink href={'https://delta.chat'}>
                {'https://delta.chat'}
              </ClickableLink>
            </div>
            <div className={styles.buttonContainer}>
              <Button onClick={() => runtime.openHelpWindow()}>
                {tx('menu_help')}
              </Button>
              <Button onClick={viewLog}>{tx('pref_view_log')}</Button>{' '}
            </div>
          </div>
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
