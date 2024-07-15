import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'

export async function getConfiguredAccounts(): Promise<T.Account[]> {
  const accounts = await BackendRemote.rpc.getAllAccounts()
  return accounts.filter(account => {
    return account.kind === 'Configured'
  })
}
