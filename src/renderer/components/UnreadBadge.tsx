import React from 'react'

type UnreadBadgeProps = {
  top: string
  left: string
}

export default function UnreadBadge(props: UnreadBadgeProps) {
  return <div className='unread-badge' style={{ ...props }} />
}
