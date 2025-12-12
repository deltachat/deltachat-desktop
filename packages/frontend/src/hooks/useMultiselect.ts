import type React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

/**
 * Think of it as `null`, but this ensures that we don't mix it up
 * with the actual `null`, should one appear in the `availableItems` array.
 */
const none = Symbol()

/**
 * Helps implement keyboard (and mouse) -accessible multiselect behavior
 * on an existing widget.
 *
 * This hook is not concerned with how focus is managed
 * (be it arrow keys or something else).
 * But most of the time you want to make sure that focus can be managed
 * with arrow keys (roving tabindex),
 * so that the behavior is aligned with the recommended shortcuts
 * for the [Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).
 *
 * @example
 *
 * ```tsx
 * const itemIds = [1, 2, 3, 4, 5]
 * const [selectedItems, setSelectedItems] = useState(new Set<number>())
 * const multiselect = useMultiselect(itemIds, selectedItems, setSelectedItems)
 * const myOnClick = useCallback((id: number) => {
 *   console.log('Clicked item', id)
 * }, [])
 * return (
 *   <ul
 *     role='listbox' // Or 'tablist' or whatever.
 *     aria-multiselectable={true}
 *   >
 *     {itemIds.map(id => (
 *       <li>
 *         <button
 *           role='option' // Or 'tab' or whatever.
 *           aria-selected={multiselect.selectedItems.has(id)}
 *           className={multiselect.selectedItems.has(id) ? 'selected' : ''}
 *           onClick={event => {
 *             const shouldPreventDefault = multiselect.onClick(event, id)
 *             if (shouldPreventDefault) {
 *               event.preventDefault()
 *               return
 *             }
 *             // The "regular", non-multiselect click action.
 *             myOnClick(id)
 *           }}
 *           onFocus={() => multiselect.onFocus(id)}
 *         >
 *           Item {id}
 *         </button>
 *       </li>
 *     ))}
 *   </ul>
 * )
 * ```
 *
 * This does not provide the most advanced selection behavior,
 * for example, Shift + Click will reset previous selection,
 * which is annoying.
 * But it will work for 95% of user needs.
 *
 * If you are looking for a more thorough library, consider
 * https://react-spectrum.adobe.com/react-aria/selection.html.
 * In particular, see
 * [`useSelectableCollection`](https://github.com/adobe/react-spectrum/blob/e6772602376d9726f2347ff0eb2d379b4cd256a9/packages/%40react-aria/selection/src/useSelectableCollection.ts#L107C17-L323).
 *
 * The items in DOM must be focusable and interactive (e.g. `<button>`s).
 * Interactivity is required because we listen on `click` events
 * as opposed to `keydown` events with `.code === "Space"`,
 * because we support both keyboard and mouse selection.
 *
 * If items are removed from {@link availableItems},
 * they will not be automatically removed from {@link selectedItems}.
 * Make sure to handle this yourself, to avoid confusing behavior
 * where items are selected, but are not visible on the screen.
 *
 * It is also possible to provide {@link selectedItems} Set
 * that includes items which are not a part of {@link availableItems}.
 */
export function useMultiselect<T>(
  /**
   * The ordered list of available options.
   * They must be in the focus order, so that Shift + Click
   * knows the in-between items that need to be marked as selected.
   *
   * It goes without saying that all options must be unique
   * (no option is === to the other), otherwise Shift selection
   * behavior is not defined.
   *
   * This is only used for contiguous selection (Shift + Click).
   */
  availableItems: T[],

  selectedItems: Set<T>,
  /**
   * This is guaranteed to only be invoked synchronously
   * inside the returned `onClick` and `onFocus` functions.
   */
  onSelectionChange: (newSelectedItems: Set<T>) => void,
  logger?: {
    error: (...args: any) => void
  }
) {
  // TODO feat: a way to set initially active item?
  // And to programmatically change it later.
  /**
   * "Activated" is not necessarily "selected",
   * because it could actually have gotten unselected instead,
   * e.g. with Ctrl + Click.
   */
  const lastActivatedItem = useRef<T | typeof none>(none)

  // Put this behind a ref, so that `onFocus` and `onClick`
  // don't have to be recalculated, just for performance.
  const availableItemsRef = useRef(availableItems)
  // eslint-disable-next-line react-hooks/refs
  availableItemsRef.current = availableItems

  const selectedItemsRef = useRef(selectedItems)
  // eslint-disable-next-line react-hooks/refs
  selectedItemsRef.current = selectedItems

  const loggerRef = useRef(logger)
  // eslint-disable-next-line react-hooks/refs
  loggerRef.current = logger

  const toggleItemSelection = useCallback(
    (itemToToggle: T) => {
      const curr = selectedItemsRef.current
      const next = new Set(curr)
      if (curr.has(itemToToggle)) {
        next.delete(itemToToggle)
      } else {
        next.add(itemToToggle)
      }
      onSelectionChange(next)
    },
    [onSelectionChange]
  )
  /**
   * Besides changing selection, this reads and writes `lastActivatedItem`.
   */
  const onSelectContiguous = useCallback(
    (toItem: T) => {
      if (lastActivatedItem.current === none) {
        // Note that in this case Shift + ArrowDown will only select
        // one item, and not 2, as one might expect.
        lastActivatedItem.current = toItem
      }
      const prevLastActivatedItem = lastActivatedItem.current

      // Keep in mind that these can be the same item.
      const from = prevLastActivatedItem
      const to = toItem

      let fromInd = availableItemsRef.current.indexOf(from)
      if (fromInd === -1) {
        // This could happen if `availableItems` got updated
        // such that `prevLastActivatedItem` is no longer a member of it.
        // Maybe there is a more graceful way to handle this.
        onSelectionChange(new Set([from]))
        return
      }
      // `lastIndexOf` is functionally equivalent to `indexOf`
      // given that all items are unique,
      // but this has higher performance when selecting down,
      // which is the most usual case.
      let toInd = availableItemsRef.current.lastIndexOf(to)
      if (toInd === -1) {
        loggerRef.current?.error(
          'useMultiselect: could not make contiguous selection: target item',
          to,
          'is not a member of availableItems',
          availableItemsRef.current
        )
        onSelectionChange(new Set([from]))
      }

      ;[fromInd, toInd] = [Math.min(fromInd, toInd), Math.max(fromInd, toInd)]

      // Yes, we replace the entire selection. Not good.
      // But otherwise it requires a lot more logic, namely
      // contiguous selection should never _un_select items,
      // _except_ when executing sequence
      // Shift + ArrowDown
      // Shift + ArrowUp
      // or
      // Shift + End
      // Shift + Home
      onSelectionChange(
        new Set(
          availableItemsRef.current.slice(
            fromInd,
            // `end` is exclusive, so + 1 to make it inclusive.
            // Yes, this could be out of range, but `Array.slice()` handles it.
            toInd + 1
          )
        )
      )
    },
    [onSelectionChange]
  )

  // Note that these are also present on `MouseEvent` (click),
  // but not on `FocusEvent`. This is why we need to track them here.
  const shiftPressed = useRef(false)
  const ctrlPressed = useRef(false)
  const metaPressed = useRef(false)
  useEffect(() => {
    const onEvent = (ev: KeyboardEvent | MouseEvent) => {
      shiftPressed.current = ev.shiftKey
      ctrlPressed.current = ev.ctrlKey
      metaPressed.current = ev.metaKey
    }
    document.addEventListener('keydown', onEvent, { passive: true })
    document.addEventListener('keyup', onEvent, { passive: true })
    // Also listen on clicks, in case e.g. the user
    // Alt + Tabbed from the window while holding Ctrl or Shift,
    // which would result in us not catching the `keyup` event,
    // resulting in the variable getting stuck on `true`
    // even if the key isn't actually pressed.
    document.addEventListener('click', onEvent, { passive: true })
    return () => {
      document.removeEventListener('keydown', onEvent)
      document.removeEventListener('keyup', onEvent)
      document.removeEventListener('click', onEvent)
    }
  }, [])

  // This handles the "Space" keydown event, as well as clicks.
  const onClick = useCallback(
    (event: React.MouseEvent, item: T): boolean => {
      // Note that we use `event.ctrlKey` and not `ctrlPressed.current`.
      // We could get rid of the `event` argument,
      // but let's not do that, e.g. in case we later actually need it,
      // and also because `event.ctrlKey` is a more reliable
      // "source of truth" than our custom `ctrlPressed` tracking code.
      if (event.ctrlKey || event.metaKey) {
        toggleItemSelection(item)
        lastActivatedItem.current = item
        return true // shouldPreventDefault
      }
      if (event.shiftKey) {
        // TODO perf: when using mouse clicks, we do this twice:
        // once on focus, and once on click.
        onSelectContiguous(item)
        return true // shouldPreventDefault
      }

      onSelectionChange(new Set([item]))
      lastActivatedItem.current = item
      return false
    },
    [onSelectContiguous, onSelectionChange, toggleItemSelection]
  )

  // Handle Shift + ArrowDown, Shift + End.
  const onFocus = useCallback(
    (item: T) => {
      if (shiftPressed.current) {
        onSelectContiguous(item)
      } else {
        if (!(ctrlPressed.current || metaPressed.current)) {
          // This is to make sure that a sequence
          // ArrowDown
          // ArrowDown
          // Shift + ArrowDown
          // selects only two items: the previously focused on
          // and the newly focused one.
          //
          // While this feels better (for me personally),
          // this might be in contradiction with recommendations from
          // https://www.w3.org/WAI/ARIA/apg/patterns/listbox/,
          // thus might be unintuitive for some users.
          // Namely, the fact that ArrowDown (without Shift pressed)
          // changes focus, but does not change selection.
          //
          // So let's comment this out for now, until we implement
          // the "focus changes selection" mode, in which this line
          // will come in handy.
          //
          // lastActivatedItem.current = item
        }
      }
    },
    [onSelectContiguous]
  )

  // `useMemo` to avoid re-renders. Is this a common pattern??
  return useMemo(
    () => ({
      /**
       * It's the {@link selectedItems} argument, unchanged,
       * provided for convenience.
       */
      selectedItems,
      /**
       * This must be invoked when an item is clicked,
       * i.e. on `click` events.
       *
       * It does not matter whether the provided `item` is a member of
       * {@link availableItems}.
       *
       * @returns whether the caller should `preventDefault()`
       * the original event and not execute the regular click action.
       */
      onClick,
      /**
       * This must be invoked when an item is focused,
       * i.e. on `focus` events.
       *
       * It is OK to invoke this with an `item` that is not
       * a member of {@link availableItems}, however, contiguous selection
       * (Shift + ArrowDown) will not work properly then.
       */
      onFocus,
    }),
    [onClick, onFocus, selectedItems]
  )
}
