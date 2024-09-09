import { useContext } from 'react'

import { ContextMenuContext } from '../contexts/ContextMenuContext'
import { makeContextMenu } from '../components/ContextMenu'

import type {
  ContextMenuItems,
  ContextMenuItemsFactoryFn,
} from '../components/ContextMenu'

export default function useContextMenu(
  itemsOrItemsFactoryFn: ContextMenuItems | ContextMenuItemsFactoryFn
) {
  const { openContextMenu } = useContext(ContextMenuContext)
  return makeContextMenu(itemsOrItemsFactoryFn, openContextMenu)
}
