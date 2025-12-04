import React, { useRef, useLayoutEffect } from 'react'

import { dirname } from 'path'

import { runtime } from '@deltachat-desktop/runtime-interface'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
  FooterActionButton,
} from '../Dialog'

import Icon from '../Icon'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import styles from './styles.module.scss'
import { copyToBlobDir } from '../../utils/copyToBlobDir'

// Implementation notes:
// * CSS-transforms for picking, canvas API to actually cut the result
//
// * since we're using transform-origin we don't need to multiply any coordinate by current zoom value
//   the only thing we need zoom value for is to adjust targetWidth/targetHeight and scale the image
//
// * coordinate system for cursor position doesn't change, we just change the input,
//   cursor (0, 0) is always at the top-left corner of non-rotated image
//
// * on export we just cut the bounding box (targetWidth, targetHeight) around cursor position and rotate/flip it
export default function ImageCropper({
  filepath,
  shape,
  onResult,
  onClose,
  onCancel,
  desiredWidth,
  desiredHeight = desiredWidth,
}: {
  filepath: string
  shape: string
  onResult: (path: string) => void
  onClose: () => void
  onCancel: () => void
  desiredWidth: number
  desiredHeight: number
}) {
  const tx = useTranslationFunction()
  const rememberLastUsedPathPromise = rememberLastUsedPath(
    LastUsedSlot.ProfileImage
  )

  const transformed = runtime.transformBlobURL(filepath)
  // cut pattern from the full image
  const cutImage = useRef<HTMLImageElement>(null)
  // full image in background
  const fullImage = useRef<HTMLImageElement>(null)
  // semi-transparent layer to fade the full image
  const shade = useRef<HTMLImageElement>(null)
  // a wrapper inside which we drag an image
  const container = useRef<HTMLImageElement>(null)
  // a temporary canvas for rotation and result output
  // so we don't create a new canvas element on each operation
  const tmpCanvas = useRef<HTMLCanvasElement>(null)

  const dragging = useRef<boolean>(false)
  // where we start dragging
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  // center of the cut region
  const posX = useRef<number>(0)
  const posY = useRef<number>(0)

  // multiplier to flip direction on X or Y
  type FlipDir = -1 | 1
  const flipDirX = useRef<FlipDir>(1)
  const flipDirY = useRef<FlipDir>(1)

  const targetWidth = useRef<number>(desiredWidth)
  const targetHeight = useRef<number>(desiredHeight)

  const containerScale = useRef<number>(1.0)
  const zoom = useRef<number>(1.0)
  const initialZoom = useRef<number>(1.0)
  /** we use degrees for simple comparision check */
  const rotation = useRef<number>(0)

  const onSubmit = async () => {
    if (!fullImage.current) {
      return
    }

    const canvas = tmpCanvas.current

    if (!canvas) {
      return
    }

    const resultW = targetWidth.current / zoom.current
    const resultH = targetHeight.current / zoom.current
    canvas.width = targetWidth.current
    canvas.height = targetHeight.current

    const context = canvas.getContext('2d', {
      willReadFrequently: false,
    }) as CanvasRenderingContext2D

    context.imageSmoothingEnabled = false

    context.translate(canvas.width / 2, canvas.height / 2)
    context.rotate((rotation.current * Math.PI) / 180)
    // to flip we need not only negative width or height in drawImage
    // but also a context scale
    context.scale(flipDirX.current, flipDirY.current)
    context.drawImage(
      fullImage.current as CanvasImageSource,
      posX.current - Math.floor(resultW / 2) * flipDirX.current,
      posY.current - Math.floor(resultW / 2) * flipDirY.current,
      // negative values flip the image
      resultW * flipDirX.current,
      resultH * flipDirY.current,
      canvas.width / -2,
      canvas.height / -2,
      canvas.width,
      canvas.height
    )

    const tempfilename = `profile_pic_${Date.now()}.png`
    const tempfilepath = await runtime.writeTempFileFromBase64(
      tempfilename,
      canvas.toDataURL('image/png').split(';base64,')[1]
    )

    rememberLastUsedPathPromise.then(({ setLastPath }) =>
      setLastPath(dirname(filepath))
    )
    const blob_path = await copyToBlobDir(tempfilepath)
    onResult(blob_path)
    onClose()
  }

  const onFlipX = () => {
    if (rotation.current === 90 || rotation.current === 270) {
      flipDirY.current = flipDirY.current === 1 ? -1 : 1
    } else {
      flipDirX.current = flipDirX.current === 1 ? -1 : 1
    }
    moveImages(posX.current, posY.current)
  }

  const onZoomIn = () => {
    zoom.current += 0.01
    moveImages(posX.current, posY.current)
  }

  const onZoomOut = () => {
    zoom.current -= 0.01
    moveImages(posX.current, posY.current)
  }

  const onReset = () => {
    if (!cutImage.current || !fullImage.current) {
      return
    }
    posX.current = fullImage.current.clientWidth / 2
    posY.current = fullImage.current.clientHeight / 2
    zoom.current = initialZoom.current
    flipDirX.current = 1
    flipDirY.current = 1
    rotation.current = 0
    moveImages(0, 0)
  }

  const onRotateImages = () => {
    rotation.current = Math.round(rotation.current + 90)

    if (rotation.current >= 360) {
      rotation.current = 0
    }

    ;[targetWidth.current, targetHeight.current] = [
      targetHeight.current,
      targetWidth.current,
    ]
    ;[flipDirX.current, flipDirY.current] = [flipDirY.current, flipDirX.current]

    moveImages(posX.current, posY.current)
  }

  const setupImages = () => {
    if (!fullImage.current || !container.current) {
      return
    }

    const imgW = fullImage.current.clientWidth
    const imgH = fullImage.current.clientHeight

    if (imgW < desiredWidth || imgH < desiredHeight) {
      targetWidth.current = Math.min(imgW, desiredWidth)
      targetHeight.current = Math.min(imgH, desiredHeight)

      if (desiredWidth === desiredHeight) {
        targetWidth.current = targetHeight.current = Math.min(
          targetWidth.current,
          targetHeight.current
        )
      }
    }

    containerScale.current = Math.min(
      container.current?.clientWidth / targetWidth.current,
      container.current?.clientHeight / targetHeight.current
    )

    container.current.style.transform = `scale(${containerScale.current})`
    initialZoom.current = zoom.current = Math.min(
      targetWidth.current / imgW,
      targetHeight.current / imgH
    )
    posX.current = imgW / 2
    posY.current = imgH / 2

    moveImages(posX.current, posY.current)
  }

  const makeSelector = (x: number, y: number) => {
    const hw = targetWidth.current / zoom.current / 2
    const hh = targetHeight.current / zoom.current / 2
    if (shape === 'circle') {
      return `circle(${hw}px at ${x}px ${y}px)`
    } else {
      return (
        'rect(' +
        (y - hh) +
        'px ' +
        (x + hw) +
        'px ' +
        (y + hh) +
        'px ' +
        (x - hw) +
        'px)'
      )
    }
  }

  // returns new position after clamping
  const moveImages = (x: number, y: number) => {
    if (!cutImage.current || !fullImage.current || !container.current) {
      return [x, y]
    }

    const imgW = fullImage.current.clientWidth
    const imgH = fullImage.current.clientHeight

    zoom.current = Math.min(
      imgW / targetWidth.current,
      imgH / targetHeight.current,
      Math.max(
        targetWidth.current / imgW,
        targetHeight.current / imgH,
        zoom.current
      )
    )

    // clamp cursor position
    const nX = Math.max(
      Math.min(imgW - targetWidth.current / zoom.current / 2, x),
      targetWidth.current / zoom.current / 2
    )
    const nY = Math.max(
      Math.min(imgH - targetHeight.current / zoom.current / 2, y),
      targetHeight.current / zoom.current / 2
    )

    cutImage.current.style.clipPath = makeSelector(nX, nY)

    // we rotate and scale around cursor
    const transformOriginValue = `${nX}px ${nY}px`

    // now we compensate for origin with -nX, -nY, rotate and scale
    const imgX = container.current.clientWidth / 2 - nX
    const imgY = container.current.clientHeight / 2 - nY
    const transformValue = `translate(${imgX}px, ${imgY}px) rotate(${
      rotation.current
    }deg) scale(${zoom.current * flipDirX.current}, ${
      zoom.current * flipDirY.current
    })`

    cutImage.current.style.transform = transformValue
    fullImage.current.style.transform = transformValue
    cutImage.current.style.transformOrigin = transformOriginValue
    fullImage.current.style.transformOrigin = transformOriginValue

    return [nX, nY]
  }

  // (x, y) is the point, (px, py) is the pivot
  const rotate = (
    x: number,
    y: number,
    angle: number,
    px: number = 0,
    py: number = 0
  ) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    x -= px
    y -= py
    return [cos * x - sin * y + px, sin * x + cos * y + py]
  }

  useLayoutEffect(() => {
    const onMouseDown = (ev: MouseEvent) => {
      ev.preventDefault()

      dragging.current = true
      ;[startX.current, startY.current] = rotate(
        ev.clientX,
        ev.clientY,
        -(rotation.current * Math.PI) / 180,
        window.innerWidth / 2,
        window.innerHeight / 2
      )
    }

    const handleMouseCoords = (ev: MouseEvent) => {
      const [dx, dy] = rotate(
        ev.clientX,
        ev.clientY,
        -(rotation.current * Math.PI) / 180,
        window.innerWidth / 2,
        window.innerHeight / 2
      )

      return [dx - startX.current, dy - startY.current]
    }

    const onMouseUp = (ev: MouseEvent) => {
      ev.preventDefault()

      dragging.current = false

      const [dx, dy] = handleMouseCoords(ev)
      const scaleFactor = zoom.current * containerScale.current

      // we update position only when mouse movement stops
      ;[posX.current, posY.current] = moveImages(
        posX.current - (dx * flipDirX.current) / scaleFactor,
        posY.current - (dy * flipDirY.current) / scaleFactor
      )
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) {
        return
      }

      const [dx, dy] = handleMouseCoords(ev)
      const scaleFactor = zoom.current * containerScale.current

      moveImages(
        posX.current - (dx * flipDirX.current) / scaleFactor,
        posY.current - (dy * flipDirY.current) / scaleFactor
      )
    }

    const onZoom = (ev: WheelEvent) => {
      const absDelta = Math.abs(ev.deltaY)
      // NOTE(maxph): I'm not sure about this, but there are many sources stating that 'wheel' delta on touchpad is smaller (somewhere like 50 vs 100 at maximum)
      // so here we treat small delta as not a mouse wheel and zoom in different direction
      let dir = absDelta < 50 ? 1 : -1
      const { isMac } = runtime.getRuntimeInfo()
      if (isMac) {
        // on macOS it seems we have to invert zoom direction
        dir *= -1
      }
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
      <DialogHeader title={tx('ImageEditorHud_crop')} />
      <DialogBody>
        <DialogContent className={styles.imageCropperDialogContent}>
          <div ref={container} className={styles.imageCropperContainer}>
            <div ref={shade} className={styles.imageCropperShade}></div>
            <img
              ref={cutImage}
              className={styles.imageCropperCutImage}
              src={transformed}
              onLoad={setupImages}
              crossOrigin='anonymous'
            />
            <img
              ref={fullImage}
              className={styles.imageCropperFullImage}
              src={transformed}
              crossOrigin='anonymous'
            />
          </div>
          <div className={styles.imageCropperControls}>
            <button
              type='button'
              className={styles.imageCropperControlsButton}
              onClick={onZoomIn}
              aria-label={tx('menu_zoom_in')}
            >
              <Icon coloring='navbar' icon='plus' size={18} />
            </button>
            <button
              type='button'
              className={styles.imageCropperControlsButton}
              onClick={onZoomOut}
              aria-label={tx('menu_zoom_out')}
            >
              <Icon coloring='navbar' icon='minus' size={18} />
            </button>
            <button
              type='button'
              className={styles.imageCropperControlsButton}
              onClick={onRotateImages}
              aria-label={tx('ImageEditorHud_rotate')}
            >
              <Icon coloring='navbar' icon='rotate-right' size={24} />
            </button>
            <button
              type='button'
              className={styles.imageCropperControlsButton}
              onClick={onFlipX}
              aria-label={tx('ImageEditorHud_flip')}
            >
              <Icon coloring='navbar' icon='swap_hor' size={24} />
            </button>
          </div>
          <canvas ref={tmpCanvas} style={{ display: 'none' }}></canvas>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={onReset} aria-label={tx('reset')}>
            {tx('reset')}
          </FooterActionButton>
          <FooterActions>
            <FooterActionButton
              onClick={() => {
                onCancel()
                onClose()
              }}
            >
              {tx('cancel')}
            </FooterActionButton>
            <FooterActionButton onClick={onSubmit}>
              {tx('save')}
            </FooterActionButton>
          </FooterActions>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
