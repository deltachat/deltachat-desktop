import React from 'react'

type Props = {
  text: string
}

export default function ContentTextSeparator({ text }: Props) {
  return <div className='delta-dialog-content-text-separator'>{text}</div>
}
