import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
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

  listen<null>('webxdc_status_update', onStatusUpdate)
  listen<number[]>('webxdc_realtime_data', ({ payload: data }) => {
    if (realtimeListener && !realtimeListener.is_trashed()) {
      realtimeListener.listener?.(Uint8Array.from(data))
    }
  })

  window.webxdc = {
    //@ts-expect-error
    selfAddr: utf8decoder.decode(new Uint8Array([SELFADDR])),
    //@ts-expect-error
    selfName: utf8decoder.decode(new Uint8Array([SELFNAME])),
    //@ts-expect-error
    sendUpdateInterval: SEND_UPDATE_INTERVAL,
    //@ts-expect-error
    sendUpdateMaxSize: SEND_UPDATE_MAX_SIZE,
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
  }
})()
