import React, { useRef } from 'react'
import { basename } from 'path'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { runtime } from '@deltachat-desktop/runtime-interface'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useContextMenu from '../../hooks/useContextMenu'

import type { DialogProps } from '../../contexts/DialogContext'
import Dialog from '../Dialog'
import { IconButton } from '../Icon'

export default function FullscreenAvatar(
  props: { imagePath: string } & DialogProps
) {
  const tx = useTranslationFunction()
  const { onClose, imagePath } = props

  const resetImageZoom = useRef<(() => void) | null>(
    null
  ) as React.MutableRefObject<(() => void) | null>

  const saveAs = () => {
    runtime.downloadFile(imagePath, basename(imagePath))
  }

  const openMenu = useContextMenu([
    {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(imagePath)
      },
    },
    {
      label: tx('save_as'),
      action: saveAs,
    },
  ])

  return (
    <Dialog unstyled onClose={onClose}>
      <div className='attachment-view'>
        <div className='image-container'>
          <TransformWrapper initialScale={1}>
            {utils => {
              resetImageZoom.current = () => {
                utils.resetTransform()
              }
              return (
                <TransformComponent>
                  <div
                    className='image-context-menu-container'
                    onContextMenu={openMenu}
                    tabIndex={0}
                  >
                    <img src={runtime.transformBlobURL(imagePath)} />
                  </div>
                </TransformComponent>
              )
            }}
          </TransformWrapper>
        </div>
      </div>
      <div className='btn-wrapper no-drag'>
        <IconButton
          onClick={saveAs}
          icon='download'
          size={32}
          coloring='fullscreenControls'
          aria-label={tx('save')}
        />
        <IconButton
          onClick={onClose}
          icon='cross'
          size={32}
          coloring='fullscreenControls'
          aria-label={tx('close')}
        />
      </div>
    </Dialog>
  )
}
