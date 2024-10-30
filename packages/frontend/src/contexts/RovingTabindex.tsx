import { getLogger } from '@deltachat-desktop/shared/logger'
import React, {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  // useEffect,
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
 *
 * @param elementId any value to identify this element among others when using
 * with `setActiveElement`.
 * `null` must not be used - it's a special value.
 */
export function useRovingTabindex(elementId?: unknown) {
  const defaultId = useRef(Symbol())
  if (elementId === undefined) {
    elementId = defaultId
  }

  const context = useContext(RovingTabindexContext)

  // const unsetAsActiveElement = context.unsetAsActiveElement
  // useEffect(() => {
  //   return () => unsetAsActiveElement(elementId)
  //   // TODO fix: this is not gonna work because `unsetAsActiveElement`
  //   // changes every time we set a different active element.
  // }, [])
  // const unsetAsActiveElement = context.unsetAsActiveElement

  // useEffect(() => {
  //   if (context.activeElementId !== elementId) {
  //     return
  //   }
  //   return () => {
  //     // unsetAsActiveElement(elementId)
  //     context.setActiveElement(null)
  //   }
  // }, [context, context.activeElementId, elementId])

  // const mounted = useRef<boolean>(true)
  const unsetAsActiveTimeoutId = useRef<number>(-1)
  useEffect(() => {
    clearTimeout(unsetAsActiveTimeoutId.current)

    if (context.activeElementId !== elementId) {
      return
    }

    // A bit of a hack to unset the element as active when
    // the component gets unmounted.
    return () => {
      unsetAsActiveTimeoutId.current = window.setTimeout(() => {
        if (context.activeElementId === elementId) {
          context.setActiveElement(null)
        }
      })
    }
  }, [context, elementId])

  const tabIndex: 0 | -1 =
    // If the active element has not been chosen yet,
    // let' keep the default behavior (tabindex="0")
    context.activeElementId == null || context.activeElementId === elementId
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
    setAsActiveElement: () => context.setActiveElement(elementId),
    activeElementId: context.activeElementId,
  }
}

const log = getLogger('contexts/RovingTabindex')

type ContextValue = {
  activeElementId: unknown | null
  onKeydown: (event: React.KeyboardEvent) => void
  setActiveElement: (elementId: unknown | null) => void
  // unsetAsActiveElement: (elementId: unknown) => void
}

type ProviderProps = PropsWithChildren<{
  /**
   * An element that wraps all the elements that we need the roving tabindex
   * behavior applied to them within this UI widget.
   */
  wrapperElementRef: RefObject<HTMLElement>
  /**
   * All elements that will utilize roving tabindex must have this
   * class name set.
   * @default 'roving-tabindex'
   */
  classNameOfTargetElements?: string
}>

export const RovingTabindexContext = createContext<ContextValue>({
  activeElementId: null,
  onKeydown: () => {},
  setActiveElement: () => {},
  // unsetAsActiveElement: () => {},
})

/** @see {@link useRovingTabindex} */
export function RovingTabindexProvider({
  children,
  wrapperElementRef,
  classNameOfTargetElements,
}: ProviderProps) {
  if (classNameOfTargetElements == undefined) {
    classNameOfTargetElements = 'roving-tabindex'
  }

  const [activeElementId, setActiveElementId] = useState<unknown | null>(null)

  // // Ensure that the "active" element is actually in DOM,
  // // because it's the only one that is keyboard focusable.
  // // Otherwise it's impossible to focus the widget by pressing "Tab".
  // // If it's not in DOM, we need to either set another element
  // // as the active one, or `setActiveElement(null)` to make
  // // all the elements focusable.
  // //
  // // FYI instead of using a `MutationObserver` we could probaby have
  // // utilized React's "unmount" callback (i.e. `useEffect`'s cleanup function),
  // // but I failed at it.
  // // Let's keep things vanilla then I guess.
  // useEffect(() => {
  //   if (activeElementId == null) {
  //     return
  //   }

  //   const observer = new MutationObserver(_mutations => {
  //     if (!document.body.contains(activeElementId)) {
  //       // Another option is to select the next/closest element
  //       // as the new active one.
  //       setActiveElementId(null)
  //     }
  //   })
  //   // Maybe we could observe `wrapperElementRef` for performance,
  //   // but IDK let's play it safe.
  //   observer.observe(document.body, { childList: true, subtree: true })
  //   return () => observer.disconnect()
  // }, [activeElementId])

  // const unsetAsActiveElement = (elementId: unknown) => {
  //   if (activeElementId === elementId) {
  //     setActiveElementId(null)
  //   }
  // }

  const onKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!wrapperElementRef.current) {
        log.warn(
          'Received keydown event, but there is no wrapperElement? How?',
          activeElementId
        )
        return
      }
      // TODO now that we utilize `document.activeElement`
      // (or `event.target`?) to find the currently active element,
      // do we even need to access `activeElementId`
      // in `onKeydown` at all?
      if (activeElementId === null) {
        // This could happen either after the initial render,
        // or if the active element was removed from DOM.
        // Let's just wait for the user to focus another element
        // (and thus set `activeElement`).
        return
      }

      const keyCode = event.code
      if (keyCode !== 'ArrowDown' && keyCode !== 'ArrowUp') {
        return
      }

      // This is mainly to prevent the scroll that usually happens by default
      // when you press an arrow key,
      // but it might have other benefits.
      event.preventDefault()

      // TODO perf: `getElementsByClassName` returns a live range.
      // Perhaps we could cache it so as to not re-make it on every key press.
      const eligibleElements = wrapperElementRef.current.getElementsByClassName(
        classNameOfTargetElements
      )

      let oldActiveElementInd: number | undefined
      for (let i = 0; i < eligibleElements.length; i++) {
        const eligibleEl = eligibleElements[i]


        // TODO maybe utilize `event.target` instead?
        // When would it be beneficial?
        // Well, I guess we wouldn't have to check `eligibleEl.contains()`.
        // Is that all?
        //
        // I think `document.activeElement` just makes more sense,
        // because this entire "library" is about managing focus.
        if (
          eligibleEl === document.activeElement ||
          // Also check `contains()` because we must support the active element
          // having interactive children, which might be focused.
          // TODO or should we? In
          // https://github.com/deltachat/deltachat-desktop/pull/4376
          // and
          // https://github.com/deltachat/deltachat-desktop/pull/4294
          // we raise a point that videos and audios actually
          // utilize arrow keys, and we must not switch focus
          // if all the user is trying to do is change volume...
          //
          // But at least in WhatsApp arrow keys switch between messages
          // even when an element inside a message is focused
          // (not the message itself).
          eligibleEl.contains(document.activeElement)
        ) {
          oldActiveElementInd = i
          break
        }
      }
      if (oldActiveElementInd == undefined) {
        log.warn(
          'Could not find the currently active element in DOM',
          activeElementId
        )
        return
      }

      const newActiveElement =
        eligibleElements[
          oldActiveElementInd + (keyCode === 'ArrowDown' ? 1 : -1)
        ]
      // `newActiveElement` could be `undefined` if the active element is either
      // the last or the first.
      if (newActiveElement != undefined) {
        const newActiveElement_ = newActiveElement as HTMLElement

        // Here we could `setActiveElementId()`, but we don't know its ID.
        // However, things will still work out fine because
        // after we `newActiveElement_.focus()`,
        // it will fire the onFocus event,
        // which should invoke `setAsActiveElement`
        // (as long as the user attached the event listeners properly).

        // It is fine to `.focus()` here without wating for a render
        // or `useEffect`, because elements with `tabindex="-1"`
        // are still programmatically focusable.
        newActiveElement_.focus()
      }
    },
    [activeElementId, classNameOfTargetElements, wrapperElementRef]
  )

  return (
    <RovingTabindexContext.Provider
      value={{
        activeElementId,
        onKeydown,
        setActiveElement: setActiveElementId,
        // unsetAsActiveElement,
      }}
    >
      {children}
    </RovingTabindexContext.Provider>
  )
}
