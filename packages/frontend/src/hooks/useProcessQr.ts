import { useCallback } from 'react'

import CopyContentAlertDialog from '../components/CopyContentAlertDialog'
import useAlertDialog from './dialog/useAlertDialog'
import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from './dialog/useDialog'
import useInstantOnboarding from './useInstantOnboarding'
import useOpenMailtoLink from './useOpenMailtoLink'
import useSecureJoin from './useSecureJoin'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ReceiveBackupProgressDialog } from '../components/dialogs/SetupMultiDevice'
import { getLogger } from '../../../shared/logger'
import { processQr, QrWithUrl } from '../backend/qr'

import type { T } from '@deltachat/jsonrpc-client'
import type { WelcomeQrWithUrl } from '../contexts/InstantOnboardingContext'
import type { TranslationKey } from '../../../shared/translationKeyType'
import useChat from './chat/useChat'
import { unknownErrorToString } from '../components/helpers/unknownErrorToString'
import ProxyConfiguration from '../components/dialogs/ProxyConfiguration'
import { useSettingsStore } from '../stores/settings'
import TransportsDialog, {
  addTransportConfirmationDialog,
} from '../components/dialogs/Transports'

const ALLOWED_QR_CODES_ON_WELCOME_SCREEN: T.Qr['kind'][] = [
  'account',
  'askVerifyContact',
  'askVerifyGroup',
  'askJoinBroadcast',
  'backup2',
  'login',
  'text',
  'url',
]

export const enum SCAN_CONTEXT_TYPE {
  /** default context, no restrictions on QR code types */
  DEFAULT = 'DEFAULT',
  /** onboarding with another server than the default server or contact/group invite code */
  OTHER_SERVER = 'OTHER_SERVER',
  /** for multi-device setup */
  TRANSFER_BACKUP = 'TRANSFER_BACKUP',
}

const log = getLogger('renderer/hooks/useProcessQr')

type WithdrawOrReviveQrKinds = Extract<
  T.Qr['kind'],
  `withdraw${string}` | `revive${string}`
>
type WithdrawOrReviveConfigs_ = {
  [P in WithdrawOrReviveQrKinds]: {
    messageKey: TranslationKey
    getMessageArgs?: (qr: any) => string[]
    dataTestid?: string
  }
}
// Allow indexing into with `string` type.
type WithdrawOrReviveConfigs = WithdrawOrReviveConfigs_ & {
  [key: string]:
    | undefined
    | WithdrawOrReviveConfigs_[keyof WithdrawOrReviveConfigs_]
}

const WITHDRAW_OR_REVIVE_CONFIGS: WithdrawOrReviveConfigs = {
  withdrawVerifyContact: {
    messageKey: 'withdraw_verifycontact_explain',
  },
  reviveVerifyContact: {
    messageKey: 'revive_verifycontact_explain',
  },
  withdrawVerifyGroup: {
    messageKey: 'withdraw_verifygroup_explain',
    getMessageArgs: qr => [qr.grpname],
    dataTestid: 'withdraw-verify-group',
  },
  reviveVerifyGroup: {
    messageKey: 'revive_verifycontact_explain',
  },
  withdrawJoinBroadcast: {
    messageKey: 'withdraw_joinbroadcast_explain',
    getMessageArgs: qr => [qr.name],
    dataTestid: 'withdraw-verify-channel',
  },
  reviveJoinBroadcast: {
    messageKey: 'revive_verifycontact_explain',
  },
} satisfies WithdrawOrReviveConfigs_

/**
 * Processes an unchecked string which was scanned from a QR code.
 *
 * If the string represents a valid DeltaChat URI-scheme, it initiatives
 * various secure join, instant onboarding or other actions based on it.
 *
 * See list of supported DeltaChat URI-schemes here:
 * - https://github.com/deltachat/interface/blob/main/uri-schemes.md
 * - https://c.delta.chat/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c
 */
export default function useProcessQR() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const openMailtoLink = useOpenMailtoLink()
  const { startInstantOnboardingFlow } = useInstantOnboarding()
  const { secureJoin } = useSecureJoin()

  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'
  const { selectChat } = useChat()

  /**
   * Processes various QR codes
   * catched errors will be shown in an alert dialog
   */
  const processQrCode = useCallback(
    async (accountId: number, qrContent: string) => {
      try {
        await BackendRemote.rpc.setConfigFromQr(accountId, qrContent)
      } catch (error) {
        openAlertDialog({
          message: unknownErrorToString(error),
        })
      }
    },
    [openAlertDialog]
  )

  // Users can enter the "Instant Onboarding" flow by scanning a QR code of these types:
  // DCACCOUNT (new transport from the included chatmail instance)
  // DCLOGIN ()
  // DC_ASK_VERIFYGROUP
  // DC_ASK_VERIFYCONTACT
  // which essentially creates
  // a new "chatmail" profile for them and connects them with the regarding
  // contact or group if given.
  //
  // We ask the user if they really want to proceed with this action and
  // accordingly prepare the onboarding.
  const startInstantOnboarding = useCallback(
    async (accountId: number, qrWithUrl: WelcomeQrWithUrl) => {
      const { qr } = qrWithUrl

      if (await BackendRemote.rpc.isConfigured(accountId)) {
        throw new Error(
          'Instant onboarding can not be started on already configured account'
        )
      }

      if (qr.kind === 'askVerifyGroup') {
        // Ask the user if they want to create a new account and join the group
        const userConfirmed = await openConfirmationDialog({
          message: tx('instant_onboarding_confirm_group', qr.grpname),
          confirmLabel: tx('ok'),
          dataTestid: 'ask-join-group',
        })

        if (!userConfirmed) {
          return
        }
      } else if (qr.kind === 'askVerifyContact') {
        // Ask the user if they want to create a new account and start
        // chatting with contact
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          qr.contact_id
        )

        const userConfirmed = await openConfirmationDialog({
          message: tx(
            'instant_onboarding_confirm_contact',
            contact.displayName
          ),
          confirmLabel: tx('ok'),
          dataTestid: 'ask-create-profile-and-join-chat',
        })

        if (!userConfirmed) {
          return
        }
      } else if (qr.kind === 'askJoinBroadcast') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('instant_onboarding_confirm_channel', qr.name),
          confirmLabel: tx('ok'),
          dataTestid: 'ask-create-profile-and-join-channel',
        })

        if (!userConfirmed) {
          return
        }
      }

      await startInstantOnboardingFlow(qrWithUrl)
    },
    [openConfirmationDialog, startInstantOnboardingFlow, tx]
  )

  const multiDeviceMode =
    (settingsStore && settingsStore.settings['bcc_self'] === '1') ?? false

  return useCallback(
    async (
      accountId: number,
      url: string,
      scanContext: SCAN_CONTEXT_TYPE,
      callback?: () => void
    ): Promise<void> => {
      // Check if given string is a valid DeltaChat URI-Scheme and return
      // parsed object, otherwise show an error to the user
      let parsed: QrWithUrl
      try {
        parsed = await processQr(accountId, url)
      } catch (err) {
        log.error(err)

        await openAlertDialog({
          message: tx('qrscan_failed') + '\n\n' + url,
          dataTestid: 'qr-scan-failed',
        })

        return callback?.()
      }

      const { qr } = parsed

      if (qr.kind === 'backupTooNew') {
        await openAlertDialog({
          message: tx('multidevice_receiver_needs_update'),
          dataTestid: 'backup-too-new',
        })
        return callback?.()
      }

      if (
        (scanContext === SCAN_CONTEXT_TYPE.TRANSFER_BACKUP &&
          qr.kind !== 'backup2') ||
        (scanContext === SCAN_CONTEXT_TYPE.OTHER_SERVER &&
          ![
            'account',
            'login',
            'askVerifyGroup',
            'askVerifyContact',
            'askJoinBroadcast',
          ].includes(qr.kind))
      ) {
        await openAlertDialog({
          message: tx('qraccount_qr_code_cannot_be_used'),
          dataTestid: 'qr-code-cannot-be-used',
        })
        return callback?.()
      }

      // Scanned string is actually a link to an email address
      if (url.toLowerCase().startsWith('mailto:')) {
        if (isChatmail) {
          // on chatmail server simple email can't be used
          await openAlertDialog({
            message: tx('invalid_unencrypted_explanation'),
          })
        } else {
          await openMailtoLink(accountId, url)
        }
        return callback?.()
      }

      // Some actions can only be executed when the user already has an account
      // and is logged in
      const isLoggedIn = await BackendRemote.rpc.isConfigured(accountId)
      if (
        !ALLOWED_QR_CODES_ON_WELCOME_SCREEN.includes(qr.kind) &&
        !isLoggedIn
      ) {
        await openAlertDialog({
          message: tx('need_to_be_logged_in'),
          dataTestid: 'need-to-be-logged-in',
        })
        return callback?.()
      }
      /**
       * DCACCOUNT:
       * contains the url to a chatmail relay
       * see https://github.com/deltachat/interface/blob/main/uri-schemes.md#DCACCOUNT
       * or
       *
       * DCLOGIN
       * complete login credentials for a relay or mail server
       * see https://github.com/deltachat/interface/blob/main/uri-schemes.md#DCLOGIN
       *
       *
       * Scenarios depending on the account status:
       * 1. configured account: Ask the user if they want to add a new relay to the current profile
       * 2. unconfigured account: set instant onboarding instance
       *
       */
      if (qr.kind === 'account' || qr.kind === 'login') {
        if (isLoggedIn) {
          const confirmed = await addTransportConfirmationDialog(
            qr.kind === 'account' ? qr.domain : qr.address,
            multiDeviceMode,
            openConfirmationDialog,
            tx('confirm_add_transport')
          )
          if (!confirmed) {
            return
          }
          await BackendRemote.rpc.addTransportFromQr(accountId, url)
          openDialog(TransportsDialog, {
            accountId,
          })
        } else {
          await startInstantOnboarding(accountId, { ...parsed, qr })
        }

        return callback?.()
      }

      /**
       * handle invite links for contacts, groups and channels
       *
       * DC_ASK_VERIFYCONTACT, DC_ASK_VERIFYGROUP, DC_ASK_JOIN_BROADCAST
       *
       * see https://securejoin.readthedocs.io/en/latest/new.html#setup-contact-protocol
       *
       * Before creating an account the user will be asked if he agrees to
       * create a new account and join the contact chat, group or channel
       */
      if (
        qr.kind === 'askVerifyContact' ||
        qr.kind === 'askVerifyGroup' ||
        qr.kind === 'askJoinBroadcast'
      ) {
        if (!isLoggedIn) {
          // Ask user to create a new account with instant onboarding flow before they
          // can enter the secure join flow
          await startInstantOnboarding(accountId, {
            ...parsed,
            qr,
          })
        } else {
          const chatId = await secureJoin(accountId, { ...parsed, qr })
          if (chatId) {
            selectChat(accountId, chatId)
          }
        }
        return callback?.()
      }

      /**
       * DCBACKUP
       *
       * Ask the user if they want to set up a new device
       * based on an existing backup
       * TODO: TRANSFER_BACKUP context only works with backup2 QR codes,
       * so we might extract the QR code processing from this function
       */
      if (qr.kind === 'backup2') {
        if (isLoggedIn) {
          await openAlertDialog({
            message: tx('need_to_be_logged_out'),
          })
        } else {
          openDialog(ReceiveBackupProgressDialog, {
            QrWithToken: url,
          })
        }
        return callback?.()
      }

      // DC_FPR_OK: Verify contact fingerprint
      if (qr.kind === 'fprOk') {
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          qr.contact_id
        )

        // TODO apparently we are supposed to suggest
        // to start the chat with this contact.
        const _userConfirmed = await openConfirmationDialog({
          message: `The fingerprint of ${contact.displayName} is valid!`,
          confirmLabel: tx('ok'),
        })

        return callback?.()
      }

      /**
       * Handle withdraw/revive actions for contacts, groups, and channels
       */
      const withdrawOrReviveAction = WITHDRAW_OR_REVIVE_CONFIGS[qr.kind]
      if (withdrawOrReviveAction) {
        const isWithdraw = qr.kind.startsWith('withdraw')
        const headerKey = isWithdraw ? 'withdraw_qr_code' : 'revive_qr_code'
        const messageArgs = withdrawOrReviveAction.getMessageArgs?.(qr) || []
        const userConfirmed = await openConfirmationDialog({
          message: tx(withdrawOrReviveAction.messageKey, ...messageArgs),
          header: tx(headerKey),
          confirmLabel: tx(headerKey),
          ...(withdrawOrReviveAction.dataTestid && {
            dataTestid: withdrawOrReviveAction.dataTestid,
          }),
        })

        if (userConfirmed) {
          await processQrCode(accountId, url)
        }

        return callback?.()
      }

      if (qr.kind === 'proxy') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('proxy_use_proxy_confirm', qr.url),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          openDialog(ProxyConfiguration, {
            accountId,
            configured: true,
            newProxyUrl: qr.url,
          })
        }

        return callback?.()
      }

      // Just show the contents of the scanned QR code
      // so the user can see what it contains,
      // we don't know what to do with it ..
      if (isLoggedIn) {
        openDialog(CopyContentAlertDialog, {
          message:
            qr.kind === 'url'
              ? tx('qrscan_contains_url', url)
              : tx('qrscan_contains_text', url),
          content: url,
        })
        // this closes the underlying scan dialog immediately
        // while the copyContent dialog is still open
        return callback?.()
      } else {
        await openAlertDialog({
          message: tx('qraccount_qr_code_cannot_be_used'),
          dataTestid: 'qr-code-cannot-be-used',
        })
        return callback?.()
      }
    },
    [
      openAlertDialog,
      openConfirmationDialog,
      openDialog,
      openMailtoLink,
      secureJoin,
      processQrCode,
      startInstantOnboarding,
      selectChat,
      isChatmail,
      multiDeviceMode,
      tx,
    ]
  )
}
