export namespace MessageToFrontend {}

export namespace MessageToBackend {
  export interface LogEntry {
    type: 'log'
    data: [
      channel: string,
      level: string,
      stack_trace: string | StackFrame[],
      ...args: any[],
    ]
  }

  /** not really used in browser (yet),
   * in electron edition this signals that the window should be shown */
  export interface UIReady {
    type: 'UIReady'
  }
  /** not really used in browser (yet),
   * in electron edition that the ui is ready and account is selected in, so it can now receive open_url instructions */
  export interface UIReadyFrontendReady {
    type: 'UIReadyFrontendReady'
  }

  export type AllTypes = LogEntry | UIReady | UIReadyFrontendReady
}
