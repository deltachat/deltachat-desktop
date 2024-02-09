import React, { useRef } from 'react'
import { basename } from 'path'
import { Icon, Overlay } from '@blueprintjs/core'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { runtime } from '../../runtime'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useContextMenu from '../../hooks/useContextMenu'

import type { DialogProps } from '../../contexts/DialogContext'

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
    <Overlay isOpen={true} className='attachment-overlay' onClose={onClose}>
      <div className='render-media-wrapper' tabIndex={0}>
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
                    >
                      <img src={runtime.transformBlobURL(imagePath)} />
                    </div>
                  </TransformComponent>
                )
              }}
            </TransformWrapper>
          </div>
        </div>
        <div className='btn-wrapper'>
          <div
            role='button'
            onClick={saveAs}
            className='download-btn'
            aria-label={tx('save')}
          />
          <Icon
            onClick={onClose}
            icon='cross'
            size={32}
            color={'grey'}
            aria-label={tx('close')}
          />
        </div>
      </div>
    </Overlay>
  )
}
