import type DeltaChatController from './deltachat/controller'

export let onInitialized: (val: DeltaChatController['jsonrpcRemote']) => void
export const DCJsonrpcRemoteInitializedP = new Promise<
  DeltaChatController['jsonrpcRemote']
>(r => (onInitialized = r))
