import { BackendRemote } from '../backend-com'

// Copy a file to the blob directory
export async function copyToBlobDir(filepath: string): Promise<string> {
  const acc = await BackendRemote.rpc.getSelectedAccountId()
  if (acc === null) {
    throw Error('No account selected')
  }
  return await BackendRemote.rpc.copyToBlobDir(acc, filepath)
}
