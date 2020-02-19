import { getMessageFunction, LocaleData } from "../shared/localize";

declare global {
    interface Window {
        translate: getMessageFunction
        localeData: LocaleData
        electron_functions: {
            // see static/preload.js
            ipcRenderer: import('electron').IpcRenderer
            remote: import('electron').Remote
            shell: import('electron').Shell
            clipboard: import('electron').Clipboard
        },
        native_dependency: {
            EventEmitter: import('events').EventEmitter
        },
        preload_functions: {
            downloadFile: (file:string) => void
        }
    }
}