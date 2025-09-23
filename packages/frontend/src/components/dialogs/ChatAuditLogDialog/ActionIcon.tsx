import React from 'react'
import { T } from '@deltachat/jsonrpc-client'
import Icon, { IconName } from '../../Icon'
import styles from './styles.module.scss'

const Action2IconMap: {
  [K in T.SystemMessageType]: IconName
} = {
  Unknown: 'question_mark',
  WebxdcInfoMessage: 'apps',

  // chat changes
  GroupNameChanged: 'lead-pencil',
  GroupImageChanged: 'image',
  MemberAddedToGroup: 'person_add',
  MemberRemovedFromGroup: 'person_remove',
  EphemeralTimerChanged: 'timer',

  // location
  LocationStreamingEnabled: 'location',

  // encryption
  InvalidUnencryptedMail: 'no_encryption',
  SecurejoinMessage: 'shield_lock',
  SecurejoinWait: 'shield_lock',
  SecurejoinWaitTimeout: 'shield_lock',
  ChatE2ee: 'enhanced_encryption',
  ChatProtectionEnabled: 'shield',
  ChatProtectionDisabled: 'remove_moderator',

  // less used these days
  AutocryptSetupMessage: 'devices',

  // in-visible messages
  MultiDeviceSync: 'devices',
  WebxdcStatusUpdate: 'apps',
  IrohNodeAddr: 'devices',
  LocationOnly: 'location',

  // if this is visible, then we should add more detailed icons
  CallAccepted: 'phone',
  CallEnded: 'phone',
}

const Action2ColorMap: Partial<{
  [K in T.SystemMessageType]: string
}> = {
  MemberAddedToGroup: 'green',
  MemberRemovedFromGroup: 'red',
}

export function ActionIcon({
  systemMessageType,
}: {
  systemMessageType: T.SystemMessageType
}) {
  return (
    <div
      className={styles.actionIcon}
      style={
        {
          '--icon-color': Action2ColorMap[systemMessageType] || undefined,
        } as any
      }
    >
      <Icon
        icon={Action2IconMap[systemMessageType]}
        coloring='iconColorCSSVar'
      />
    </div>
  )
}
