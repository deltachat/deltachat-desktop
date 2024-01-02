import React from 'react'

import type { CSSProperties } from 'react'

export function InlineVerifiedIcon({ style }: { style?: CSSProperties }) {
  return (
    <img className='verified-icon' src='../images/verified.svg' style={style} />
  )
}
