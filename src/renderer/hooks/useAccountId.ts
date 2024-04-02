import useAccount from './useAccount'

export default function useAccountId(): number {
  const { accountId } = useAccount()

  if (!accountId) {
    throw new Error('Expected defined accountId at this point')
  }

  return accountId
}
