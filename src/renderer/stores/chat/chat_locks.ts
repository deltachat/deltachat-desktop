import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/stores/chat/sceduler')

interface ChatStoreLocks {
  scroll: boolean
  queue: boolean
}

export class ChatStoreSceduler {
  private locks: ChatStoreLocks = {
    scroll: false,
    queue: false,
  }

  effectQueue: Function[] = []

  unlock(key: keyof ChatStoreLocks) {
    this.locks[key] = false
  }

  lock(key: keyof ChatStoreLocks) {
    this.locks[key] = true
  }

  isLocked(key: keyof ChatStoreLocks) {
    return this.locks[key]
  }

  /**  This effect will only get executed if the lock is unlocked. If it's still locked, this effect
   * will get dropped/not executed. If you want the effect to get executed as soon as the lock with
   * lockNameis unlocked, use lockedQueuedEffect.*/
  lockedEffect<T extends Function>(
    lockName: keyof ChatStoreLocks,
    effect: T,
    effectName: string
  ): T {
    const fn: T = ((async (...args: any) => {
      if (this.isLocked(lockName) === true) {
        log.debug(`lockedEffect: ${effectName}: We're locked, dropping effect`)
        return false
      }

      //log.debug(`lockedEffect: ${effectName}: locking`)
      this.lock(lockName)
      let returnValue
      try {
        returnValue = await effect(...args)
      } catch (err) {
        log.error(`lockedEffect: ${effectName}: error in called effect: ${err}`)
        this.unlock(lockName)
        return
      }
      if (returnValue === false) {
        /*log.debug(
              `lockedEffect: ${effectName}: return value was false, unlocking`
            )*/
        this.unlock(lockName)
      } else {
        /*log.debug(
              `lockedEffect: ${effectName}: return value was NOT false, keeping it locked`
            )*/
      }
      return returnValue
    }) as unknown) as T
    return fn
  }

  tickRunQueuedEffect() {
    setTimeout(async () => {
      log.debug('effectQueue: running queued effects')
      if (this.effectQueue.length === 0) {
        //log.debug('effectQueue: no more queued effects, unlocking')
        this.unlock('queue')
        log.debug('effectQueue: finished')
        return
      }

      const effect = this.effectQueue.pop()
      if (!effect) {
        throw new Error(
          `Undefined effect in effect queue? This should not happen. Effect is: ${JSON.stringify(
            effect
          )}`
        )
      }
      try {
        await effect()
      } catch (err) {
        log.error(`tickRunQueuedEffect: error in effect: ${err}`)
      }
      this.tickRunQueuedEffect()
    }, 0)
  }

  /**  This effect will get added to the end of the queue. The queue is getting executed one after the other. */
  queuedEffect<T extends Function>(effect: T, effectName: string): T {
    const fn: T = ((async (...args: any) => {
      const lockQueue = () => {
        //log.debug(`queuedEffect: ${effectName}: locking`)
        this.lock('queue')
      }
      const unlockQueue = () => {
        this.unlock('queue')
        //log.debug(`queuedEffect: ${effectName}: unlocked`)
      }

      if (this.isLocked('queue') === true) {
        log.debug(
          `queuedEffect: ${effectName}: We're locked, adding effect to queue`
        )
        this.effectQueue.push(effect.bind(this, ...args))
        return false
      }

      //log.debug(`queuedEffect: ${effectName}: locking`)
      lockQueue()
      let returnValue
      try {
        returnValue = await effect(...args)
      } catch (err) {
        log.error(`Error in queuedEffect ${effectName}: ${err}`)
        unlockQueue()
        return
      }
      if (this.effectQueue.length !== 0) {
        this.tickRunQueuedEffect()
      } else {
        unlockQueue()
      }

      //log.debug(`queuedEffect: ${effectName}: done`)
      return returnValue
    }) as unknown) as T
    return fn
  }

  /** This effect is once the lock with lockName is unlocked. It will get postponed until the lock is free. */
  lockedQueuedEffect<T extends Function>(
    lockName: keyof ChatStoreLocks,
    effect: T,
    effectName: string
  ): T {
    const fn: T = ((async (...args: any) => {
      const lockQueue = () => {
        //log.debug(`lockedQueuedEffect: ${effectName}: locking`)
        this.lock('queue')
      }
      const unlockQueue = () => {
        this.unlock('queue')
        log.debug(`lockedQueuedEffect: ${effectName}: unlocked`)
      }

      if (this.isLocked('queue') === true) {
        log.debug(
          `lockedQueuedEffect: ${effectName}: We're locked, adding effect to queue`
        )
        this.effectQueue.push(effect.bind(this, ...args))
        return false
      }

      if (this.isLocked(lockName) === true) {
        log.debug(
          `lockedQueuedEffect: ${effectName}: Lock "${lockName}" is locked, postponing effect in queue`
        )
        this.effectQueue.push(effect.bind(this, ...args))
        return false
      }

      //log.debug(`lockedQueuedEffect: ${effectName}: locking`)
      lockQueue()
      let returnValue
      try {
        returnValue = await effect(...args)
      } catch (err) {
        log.error(
          `Error in lockedQueuedEffect ${effectName}: ${(err as Error).stack}`
        )
        unlockQueue()
        return
      }
      if (this.effectQueue.length !== 0) {
        this.tickRunQueuedEffect()
      } else {
        unlockQueue()
      }

      log.debug(`lockedQueuedEffect: ${effectName}: done`)
      return returnValue
    }) as unknown) as T
    return fn
  }
}
