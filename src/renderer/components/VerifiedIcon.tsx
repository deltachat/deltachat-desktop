import React, { CSSProperties } from 'react'

export function InlineVerifiedIcon({ style }: { style?: CSSProperties }) {
  return (
    <img className='verified-icon' src='../images/verified.png' style={style} />
  )
}
