import React from 'react'
import { Elevation, H5, Card } from '@blueprintjs/core'

import { getLogger } from '../../../shared/logger'
import { SettingsState } from './Settings'
import {DeltaSwitch2} from './DeltaDialog'

const log = getLogger('renderer/dialogs/Settings')

export default function SettingsImapFolderHandling({
  state,
  renderDeltaSwitch,
}: {
  state: SettingsState
  renderDeltaSwitch: Function
}) {
  const tx = window.static_translate
  const disableIfOnlyFetchMvBoxIsTrue = state.settings.only_fetch_mvbox === '1'

  console.debug('SETTINGS_IMAP_FOLDER_HANDLING RENDER', state)
  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('pref_imap_folder_handling')}</H5>
        <DeltaSwitch2/>
        {renderDeltaSwitch(
          'sentbox_watch',
          tx('pref_watch_sent_folder'),
          disableIfOnlyFetchMvBoxIsTrue
        )}
        {renderDeltaSwitch('bcc_self', tx('pref_send_copy_to_self'))}
        <div className='bp3-callout'>
          {tx('pref_send_copy_to_self_explain')}
        </div>
        {renderDeltaSwitch(
          'mvbox_move',
          tx('pref_auto_folder_moves'),
          disableIfOnlyFetchMvBoxIsTrue
        )}
        <div className='bp3-callout'>
          {tx('pref_auto_folder_moves_explain')}
        </div>
        {renderDeltaSwitch(
          'only_fetch_mvbox',
          tx('pref_only_watch_mvbox_folder_title')
        )}
        <div className='bp3-callout'>
          {tx('pref_only_watch_mvbox_folder_explain')}
        </div>
      </Card>
    </>
  )
}
