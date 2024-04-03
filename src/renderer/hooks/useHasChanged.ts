import usePrevious from './usePrevious'

export default function useHasChanged(val: any) {
  const prevVal = usePrevious(val)
  return prevVal !== val
}
