// This is the preload script for the main window. It exposes the
// `runtime_api` bridge that `runtime-electron/runtime.ts` talks to.
// see https://www.electronjs.org/de/docs/latest/tutorial/tutorial-preload

import { contextBridge, ipcRenderer, webUtils } from 'electron'

import {
  INVOKE_CHANNELS,
  SEND_CHANNELS,
  SEND_SYNC_CHANNELS,
  RECEIVE_CHANNELS,
} from './ipc-channels.js'

const assertAllowed = (allowlist: readonly string[], channel: string) => {
  if (!allowlist.includes(channel)) {
    throw new Error(`runtime_api: ipc channel "${channel}" is not allowed`)
  }
}

contextBridge.exposeInMainWorld('runtime_api', {
  invoke: (channel: string, ...args: any[]) => {
    assertAllowed(INVOKE_CHANNELS, channel)
    return ipcRenderer.invoke(channel, ...args)
  },
  send: (channel: string, ...args: any[]) => {
    assertAllowed(SEND_CHANNELS, channel)
    ipcRenderer.send(channel, ...args)
  },
  sendSync: (channel: string, ...args: any[]) => {
    assertAllowed(SEND_SYNC_CHANNELS, channel)
    return ipcRenderer.sendSync(channel, ...args)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    assertAllowed(RECEIVE_CHANNELS, channel)
    // don't leak the IpcRendererEvent across the bridge
    ipcRenderer.on(channel, (_ev, ...args) => callback(...args))
  },
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
})
