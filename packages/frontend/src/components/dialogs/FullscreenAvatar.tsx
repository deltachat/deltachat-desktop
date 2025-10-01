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

  const resetImageZoom = useRef<(() => void) | null>(null) as React.RefObject<
    (() => void) | null
  >

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
      label: tx('menu_export_attachment'),
      action: saveAs,
    },
  ])

  return (
    <Dialog unstyled onClose={onClose}>
      <div className='attachment-view'>
        <div className='image-container'>
          <TransformWrapper
            initialScale={1}
            wheel={{
              wheelDisabled: true,
            }}
            panning={{
              wheelPanning: true,
            }}
          >
            {utils => {
              resetImageZoom.current = () => {
                utils.resetTransform()
              }
              return (
                <TransformComponent
                  wrapperStyle={{
                    maxWidth: '100%',
                    maxHeight: '100vh',
                  }}
                  contentStyle={{
                    padding: '0',
                  }}
                >
                  <div
                    className='image-context-menu-container'
                    onContextMenu={openMenu}
                    aria-haspopup='menu'
                    tabIndex={0}
                  >
                    <img
                      // Otherwise it's 'inline' and the parent gets
                      // stretched a few pixels taller than the image itself,
                      // resulting in the image overflowing the window.
                      // See https://github.com/deltachat/deltachat-desktop/issues/4320
                      style={{ display: 'block' }}
                      src={runtime.transformBlobURL(imagePath)}
                      height={600}
                    />
                  </div>
                </TransformComponent>
              )
            }}
          </TransformWrapper>
        </div>
      </div>
      <div data-no-drag-region className='btn-wrapper'>
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
