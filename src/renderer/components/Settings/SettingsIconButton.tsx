import React from 'react'

export default function SettingsIconButton(props: any) {
  const { onClick, iconName, children, isLink, ...otherProps } = props
  return (
    <div className='SettingsIconButton' onClick={onClick}>
      <div
        className='Icon'
        style={{
          WebkitMask:
            'url(../images/icons/' + iconName + '.svg) no-repeat center',
        }}
      ></div>
      <button {...otherProps}>{children}</button>
      {isLink && (
        <div
          className='Icon'
          style={{
            WebkitMask: 'url(../images/icons/open_in_new.svg) no-repeat center',
          }}
        ></div>
      )}
    </div>
  )
}
