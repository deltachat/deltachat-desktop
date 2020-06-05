import React, { useState, useRef, useEffect, useContext } from 'react'
import { AvatarBubble, AvatarImage } from '../contact/Contact'
import { ChatListItemType } from '../../../shared/shared-types'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import { ScreenContext } from '../../contexts'

export const GroupImage = (props: {
  groupImage: string
  onSetGroupImage: (event: React.SyntheticEvent) => void
  onUnsetGroupImage: (event: React.SyntheticEvent) => void
  style?: React.CSSProperties
}) => {
  const tx = window.translate
  const { groupImage, onSetGroupImage, onUnsetGroupImage, style } = props
  const realOpenContextMenu = useRef(null)

  const { openDialog } = useContext(ScreenContext)

  const showAvatarFullscreen = () =>
    openDialog('FullscreenMedia', {
      msg: {
        attachment: {
          url: groupImage,
          contentType: 'image/x',
        },
        file: groupImage,
      },
    })

  return (
    <div className='group-image-wrapper'>
      {groupImage && (
        <AvatarImage
          avatarPath={groupImage}
          onClick={showAvatarFullscreen}
          style={{ ...style, cursor: 'pointer' }}
          large={true}
        />
      )}
      {!groupImage && (
        <AvatarBubble style={style} large>
          G
        </AvatarBubble>
      )}
      <div
        className='group-image-edit-button'
        onClick={ev => realOpenContextMenu?.current(ev)}
        aria-label={tx('a11y_change_group_image')}
      >
        <div />
      </div>
      <GroupImageContextMenu
        hasGroupImage={!!groupImage}
        {...{ onSetGroupImage, onUnsetGroupImage }}
        getShow={show => {
          realOpenContextMenu.current = show
        }}
      />
    </div>
  )
}

const GroupImageContextMenu = (props: {
  hasGroupImage: boolean
  onSetGroupImage: (event: React.SyntheticEvent) => void
  onUnsetGroupImage: (event: React.SyntheticEvent) => void
  getShow: (cb: (event: MouseEvent, chat: ChatListItemType) => void) => void
}) => {
  const tx = window.translate
  const [showEvent, setShowEvent] = useState(null)
  const contextMenu = useRef(null)

  const show = (event: MouseEvent) => {
    // no log.debug, because passing the event object to through ipc freezes the application
    // console.debug('ChatListContextMenu.show', chat, event) // also commented out because it's not needed

    /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
    event.preventDefault()
    event.stopPropagation()
    const position = { x: event.clientX, y: event.clientY }
    const ev = { detail: { id: 'group-image', position } }
    setShowEvent(ev)
  }

  useEffect(() => {
    props.getShow(show)
  }, [])
  useEffect(() => {
    if (showEvent) contextMenu.current.handleShow(showEvent)
  }, [showEvent])

  const reset = () => {
    setShowEvent(null)
  }

  return (
    <ContextMenu id='group-image' ref={contextMenu} onHide={reset}>
      <MenuItem onClick={props.onSetGroupImage} key='set'>
        {tx('set_group_avatar')}
      </MenuItem>
      {props.hasGroupImage && (
        <MenuItem onClick={props.onUnsetGroupImage} key='unset'>
          {tx('remove_group_avatar')}
        </MenuItem>
      )}
    </ContextMenu>
  )
}
