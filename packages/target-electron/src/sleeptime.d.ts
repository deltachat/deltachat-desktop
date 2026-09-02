declare module 'sleeptime' {
  export default class SleepTime {
    constructor(
      wakeUpCallback: (diff: number, now: number) => void,
      thresh?: number
    )
  }
}
