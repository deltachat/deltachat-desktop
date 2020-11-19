import fetch from 'node-fetch'
// import { getLogger } from '../../shared/logger'
// const log = getLogger('main/deltachat/burner')

import SplitOut from './splitout'
export default class DCBurnerAccounts extends SplitOut {
  async postData(url = '') {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'cache-control': 'no-cache',
      },
      // referrerPolicy: 'no-referrer', // no-referrer, *client
      // commented out options are due to not being implemented in node-fetch see https://github.com/node-fetch/node-fetch#class-request
    })
    return response.json() // parses JSON response into native JavaScript objects
  }

  async create(url: string) {
    return await this.postData(url)
  }
}
