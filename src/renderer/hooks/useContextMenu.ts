import { useContext } from 'react'

import { makeContextMenu } from '../components/ContextMenu'
import { ContextMenuContext } from '../contexts/ContextMenuContext'

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
