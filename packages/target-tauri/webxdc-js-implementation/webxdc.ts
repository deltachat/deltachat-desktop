import { Channel, invoke } from '@tauri-apps/api/core'
import type {
  ReceivedStatusUpdate,
  RealtimeListener as RealtimeListenerType,
} from '@webxdc/types'
import '@webxdc/types/global'

type SR = (data: number[]) => void
type LR = () => void

class RealtimeListener implements RealtimeListenerType {
  listener: Parameters<RealtimeListenerType['setListener']>[0] | null = null
  trashed = false

  constructor(
    private sendRealtime: SR,
    private leaveRealtime: LR
  ) {
    this.setListener = this.setListener.bind(this)
    this.send = this.send.bind(this)
    this.leave = this.leave.bind(this)
    this.is_trashed = this.is_trashed.bind(this)
  }

  is_trashed() {
    return this.trashed
  }

  setListener(listener: Parameters<RealtimeListenerType['setListener']>[0]) {
    this.listener = listener
  }

  send(data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
      throw new Error('realtime listener data must be a Uint8Array')
    }
    if (this.trashed) {
      throw new Error('realtime listener is trashed and can no longer be used')
    }
    this.sendRealtime(Array.from(data))
  }

  leave() {
    this.trashed = true
    this.leaveRealtime()
  }
}

;(() => {
  const utf8decoder = new TextDecoder()

  let callback: ((update: ReceivedStatusUpdate<unknown>) => void) | null = null
  let realtimeListener: RealtimeListener | null = null
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

  // listen<null>('webxdc_status_update', onStatusUpdate)
  // listen<number[]>('webxdc_realtime_data', ({ payload: data }) => {
  //   if (realtimeListener && !realtimeListener.is_trashed()) {
  //     realtimeListener.listener?.(Uint8Array.from(data))
  //   }
  // })

  type ChannelWebxdcUpdate =
    | {
        event: 'status'
      }
    | {
        event: 'realtimePacket'
        data: number[]
      }

  const onEvent = new Channel<ChannelWebxdcUpdate>()
  invoke('register_webxdc_channel', { channel: onEvent })
  onEvent.onmessage = message => {
    // console.log(`got event ${message.event}`, message)
    if (message.event === 'realtimePacket') {
      if (realtimeListener && !realtimeListener.is_trashed()) {
        realtimeListener.listener?.(Uint8Array.from(message.data))
      }
    } else if (message.event === 'status') {
      onStatusUpdate()
    }
  }

  window.webxdc = {
    // The `__TEMPLATE` values will be substituted
    // in our webxdc protocol handler.
    //@ts-expect-error
    selfAddr: utf8decoder.decode(new Uint8Array([__TEMPLATE_SELFADDR__])),
    //@ts-expect-error
    selfName: utf8decoder.decode(new Uint8Array([__TEMPLATE_SELFNAME__])),
    //@ts-expect-error
    sendUpdateInterval: __TEMPLATE_SEND_UPDATE_INTERVAL__,
    //@ts-expect-error
    sendUpdateMaxSize: __TEMPLATE_SEND_UPDATE_MAX_SIZE__,

    sendUpdate(update, description) {
      if (description) {
        // eslint-disable-next-line no-console
        console.warn('sendUpdate: the description parameter is deprecated')
      }
      invoke('send_webxdc_update', { statusUpdate: update }).catch(
        // eslint-disable-next-line no-console
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
    getAllUpdates: () => {
      // eslint-disable-next-line no-console
      console.error(
        'getAllUpdates is deprecated and will be removed in the future, it also returns an empty array now, so you really should use setUpdateListener instead.'
      )
      return Promise.resolve([])
    },
    joinRealtimeChannel: () => {
      if (realtimeListener && !realtimeListener.is_trashed()) {
        throw new Error('realtime listener already exists')
      }

      realtimeListener = new RealtimeListener(
        data => invoke('send_webxdc_realtime_data', { data }),
        () => invoke('leave_webxdc_realtime_channel')
      )
      invoke('join_webxdc_realtime_channel')

      return realtimeListener
    },
    sendToChat: async content => {
      if (!content.file && !content.text) {
        return Promise.reject(
          'Error from sendToChat: Invalid empty message, at least one of text or file should be provided'
        )
      }
      const blob_to_base64: (file: Blob) => Promise<string> = file => {
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

      let file: { fileName: string; fileContent: string } | null = null
      if (content.file) {
        let base64Content: string
        if (!content.file.name) {
          return Promise.reject('file name is missing')
        }
        if (
          Object.keys(content.file).filter(key =>
            ['blob', 'base64', 'plainText'].includes(key)
          ).length > 1
        ) {
          return Promise.reject(
            'you can only set one of `blob`, `base64` or `plainText`, not multiple ones'
          )
        }

        // @ts-ignore - needed because typescript imagines that blob would not exist
        if (content.file.blob instanceof Blob) {
          // @ts-ignore - needed because typescript imagines that blob would not exist
          base64Content = await blob_to_base64(content.file.blob)
          // @ts-ignore - needed because typescript imagines that base64 would not exist
        } else if (typeof content.file.base64 === 'string') {
          // @ts-ignore - needed because typescript imagines that base64 would not exist
          base64Content = content.file.base64
          // @ts-ignore - needed because typescript imagines that plainText would not exist
        } else if (typeof content.file.plainText === 'string') {
          base64Content = await blob_to_base64(
            // @ts-ignore - needed because typescript imagines that plainText would not exist
            new Blob([content.file.plainText])
          )
        } else {
          return Promise.reject(
            'data is not set or wrong format, set one of `blob`, `base64` or `plainText`, see webxdc documentation for sendToChat'
          )
        }

        file = {
          fileName: content.file.name,
          fileContent: base64Content,
        }
      }

      await invoke('webxdc_send_to_chat', {
        options: { file, text: content.text },
      })
    },
    importFiles: filters => {
      const element = document.createElement('input')
      element.type = 'file'
      element.accept = [
        ...(filters.extensions || []),
        ...(filters.mimeTypes || []),
      ].join(',')
      element.multiple = filters.multiple || false
      const promise = new Promise<File[]>((resolve, _reject) => {
        element.onchange = _ev => {
          // console.log('element.files', element.files)
          const files = Array.from(element.files || [])
          document.body.removeChild(element)
          resolve(files)
        }
      })
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      // console.log(element)
      return promise
    },
  }
})()
