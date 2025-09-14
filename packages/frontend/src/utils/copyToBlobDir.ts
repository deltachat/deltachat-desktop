import { BackendRemote } from '../backend-com'

/*
 * Copy the file from `filepath` to the blob directory and create a blob.
 * Throws an error if no account is selected.
 */
export async function copyToBlobDir(filepath: string): Promise<string> {
  const acc = await BackendRemote.rpc.getSelectedAccountId()
  if (acc === null) {
    throw Error('No account selected')
  }
  return await BackendRemote.rpc.copyToBlobDir(acc, filepath)
}
