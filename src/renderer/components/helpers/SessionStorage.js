
module.exports = {
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     * @param {{[key:string]:any}} value
     */
  storeItem: function (scopeName, key, value) {
    window.sessionStorage.setItem(`${scopeName}-${key}`, JSON.stringify(value))
  },
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     * @returns {{[key:string]:any}}
     */
  getItem: function (scopeName, key) {
    const value = window.sessionStorage.getItem(`${scopeName}-${key}`)
    return value ? JSON.parse(value) : undefined
  },
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     */
  remove: function (scopeName, key) {
    window.sessionStorage.removeItem(`${scopeName}-${key}`)
  }

}
