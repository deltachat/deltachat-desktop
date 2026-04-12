import React, { CSSProperties } from 'react'
import useTranslationFunction from '../hooks/useTranslationFunction'

export function InlineVerifiedIcon({ style }: { style?: CSSProperties }) {
  const tx = useTranslationFunction()
  return (
    <img
      className='verified-icon'
      src='./images/verified.svg'
      style={style}
      alt={tx('verified_by_unknown')}
    />
  )
}
