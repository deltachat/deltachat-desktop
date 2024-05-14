import React, { useRef, useLayoutEffect } from 'react'

import { dirname } from 'path'

import { runtime } from '../../runtime'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
  FooterActionButton,
} from '../Dialog'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'

import styles from './styles.module.scss'

export default function ProfileImageCropper({
  setProfilePicture,
  filepath,
  shape,
  onClose,
  onCancel,
  targetWidth,
  targetHeight = targetWidth,
}: {
  setProfilePicture: (path: string) => void
  filepath: string
  shape: string
  onClose: () => void
  onCancel: () => void
  targetWidth: number
  targetHeight: number
}) {
  const tx = useTranslationFunction()
  const { setLastPath } = rememberLastUsedPath(LastUsedSlot.ProfileImage)

  // cut pattern from the full image
  const cutImage = useRef<HTMLImageElement>(null)
  // full image in background
  const fullImage = useRef<HTMLImageElement>(null)
  // semi-transparent layer to fade the full image
  const shade = useRef<HTMLImageElement>(null)
  // a wrapper inside which we drag an image
  const container = useRef<HTMLImageElement>(null)

  const dragging = useRef<boolean>(false)
  // where we start dragging
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  // center of the cut region
  const posX = useRef<number>(0)
  const posY = useRef<number>(0)

  const speedMultiplier = 2
  const zoom = useRef<number>(1.0)
  const initialZoom = useRef<number>(1.0)

  const onSubmit = () => {
    if (!fullImage.current) {
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d', {
      willReadFrequently: false,
    }) as CanvasRenderingContext2D
    context.imageSmoothingEnabled = false

    const imgW = fullImage.current.clientWidth
    const imgH = fullImage.current.clientHeight

    context.drawImage(
      fullImage.current as CanvasImageSource,
      posX.current - (targetWidth / zoom.current - imgW) / 2,
      posY.current - (targetHeight / zoom.current - imgH) / 2,
      targetWidth / zoom.current,
      targetHeight / zoom.current,
      0,
      0,
      targetWidth,
      targetHeight
    )
    ;(async () => {
      const tempfilename = `profile_pic_${Date.now()}.png`
      const tempfilepath = await runtime.writeTempFileFromBase64(
        tempfilename,
        canvas.toDataURL('image/png').split(';base64,')[1]
      )

      setLastPath(dirname(filepath))
      setProfilePicture(tempfilepath)
      onClose()
    })()
  }

  const onZoomReset = () => {
    posX.current = 0
    posY.current = 0
    zoom.current = initialZoom.current
    moveImages(0, 0)
  }

  const makeSelector = (x: number, y: number) => {
    const hw = targetWidth / zoom.current / 2
    const hh = targetHeight / zoom.current / 2
    if (shape === 'circle') {
      return `circle(${hw}px at ${x}px ${y}px)`
    } else {
      return (
        'rect(' +
        (y - hh) +
        'px ' +
        (x + wh) +
        'px ' +
        (y + hh) +
        'px ' +
        (x - wh) +
        'px)'
      )
    }
  }

  const setupImages = () => {
    if (!fullImage.current || !container.current) {
      return
    }

    container.current.style.transform =
      'scale(' +
      Math.min(
        container.current?.clientWidth / targetWidth,
        container.current?.clientHeight / targetHeight
      ) +
      ')'
    initialZoom.current = zoom.current = Math.min(
      targetWidth / fullImage.current.clientWidth,
      targetHeight / fullImage.current.clientHeight
    )
    posX.current = 0
    posY.current = 0

    moveImages(0, 0)
  }

  // returns new position after clamping
  const moveImages = (x: number, y: number) => {
    if (!cutImage.current || !fullImage.current || !container.current) {
      return [x, y]
    }

    const imgW = fullImage.current.clientWidth
    const imgH = fullImage.current.clientHeight
    const ctxW = container.current.clientWidth
    const ctxH = container.current.clientHeight

    zoom.current = Math.min(
      imgW / targetWidth,
      imgH / targetHeight,
      Math.max(targetWidth / imgW, targetHeight / imgH, zoom.current)
    )

    const nX = Math.max(
      Math.min((imgW - targetWidth / zoom.current) / 2, x),
      (targetWidth / zoom.current - imgW) / 2
    )
    const nY = Math.max(
      Math.min((imgH - targetHeight / zoom.current) / 2, y),
      (targetHeight / zoom.current - imgH) / 2
    )

    cutImage.current.style.clipPath = makeSelector(imgW / 2 + nX, imgH / 2 + nY)

    const imgX = (ctxW - imgW) / 2 - nX * zoom.current
    const imgY = (ctxH - imgH) / 2 - nY * zoom.current

    const transformValue = `translate(${imgX}px, ${imgY}px) scale(${zoom.current})`

    cutImage.current.style.transform = transformValue
    fullImage.current.style.transform = transformValue

    return [nX, nY]
  }

  useLayoutEffect(() => {
    const onMouseDown = (ev: MouseEvent) => {
      ev.preventDefault()

      dragging.current = true

      startX.current = ev.clientX
      startY.current = ev.clientY
    }

    const onMouseUp = (ev: MouseEvent) => {
      ev.preventDefault()

      dragging.current = false

      // we never go faster with zoom above 1, but we speed up zoomed-out (below 1) by inverting the zoom value
      const zoomSpeed = Math.min(
        speedMultiplier / zoom.current,
        speedMultiplier
      )

      ;[posX.current, posY.current] = moveImages(
        posX.current - (ev.clientX - startX.current) * zoomSpeed,
        posY.current - (ev.clientY - startY.current) * zoomSpeed
      )
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) {
        return
      }

      // we never go faster with zoom above 1, but we speed up zoomed-out (below 1) by inverting the zoom value
      const zoomSpeed = Math.min(
        speedMultiplier / zoom.current,
        speedMultiplier
      )

      moveImages(
        posX.current - (ev.clientX - startX.current) * zoomSpeed,
        posY.current - (ev.clientY - startY.current) * zoomSpeed
      )
    }

    const onZoom = (ev: WheelEvent) => {
      const absDelta = Math.abs(ev.deltaY)
      // NOTE(maxph): I'm not sure about this, but there are many sources stating that 'wheel' delta on touchpad is smaller (somewhere like 50 vs 100 at maximum)
      // so here we treat small delta as not a mouse wheel and zoom in different direction
      const dir = absDelta < 50 ? 1 : -1
      const normDelta = Math.min(8, absDelta)
      zoom.current *= 1 + (dir * Math.sign(ev.deltaY) * normDelta) / 100
      const [x, y] = moveImages(posX.current, posY.current)
      posX.current = x
      posY.current = y
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('wheel', onZoom)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('wheel', onZoom)
    }
  })
  return (
    <Dialog canEscapeKeyClose onClose={onClose} canOutsideClickClose={false}>
      <DialogHeader title={tx('crop_image')} />
      <DialogBody className={styles.imageCropperDialogBody}>
        <DialogContent className={styles.imageCropperDialogContent}>
          <div ref={container} className={styles.imageCropperContainer}>
            <div ref={shade} className={styles.imageCropperShade}></div>
            <img
              ref={cutImage}
              className={styles.imageCropperCutImage}
              src={filepath}
              onLoad={setupImages}
            />
            <img
              ref={fullImage}
              className={styles.imageCropperFullImage}
              src={filepath}
            />
          </div>
          <div className={styles.imageCropperHint}>
            {tx('image_cropper_hint_desktop')}
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton
            onClick={() => {
              onCancel()
              onClose()
            }}
          >
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton onClick={onZoomReset}>
            {tx('reset')}
          </FooterActionButton>
          <FooterActionButton onClick={onSubmit}>
            {tx('save')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
