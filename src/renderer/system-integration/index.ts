import { initBadgeCounter } from './badge-counter'
import { initNotifications } from './notifications'

/** this function needs to be called AFTER the runtime and dc events are initialized */
export default function initSystemIntegration() {
  initNotifications()
  initBadgeCounter()
}
