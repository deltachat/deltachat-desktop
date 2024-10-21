import { SessionData, Store } from 'express-session'
import { LocalStorage } from 'node-localstorage'

export class FileStore extends Store {
  constructor(public localstorage: LocalStorage) {
    super()
  }
  get(
    sid: string,
    callback: (err: any, session?: SessionData | null) => void
  ): void {
    try {
      const rawSession = this.localstorage.getItem(`session_${sid}`)
      callback(null, rawSession ? JSON.parse(rawSession) : null)
    } catch (error) {
      callback(error)
    }
  }
  set(sid: string, session: SessionData, callback?: (err?: any) => void): void {
    try {
      this.localstorage.setItem(`session_${sid}`, JSON.stringify(session))
      callback?.(null)
    } catch (error) {
      callback?.(error)
    }
  }
  destroy(sid: string, callback?: (err?: any) => void): void {
    try {
      this.localstorage.removeItem(`session_${sid}`)
      callback?.(null)
    } catch (error) {
      callback?.(error)
    }
  }
}
