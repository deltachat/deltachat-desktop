import React, { useState, useEffect, useContext, useRef } from 'react'
import { Elevation, H5, Card, Classes, Switch, Label } from '@blueprintjs/core'

import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/dialogs/Settings')

export default function SettingsImapFolderHandling({
  renderDeltaSwitch,
}: {
  renderDeltaSwitch: Function
}) {
  const tx = window.static_translate
  return (
    <>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('pref_imap_folder_handling')}</H5>
        {renderDeltaSwitch('sentbox_watch', tx('pref_watch_sent_folder'))}
        {renderDeltaSwitch(
          'only_fetch_mvbox',
          tx('pref_only_watch_mvbox_folder_title')
        )}
        {renderDeltaSwitch('bcc_self', tx('pref_send_copy_to_self'))}
        {renderDeltaSwitch('mvbox_move', tx('pref_auto_folder_moves'))}
        <div className='bp3-callout'>
          {tx('pref_only_watch_mvbox_folder_explain')}
        </div>
      </Card>
    </>
  )
}
