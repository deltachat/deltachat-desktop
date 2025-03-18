import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { ReceivedStatusUpdate } from '@webxdc/types'
import '@webxdc/types/global'
;(() => {
  const utf8decoder = new TextDecoder()

  let callback: ((update: ReceivedStatusUpdate<unknown>) => void) | null = null
  let last_serial = 0
  let setUpdateListenerPromise: (() => void) | null = null
  let is_running = false
  let scheduled = false
  const innerOnStatusUpdate = async () => {
    const updates = JSON.parse(
      await invoke('get_webxdc_updates', {
        lastKnownSerial: last_serial,
      })
    )
    for (const update of updates) {
      last_serial = update.max_serial
      callback?.(update)
    }
    if (setUpdateListenerPromise) {
      setUpdateListenerPromise()
      setUpdateListenerPromise = null
    }
  }

  const onStatusUpdate = async () => {
    if (is_running) {
      scheduled = true
      return
    }
    is_running = true
    if (callback) {
      await innerOnStatusUpdate()
    }
    if (scheduled) {
      scheduled = false
      await onStatusUpdate()
      is_running = false
    } else {
      is_running = false
    }
  }

  listen<null>('webxdc_status_update', onStatusUpdate)

  window.webxdc = {
    //@ts-expect-error
    selfAddr: utf8decoder.decode(new Uint8Array([SELFADDR])),
    //@ts-expect-error
    selfName: utf8decoder.decode(new Uint8Array([SELFNAME])),
    sendUpdate(update, description) {
      if (description) {
        console.warn('sendUpdate: the description parameter is deprecated')
      }
      invoke('send_webxdc_update', { statusUpdate: update }).catch(
        console.error.bind(null, 'sendUpdate failed:')
      )
    },
    setUpdateListener: (cb, start_serial = 0) => {
      last_serial = start_serial
      callback = cb
      const promise = new Promise<void>((res, _rej) => {
        setUpdateListenerPromise = res
      })
      onStatusUpdate()
      return promise
    },
  }
})()
