import { getLogger } from '@deltachat-desktop/shared/logger'
import React, {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Helps implement a keyboard-accessible UI widget such that
 * there is only one tab-stop in the entire widget,
 * even if there are multiple interactive (focusable) elements
 * within the widget itself (such as, say, a long list of chats).
 * Implements [the "roving tabindex" approach](
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex
 * ).
 *
 * You may apply this to disabled elements (such as buttons),
 * but they will be excluded from the list, as with regular Tab
 * behavior.
 * Exercise caution when dealing with otherwise non-focusable elements,
 * such as `display: none`, hidden.
 *
 * It is OK to use this outside of `RovingTabindexContext`.
 * In this case it will simply always return `tabIndex === 0`.
 *
 * This is similar to https://www.npmjs.com/package/react-roving-tabindex, but
 * - it handles elements changing their order in DOM:
 *   'ArrowDown' will always focus the element that is next in DOM,
 *   the same way as pressing Tab would,
 *   regardless of where the element was on the initial render.
 * - it handles elements getting removed from DOM, without `.focus()`ing
 *   another element when the previously active one gets removed.
 * - it's possible that there is no "active" element at all,
 *   e.g. upon initialization.
 *   Then `tabindex` is 0 for all the components,
 *   until `setAsActiveElement` is called explicitly.
 * - lacks "Home", "End" key handling, and some other features.
 */
export function useRovingTabindex(elementRef: RefObject<HTMLElement | null>) {
  const context = useContext(RovingTabindexContext)

  const tabIndex: 0 | -1 =
    // If the active element has not been chosen yet,
    // let' keep the default behavior (tabindex="0")
    context.activeElement == null ||
    // eslint-disable-next-line react-hooks/refs
    context.activeElement === elementRef.current
      ? 0
      : -1

  return {
    tabIndex: tabIndex,
    onKeydown: context.onKeydown,

    // TODO make sure it is easy for the caller to select
    // the initial active element (e.g. the currently selected chat).
    // Maybe it already is.
    // Or perhaps a provide a way to just set the first one in DOM
    // as the active one.
    /**
     * Sets `elementRef.current` as the one who will have tabindex="0",
     * and sets tabindex="-1" for all the other ones within this context.
     * It is recommended to `setAsActiveElement` when it gets focused
     * (`onFocus={setAsActiveElement}`), e.g. when it gets focused
     * with a mouse click, see
     * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#usage_of_focus_events:
     * > Don't assume that all focus changes will come via key and mouse events:
     * > assistive technologies such as screen readers
     * > can set the focus to any focusable element.
     */
    // `elementRef.current` could be null, I am not sure
    // if this means something to us practically.
    setAsActiveElement: () => context.setActiveElement(elementRef.current),
    activeElement: context.activeElement,
    /**
     * The target elements must have this class name set.
     * It's the same value that is provided to
     * {@link ProviderProps.classNameOfTargetElements}.
     */
    className: context.classNameOfTargetElements,
  }
}

const log = getLogger('contexts/RovingTabindex')

type ContextValue = {
  activeElement: HTMLElement | null
  onKeydown: (event: React.KeyboardEvent) => void
  setActiveElement: (element: HTMLElement | null) => void
  classNameOfTargetElements: string
}

type ProviderProps = PropsWithChildren<{
  /**
   * An element that wraps all the elements that we need the roving tabindex
   * behavior applied to them within this UI widget.
   */
  wrapperElementRef: RefObject<HTMLDivElement | HTMLElement | null>
  /**
   * All elements that will utilize roving tabindex must have this
   * class name set.
   * @default 'roving-tabindex'
   */
  classNameOfTargetElements?: string
  /**
   * 'both' will handle both ArrowUp/Down and ArrowLeft/Right.
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal' | 'both'
}>

export const RovingTabindexContext = createContext<ContextValue>({
  activeElement: null,
  onKeydown: () => {},
  setActiveElement: () => {},
  classNameOfTargetElements: 'roving-tabindex',
})

/** @see {@link useRovingTabindex} */
export function RovingTabindexProvider({
  children,
  wrapperElementRef,
  classNameOfTargetElements,
  direction,
}: ProviderProps) {
  if (classNameOfTargetElements == undefined) {
    classNameOfTargetElements = 'roving-tabindex'
  }
  if (direction == undefined) {
    direction = 'vertical'
  }

  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null)

  // Ensure that the "active" element is actually in DOM,
  // because it's the only one that is keyboard focusable.
  // Otherwise it's impossible to focus the widget by pressing "Tab".
  // If it's not in DOM, we need to either set another element
  // as the active one, or `setActiveElement(null)` to make
  // all the elements focusable.
  //
  // FYI instead of using a `MutationObserver` we could probaby have
  // utilized React's "unmount" callback (i.e. `useEffect`'s cleanup function),
  // but I failed at it.
  // Let's keep things vanilla then I guess.
  useEffect(() => {
    if (activeElement == null) {
      return
    }

    const observer = new MutationObserver(_mutations => {
      if (!document.body.contains(activeElement)) {
        // Another option is to select the next/closest element
        // as the new active one.
        setActiveElement(null)
      }
    })
    // Maybe we could observe `wrapperElementRef` for performance,
    // but IDK let's play it safe.
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [activeElement])

  const onKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!wrapperElementRef.current) {
        log.warn(
          'Received keydown event, but there is no wrapperElement? How?',
          activeElement
        )
        return
      }
      if (!activeElement) {
        // This could happen either after the initial render,
        // or if the active element was removed from DOM.
        // Let's just wait for the user to focus another element
        // (and thus set `activeElement`).
        return
      }

      const indexChange: -1 | 1 | 'first' | 'last' | undefined =
        indexChangeTable[direction][event.code]
      if (indexChange == undefined) {
        return
      }

      // This is mainly to prevent the scroll that usually happens by default
      // when you press an arrow key,
      // but it might have other benefits.
      event.preventDefault()

      // `:not(:disabled)` ensures that the element
      // is actually focusable.
      // Otherwise we'd attempt to `.focus()`, but this won't work,
      // and the user will get stuck.
      //
      // This does _not_ cover all cases of unfocusable elements,
      // e.g. `display: none;` See e.g.
      // https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
      const eligibleElements = wrapperElementRef.current.querySelectorAll(
        `.${classNameOfTargetElements}:not(:disabled)`
      )

      let newActiveElement: Element
      if (indexChange === 'first') {
        newActiveElement = eligibleElements[0]
      } else if (indexChange === 'last') {
        newActiveElement = eligibleElements[eligibleElements.length - 1]
      } else {
        let oldActiveElementInd: number | undefined
        for (let i = 0; i < eligibleElements.length; i++) {
          const eligibleEl = eligibleElements[i]
          if (eligibleEl === activeElement) {
            oldActiveElementInd = i
            break
          }
        }
        if (oldActiveElementInd == undefined) {
          log.warn(
            'Could not find the currently active element in DOM',
            activeElement
          )
          return
        }

        newActiveElement = eligibleElements[oldActiveElementInd + indexChange]
        // `newActiveElement` could be `undefined` if the active element
        // is either the last or the first.
        if (newActiveElement == undefined) {
          return
        }
      }

      const newActiveElement_ = newActiveElement as HTMLElement
      setActiveElement(newActiveElement_)
      // It is fine to `.focus()` here without wating for a render
      // or `useEffect`, because elements with `tabindex="-1"`
      // are still programmatically focusable.
      newActiveElement_.focus()

      // See above, about whether the element is focusable.
      if (document.activeElement !== newActiveElement_) {
        log.error(
          'Tried to focus element but it did not get focused.\n' +
            'You might want to explude this element ' +
            'from the roving tabindex widget:',
          newActiveElement_
        )
      }
    },
    [activeElement, classNameOfTargetElements, direction, wrapperElementRef]
  )

  return (
    <RovingTabindexContext.Provider
      value={{
        activeElement,
        onKeydown,
        setActiveElement,
        classNameOfTargetElements,
      }}
    >
      {children}
    </RovingTabindexContext.Provider>
  )
}

type IndexChange = -1 | 1 | 'first' | 'last'
const indexChangeTable = {
  vertical: {
    Home: 'first',
    End: 'last',
    ArrowUp: -1,
    ArrowDown: 1,
  } as { [key: string]: IndexChange },
  horizontal: {
    Home: 'first',
    End: 'last',
    ArrowLeft: -1,
    ArrowRight: 1,
  } as { [key: string]: IndexChange },
  both: {
    Home: 'first',
    End: 'last',
    ArrowUp: -1,
    ArrowLeft: -1,
    ArrowDown: 1,
    ArrowRight: 1,
  } as { [key: string]: IndexChange },
} as const
