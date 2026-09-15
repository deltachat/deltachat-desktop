import React, { useEffect } from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogWithHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { ClickableLink } from '../../helpers/ClickableLink'
import { gitHubIssuesUrl } from '@deltachat-desktop/shared/constants'
import Icon from '../../Icon'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

const CONTRIBUTE_URL = 'https://delta.chat/contribute'
const LICENSE_URL = 'https://www.gnu.org/licenses/gpl-3.0.en.html'
const SOURCE_CODE_URL = 'https://github.com/deltachat/deltachat-desktop'

export default function About({ onClose }: DialogProps) {
  const tx = useTranslationFunction()

  useEffect(() => {
    window.__aboutDialogOpened = true
    return () => {
      window.__aboutDialogOpened = false
    }
  }, [])

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
            <img
              src='./images/intro1.png'
              className={styles.logo}
              alt='Delta Chat'
            />
            {edition && <div className={styles.edition}>{edition}</div>}
            <div className={styles.version}>
              v{VERSION}
              {runtime.getRC_Config().devmode && (
                <>
                  <br />
                  <small>git: {GIT_REF}</small>
                </>
              )}
            </div>
            <p className={styles.description}>{tx('about_description')}</p>
            <p className={styles.license}>
              {tx('about_license_text')}{' '}
              <ClickableLink href={LICENSE_URL}>GPL-3.0</ClickableLink> ·{' '}
              <ClickableLink href={SOURCE_CODE_URL}>GitHub</ClickableLink>
            </p>
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            onClick={() => runtime.openLink(CONTRIBUTE_URL)}
            data-testid='about-contribute'
          >
            <Icon icon='hand-heart' /> {tx('contribute')}
          </FooterActionButton>
          <FooterActionButton
            onClick={() => runtime.openLink(gitHubIssuesUrl)}
            data-testid='about-report-issue'
          >
            <Icon icon='bug-outline' /> {tx('global_menu_help_report_desktop')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </DialogWithHeader>
  )
}
