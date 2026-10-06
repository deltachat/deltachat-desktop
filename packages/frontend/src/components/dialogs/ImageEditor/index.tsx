import React, { useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import FilerobotImageEditor from 'react-filerobot-image-editor/lib/components/AssemblyPoint'

import Dialog from '../../Dialog'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '@deltachat-desktop/shared/logger'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.css'

const log = getLogger('renderer/image_editor')

// Filerobot's `assignFinetuneNamesToKonva` reads `Konva` as a global
// instead of importing it.
;(window as any).Konva ??= Konva

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

  return (
    <Dialog
      unstyled
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      allowDefaultFocus
    >
      <div className={styles.imageEditor}>
        {image && (
          <FilerobotImageEditor
            source={image}
            // Translations are otherwise fetched from a Scaleflex server.
            useBackendTranslations={false}
            translations={translations}
            tabsIds={['Adjust', 'Annotate', 'Resize']}
            defaultTabId='Annotate'
            defaultToolId='Pen'
            Text={{ text: '…', fill: ANNOTATION_COLOR, fontSize }}
            Pen={{ stroke: ANNOTATION_COLOR, strokeWidth }}
            Line={{ stroke: ANNOTATION_COLOR, strokeWidth }}
            Arrow={{
              stroke: ANNOTATION_COLOR,
              fill: ANNOTATION_COLOR,
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
            Image={{ disableUpload: true }}
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
            onClose={() => onClose()}
          />
        )}
      </div>
    </Dialog>
  )
}
