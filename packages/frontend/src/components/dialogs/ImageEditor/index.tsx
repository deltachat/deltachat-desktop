import React, { useEffect, useMemo, useRef, useState } from 'react'
import Konva from 'konva'
import FilerobotImageEditor from 'react-filerobot-image-editor/lib/components/AssemblyPoint'

import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '@deltachat-desktop/shared/logger'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import { confirmDialog } from '../../message/messageFunctions'

import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.css'

const log = getLogger('renderer/image_editor')

// Filerobot's `assignFinetuneNamesToKonva` reads `Konva` as a global
// instead of importing it.
;(window as any).Konva ??= Konva

// Filerobot only lets users change an arrow's stroke color, not its fill,
// so the arrowhead would keep its initial color. Fill it with the stroke color.
;(Konva.Arrow.prototype as any).getFill = function (this: Konva.Arrow) {
  return this.stroke()
}

// The crop handles are centered on the crop frame. When the frame matches the
// image, which fills the canvas, half of each handle is cut off by the canvas
// edge. Draw them inside the frame instead.
// Filerobot's crop rectangle is the only node with `destination-out`.
function insetCropAnchor(anchor: Konva.Node) {
  const size = anchor.width()
  const name = anchor.name()
  if (name.includes('left')) anchor.offsetX(0)
  if (name.includes('right')) anchor.offsetX(size)
  if (name.includes('top')) anchor.offsetY(0)
  if (name.includes('bottom')) anchor.offsetY(size)
}
const getAnchorStyleFunc = (Konva.Transformer.prototype as any)
  .getAnchorStyleFunc
;(Konva.Transformer.prototype as any).getAnchorStyleFunc = function (
  this: Konva.Transformer
) {
  const styleFunc = getAnchorStyleFunc.call(this)
  const isCropTransformer =
    this.nodes()[0]?.globalCompositeOperation() === 'destination-out'
  return styleFunc ?? (isCropTransformer ? insetCropAnchor : undefined)
}

const ANNOTATION_COLOR = '#e53935'

type SavedImageType = 'png' | 'jpeg' | 'webp'

function savedImageTypeFor(fileName: string): SavedImageType {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg'
    case 'webp':
      return 'webp'
    default:
      return 'png'
  }
}

function stripExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
}

export type EditedImage = {
  /** image file content, base64 encoded */
  base64: string
  fileName: string
}

type Props = {
  /** path of the image file to edit */
  file: string
  fileName: string | null
  onSave: (image: EditedImage) => void
}

export default function ImageEditorDialog({
  file,
  fileName,
  onSave,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  const originalFileName = fileName || file.split(/[\\/]/).pop() || 'image'
  const savedImageType = savedImageTypeFor(originalFileName)
  const savedImageName = stripExtension(originalFileName)

  // Filerobot ships English strings only, override the ones we already
  // have translations for.
  const translations = useMemo(
    () => ({
      save: tx('save'),
      cancel: tx('cancel'),
      back: tx('back'),
      loading: tx('loading'),
      warning: tx('warning'),
      custom: tx('custom'),
      undoTitle: tx('undo'),
      redoTitle: tx('global_menu_edit_redo_desktop'),
      zoomInTitle: tx('menu_zoom_in'),
      zoomOutTitle: tx('menu_zoom_out'),
      resetOperations: tx('reset'),
      confirm: tx('perm_continue'),
    }),
    [tx]
  )

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImage(img)
    img.onerror = () => {
      log.error('Failed to load image for editing', file)
      onClose()
    }
    img.src = runtime.transformBlobURL(file)
  }, [file, onClose])

  // Annotation coordinates are in image pixels, so fixed sizes would be
  // tiny on large photos.
  const shortSide = image
    ? Math.min(image.naturalWidth, image.naturalHeight)
    : 0
  const fontSize = Math.max(16, Math.round(shortSide / 12))
  const strokeWidth = Math.max(2, Math.round(shortSide / 100))

  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previouslyFocused = document.activeElement
    overlayRef.current?.focus()
    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [])

  // Filerobot's close button has no accessible name and doesn't take props.
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) {
      return
    }
    const labelCloseButton = () => {
      overlay
        .querySelectorAll('.FIE_buttons-close-btn:not([aria-label])')
        .forEach(button => button.setAttribute('aria-label', tx('close')))
    }
    labelCloseButton()
    const observer = new MutationObserver(labelCloseButton)
    observer.observe(overlay, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [tx])

  const { openDialog } = useDialog()
  const hasChanges = useRef(false)
  // Remounting the editor with a new key resets it to the original image.
  const [editorKey, setEditorKey] = useState(0)

  // Replaces Filerobot's own "discard changes" and "reset" modals
  // with our dialog.
  const onTopbarButtonClickCapture = async (ev: React.MouseEvent) => {
    if (!(ev.target instanceof Element)) {
      return
    }
    if (ev.target.closest('.FIE_buttons-close-btn')) {
      ev.stopPropagation()
      if (
        !hasChanges.current ||
        (await confirmDialog(
          openDialog,
          tx('discard_changes_question'),
          tx('discard'),
          true
        ))
      ) {
        onClose()
      }
    } else if (ev.target.closest('.FIE_buttons-reset-btn')) {
      ev.stopPropagation()
      if (
        await confirmDialog(
          openDialog,
          tx('reset_changes_question'),
          tx('reset'),
          true
        )
      ) {
        hasChanges.current = false
        setEditorKey(key => key + 1)
      }
    }
  }

  // Not a native modal `<dialog>`: Filerobot's color picker and option
  // popups are portaled into `<body>`, which `showModal()` would make inert
  // and render below the dialog.
  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role='dialog'
      aria-modal='true'
      aria-label={tx('edit_image')}
      tabIndex={-1}
      onClickCapture={onTopbarButtonClickCapture}
    >
      <div className={styles.imageEditor}>
        {image && (
          <FilerobotImageEditor
            key={editorKey}
            source={image}
            // Translations are otherwise fetched from a Scaleflex server.
            useBackendTranslations={false}
            translations={translations}
            tabsIds={['Adjust', 'Annotate', 'Resize']}
            // Without the Image tool: it adds images from URLs or uploads.
            tabsToolsIds={{
              Adjust: ['Crop', 'Rotate', 'Flip_X', 'Flip_Y'],
              Annotate: [
                'Text',
                'Rect',
                'Ellipse',
                'Polygon',
                'Pen',
                'Line',
                'Arrow',
              ],
              Resize: ['Resize'],
            }}
            defaultTabId='Annotate'
            defaultToolId='Pen'
            Text={{ text: '…', fill: ANNOTATION_COLOR, fontSize }}
            Pen={{ stroke: ANNOTATION_COLOR, strokeWidth }}
            Line={{ stroke: ANNOTATION_COLOR, strokeWidth }}
            Arrow={{
              stroke: ANNOTATION_COLOR,
              strokeWidth,
              pointerLength: strokeWidth * 4,
              pointerWidth: strokeWidth * 4,
            }}
            Rect={{
              stroke: ANNOTATION_COLOR,
              fill: 'transparent',
              strokeWidth,
            }}
            Ellipse={{
              stroke: ANNOTATION_COLOR,
              fill: 'transparent',
              strokeWidth,
            }}
            // Filerobot's `beforeunload` handler would block closing
            // or reloading the Electron window.
            avoidChangesNotSavedAlertOnLeave
            // The default (4) would export the image at four times
            // its original resolution.
            savingPixelRatio={1}
            previewPixelRatio={window.devicePixelRatio || 1}
            defaultSavedImageName={savedImageName}
            defaultSavedImageType={savedImageType}
            // Skip Filerobot's "save as" dialog (file name, format, quality).
            onBeforeSave={() => false}
            onSave={savedImageData => {
              const { imageBase64, extension } = savedImageData
              if (!imageBase64) {
                log.error('Image editor returned no image data')
                return
              }
              onSave({
                base64: imageBase64.split(';base64,')[1],
                fileName: `${savedImageName}.${extension === 'jpeg' ? 'jpg' : extension}`,
              })
              onClose()
            }}
            onModify={() => {
              hasChanges.current = true
            }}
            onClose={() => onClose()}
          />
        )}
      </div>
    </div>
  )
}
