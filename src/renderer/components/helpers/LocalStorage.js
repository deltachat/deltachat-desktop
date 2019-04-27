
module.exports = {
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     * @param {{[key:string]:any}} value
     */
  storeItem: function (scopeName, key, value) {
    window.localStorage.setItem(`${scopeName}-${key}`, JSON.stringify(value))
  },
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     * @returns {{[key:string]:any}}
     */
  getItem: function (scopeName, key) {
    const value = window.localStorage.getItem(`${scopeName}-${key}`)
    return value ? JSON.parse(value) : undefined
  },
  /**
     *
     * @param {string} scopeName name of the scope for example a user identifier
     * @param {string} key
     */
  remove: function (scopeName, key) {
    window.localStorage.removeItem(`${scopeName}-${key}`)
  }

}
