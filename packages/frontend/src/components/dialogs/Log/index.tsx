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
import useContextMenu from '../../../hooks/useContextMenu'

import styles from './styles.module.scss'

function infoObjectToString(info: Record<string, string>): string {
  let result = ''
  for (const key of Object.keys(info)) {
    result += `${key}=${info[key]}\n`
  }
  return result
}

async function getLog(): Promise<string> {
  const runtimeInfo = runtime.getRuntimeInfo()
  const { VERSION, GIT_REF } = runtimeInfo.buildInfo

  const systemInfo = await BackendRemote.rpc.getSystemInfo()

  const selectedAccountId = window.__selectedAccountId

  // TODO: add resistance if either call fails it should still show the rest
  const [profile_info, storage_usage] = selectedAccountId
    ? await Promise.all([
        BackendRemote.rpc.getInfo(selectedAccountId),
        BackendRemote.rpc.getStorageUsageReportString(selectedAccountId),
      ])
    : [{}, '']

  // TODO: think about re-adding a prettier versions section
  // info['sqlite_version']
  // {runtime.getRuntimeInfo().versions.map(({ label, value }) => (
  //   <tr key={label} style={{ color: 'grey' }}>
  //     <td>{label}</td>
  //     <td style={{ userSelect: 'all' }}>{value}</td>
  //   </tr>
  // ))}

  let log = ''
  try {
    // TODO implement api in tauri
    // TODO implement api in browser
    log = await runtime.readCurrentLog()
  } catch (error: any) {
    log = `failed to read log at ${runtime.getCurrentLogLocation()}
Error: ${error?.message || error}`
  }

  return `[Build Info]
DC Desktop Version: ${VERSION} (git: ${GIT_REF})
Core Version: ${systemInfo['deltachat_core_version']}
Runtime: ${runtime.constructor.name}

[Runtime Info]
${JSON.stringify(runtimeInfo, null, 2)}

[Chatmail Core Info]
${infoObjectToString(systemInfo)}
${
  selectedAccountId
    ? `[Core Info About Profile]
Selected Profile ID: ${selectedAccountId}
${infoObjectToString(profile_info)}
[Storage Usage Report]
${storage_usage}`
    : '[[no profile selected]]'
}
[Log]
${log}`
}

export function LogDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [openAlertDialog /* TODO check if this can trigger an unwanted reload */])

  useEffect(() => {
    update()
  }, [update])

  const getModifiedText = () => {
    return textAreaRef.current?.value
  }

  const copyToClipboard = async () => {
    try {
      const text = getModifiedText()
      if (text) await runtime.writeClipboardText(text)
      else throw new Error('text is unset')

      // TODO user feedback when copy was successful
    } catch (error: any) {
      openAlertDialog({
        message: `Failed to copy log to clipboard: ${error?.message || error}`,
      })
    }
  }
  const shareToChat = () => {
    // TODO (using webxdc share to chat dialog)
  }

  const menu = useContextMenu([{ label: tx('reload'), action: update }])

  return (
    <Dialog
      width={800}
      height={1000}
      onClose={onClose}
      // Disable canOutsideClickClose, because it interferes with text selection.
      // When you accidentally let go of the mouse button outside the dialog, it closes.
      canOutsideClickClose={false}
    >
      <DialogHeader
        onClose={onClose}
        onContextMenuClick={menu}
        title={tx('pref_log_header')}
      />
      <DialogBody className={styles.dialogBody}>
        <DialogContent className={styles.dialogContent}>
          {loading && 'Loading..'}
          <textarea ref={textAreaRef} disabled={loading}></textarea>
          <p>
            {/* TODO translate this text */}
            This log may contain sensitive information. If you want to post it
            publicly you may examine and edit it beforehand.
          </p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={copyToClipboard}>
            {tx('menu_copy_to_clipboard')}
          </FooterActionButton>
          <FooterActionButton styling='primary' onClick={shareToChat}>
            {tx('menu_share')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
