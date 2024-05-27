import React, { useLayoutEffect, useRef } from 'react'

type Props = {
  className?: string
  isOpen: boolean
  children: any
}

export default function Collapse({
  className,
  children,
  isOpen = false,
}: Props) {
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
  })
  return (
    <div
      ref={wrapper}
      style={{
        overflow: 'hidden',
        transition: 'height 0.5s linear',
      }}
    >
      <div
        ref={content}
        className={className}
        style={{
          transition: 'transform 0.5s linear',
        }}
      >
        {children}
      </div>
    </div>
  )
}
