import React from 'react'

type ButtonProps = {
  type: 'secondary' | 'primary' | 'danger'
  onClick: any
  round?: boolean
  id?: string
  style?: any
  'aria-label'?: string
}

export default function Button({ type, round, onClick, style, id, ...props}: ButtonProps) {

}
