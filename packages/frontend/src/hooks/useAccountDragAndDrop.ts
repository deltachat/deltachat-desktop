import { useState } from 'react'
import { BackendRemote } from '../backend-com'
import { useRpcFetch } from './useFetch'

export interface DropIndicator {
  index: number
  position: 'top' | 'bottom'
}

export interface UseAccountDragAndDropReturn {
  draggedAccountId: number | null
  dropIndicator: DropIndicator | null
  handleDragStart: (accountId: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDragLeave: () => void
  handleDragEnd: () => void
  handleDrop: (e: React.DragEvent) => void
}

export function useAccountDragAndDrop(
  accountsFetch: NonNullable<ReturnType<typeof useRpcFetch>> & {
    lingeringResult:
      | { ok: true; value: number[] }
      | { ok: false; err: unknown }
      | null
  }
): UseAccountDragAndDropReturn {
  // Drag and drop state
  const [draggedAccountId, setDraggedAccountId] = useState<number | null>(null)
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null)

  const handleDragStart = (accountId: number) => {
    setDraggedAccountId(accountId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedAccountId === null) return

    const target = e.currentTarget as HTMLDivElement
    const rect = target.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom'

    setDropIndicator({ index, position })
  }

  const handleDragLeave = () => {
    setDropIndicator(null)
  }

  const handleDragEnd = () => {
    setDraggedAccountId(null)
    setDropIndicator(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    if (draggedAccountId === null || dropIndicator === null) return

    const accounts =
      accountsFetch.lingeringResult?.ok === true
        ? accountsFetch.lingeringResult.value
        : null
    if (!accounts || !Array.isArray(accounts)) return

    const dragIndex = accounts.indexOf(draggedAccountId)
    const dropIndex = dropIndicator.index

    if (dragIndex === -1 || dragIndex === dropIndex) {
      // If dropping on itself, check position to maybe move it one slot.
      if (
        dragIndex === dropIndex &&
        ((dropIndicator.position === 'top' && dragIndex > 0) ||
          (dropIndicator.position === 'bottom' &&
            dragIndex < accounts.length - 1))
      ) {
        // This case is handled by dropping on the adjacent item, so we can ignore it.
      } else {
        setDraggedAccountId(null)
        setDropIndicator(null)
        return
      }
    }

    // Create new array with reordered accounts
    const newAccounts = [...accounts]
    const [removed] = newAccounts.splice(dragIndex, 1)

    let targetIndex = dropIndex
    if (dragIndex < dropIndex) {
      targetIndex--
    }

    if (dropIndicator.position === 'bottom') {
      targetIndex++
    }

    newAccounts.splice(targetIndex, 0, removed)

    try {
      // Update backend with new order
      BackendRemote.rpc.setAccountsOrder(newAccounts).then(() => {
        // Refresh to get the updated order from backend
        accountsFetch.refresh()
      })
    } catch (_error) {
      // Revert on error
      accountsFetch.refresh()
    }

    setDraggedAccountId(null)
    setDropIndicator(null)
  }

  return {
    draggedAccountId,
    dropIndicator,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  }
}
