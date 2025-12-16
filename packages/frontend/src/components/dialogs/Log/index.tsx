import { runtime } from '@deltachat-desktop/runtime-interface'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote } from '../../../backend-com'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import { DialogProps } from '../../../contexts/DialogContext'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'

import styles from './styles.module.scss'
import WebxdcSaveToChatDialog from '../WebxdcSendToChat'
import useDialog from '../../../hooks/dialog/useDialog'
import { yerpc } from '@deltachat/jsonrpc-client'

function infoObjectToString(info: Record<string, string>): string {
  let result = ''
  for (const key of Object.keys(info)) {
    const value =
      typeof info[key] == 'object' ? JSON.stringify(info[key]) : info[key]
    result += `${key}=${value}\n`
  }
  return result
}

async function getLog(): Promise<string> {
  const runtimeInfo = runtime.getRuntimeInfo()
  const { VERSION, GIT_REF } = runtimeInfo.buildInfo

  const systemInfo = await BackendRemote.rpc.getSystemInfo()

  const selectedAccountId = window.__selectedAccountId

  const [profile_info, storage_usage] = selectedAccountId
    ? await Promise.all([
        BackendRemote.rpc
          .getInfo(selectedAccountId)
          .catch((error: yerpc.Error) => ({
            'failed to get info': error.message,
          })),
        BackendRemote.rpc
          .getStorageUsageReportString(selectedAccountId)
          .catch(
            (error: yerpc.Error) =>
              `failed to get storage report: ${error.message}`
          ),
      ])
    : [{}, '']

  const versions = [
    ...runtime.getRuntimeInfo().versions,
    { label: 'SQLite', value: systemInfo['sqlite_version'] },
  ]
  const versionInfoSection = versions
    .map(({ label, value }) => `${label}=${value}`)
    .join('\n')

  const visibleRuntimeInfoObject = Object.assign({}, runtimeInfo) as Partial<
    typeof runtimeInfo
  > &
    Record<string, string>
  delete visibleRuntimeInfoObject.versions
  delete visibleRuntimeInfoObject.buildInfo
  // reproducible builds set this timestamp to 0
  if (runtimeInfo.buildInfo.BUILD_TIMESTAMP != 0)
    visibleRuntimeInfoObject.buildTimestamp = String(
      runtimeInfo.buildInfo.BUILD_TIMESTAMP
    )

  /** runtime info, but flattened to string and only showing keys that are not already shown elsewhere */
  const visibleRuntimeInfo = infoObjectToString(visibleRuntimeInfoObject)

  let log = ''
  try {
    log = await runtime.readCurrentLog()
  } catch (error: any) {
    log = `failed to read log at ${runtime.getCurrentLogLocation()}
Error: ${error?.message || error}`
  }

  return `** This log may contain sensitive information. If you want to post it publicly, you may examine and edit it beforehand. **

DC Desktop Version: ${VERSION} (git: ${GIT_REF})
Core Version: ${systemInfo['deltachat_core_version']}
Runtime: ${runtime.constructor.name}

[Versions]
${versionInfoSection}

[Runtime Info]
${visibleRuntimeInfo}
${
  selectedAccountId
    ? `[Chatmail Core Info | About Current Profile]
Selected Profile ID: ${selectedAccountId}
${infoObjectToString(profile_info)}
${storage_usage}`
    : `[Chatmail Core Info]
Selected Profile ID: no profile selected
${infoObjectToString(systemInfo)}`
}
[Log]
${log}`
}

const blobToBase64: (file: Blob) => Promise<string> = file => {
  const data_start = ';base64,'
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      //@ts-ignore
      const data: string = reader.result
      resolve(data.slice(data.indexOf(data_start) + data_start.length))
    }
    reader.onerror = () => reject(reader.error)
  })
}

export function LogDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const openAlertDialog = useAlertDialog()

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [loading, setLoading] = useState(true)

  const [copySuccess, setCopySuccess] = useState(false)

  const update = useCallback(async () => {
    try {
      setLoading(true)
      const log = await getLog()
      if (textAreaRef.current) textAreaRef.current.value = log
      else throw new Error('textAreaRef is unset')
      setLoading(false)
    } catch (error: any) {
      openAlertDialog({
        message: `Failed to load log: ${error?.message || error}`,
      })
    }
  }, [openAlertDialog])

  useEffect(() => {
    if (!textAreaRef.current?.value) {
      update()
    }
  }, [update])

  const getModifiedText = () => {
    return textAreaRef.current?.value
  }

  const copyToClipboard = async () => {
    try {
      const text = getModifiedText()
      if (!text) throw new Error('text is unset')
      await runtime.writeClipboardText(text)

      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1200)
    } catch (error: any) {
      openAlertDialog({
        message: `Failed to copy log to clipboard: ${error?.message || error}`,
      })
    }
  }

  const shareToChat = async () => {
    try {
      const text = getModifiedText()
      if (!text) throw new Error('text is unset')
      // IDEA: import support contact vcard and pass a parameter to display it on top?
      openDialog(WebxdcSaveToChatDialog, {
        file: {
          file_name: `deltachat_desktop_log_${new Date().toUTCString().replaceAll(' ', '_')}.log.txt`,
          file_content: await blobToBase64(new Blob([text])),
        },
        messageText: null,
      })
      onClose()
      // TODO: close about or settings dialog as well if it is still open.
    } catch (error: any) {
      openAlertDialog({
        message: `Failed to prepare log file for sharing: ${error?.message || error}`,
      })
    }
  }

  return (
    <Dialog
      width={800}
      height={1000}
      onClose={onClose}
      // Disable canOutsideClickClose, because it interferes with text selection.
      // When you accidentally let go of the mouse button outside the dialog, it closes.
      canOutsideClickClose={false}
    >
      <DialogHeader onClose={onClose} title={tx('pref_log_header')} />
      <DialogBody className={styles.dialogBody}>
        <DialogContent className={styles.dialogContent}>
          {loading && tx('loading')}
          <textarea ref={textAreaRef} disabled={loading}></textarea>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={copyToClipboard}>
            {tx(copySuccess ? 'copied_to_clipboard' : 'menu_copy_to_clipboard')}
          </FooterActionButton>
          <FooterActionButton styling='primary' onClick={shareToChat}>
            {tx('menu_share')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
