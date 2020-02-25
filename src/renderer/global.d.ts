import { getMessageFunction, LocaleData } from "../shared/localize";

import Electron from 'electron'

declare global {
    interface Window {
        translate: getMessageFunction
        localeData: LocaleData
        electron_functions: {
            // see static/preload.js
            ipcRenderer: import('electron').IpcRenderer
            remote: import('electron').Remote
            openExternal: typeof Electron.shell.openExternal
            openItem: typeof Electron.shell.openItem
        },
        native_dependency: {
            EventEmitter: import('events').EventEmitter
        },
        preload_functions: {
            downloadFile: (file:string) => void
        }
    }
}
