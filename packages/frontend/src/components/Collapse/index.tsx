import React, { useLayoutEffect, useRef } from 'react'

type Props = React.PropsWithChildren<{
  id?: string
  isOpen: boolean
}>

export default function Collapse({ isOpen = false, children, id }: Props) {
  const content = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!content.current || !wrapper.current) {
      return
    }
    const bounds = content.current.getBoundingClientRect()

    const maxHeight = isOpen ? `${bounds?.height}px` : '0px'
    const translateY = isOpen ? 0 : `-${bounds?.height}px`

    wrapper.current.style.height = maxHeight

    content.current.style.transform = `translate(0px, ${translateY})`

    // hack to support inert while it's not in React types
    // inert makes elements inside non-focusable
    if (isOpen) {
      content.current.removeAttribute('inert')
    } else {
      content.current.setAttribute('inert', 'inert')
    }
  })
  return (
    <div
      ref={wrapper}
      style={{
        overflow: 'hidden',
        transition: 'height 0.5s ease-out',
      }}
      aria-expanded={isOpen}
    >
      <div
        id={id}
        ref={content}
        style={{
          display: 'block',
          transition: 'transform 0.5s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
