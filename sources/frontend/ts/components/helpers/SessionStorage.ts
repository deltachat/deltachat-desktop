/**
 * @param {string} scopeName name of the scope for example a user identifier
 */
export function storeItem(scopeName: string, key: string, value: any) {
  window.sessionStorage.setItem(`${scopeName}-${key}`, JSON.stringify(value))
}
/**
 * @param {string} scopeName name of the scope for example a user identifier
 */
export function getItem(scopeName: string, key: string): any {
  const value = window.sessionStorage.getItem(`${scopeName}-${key}`)
  return value ? JSON.parse(value) : undefined
}
/**
 * @param scopeName name of the scope for example a user identifier
 */
export function remove(scopeName: string, key: string) {
  window.sessionStorage.removeItem(`${scopeName}-${key}`)
}
export default { storeItem, getItem, remove }
