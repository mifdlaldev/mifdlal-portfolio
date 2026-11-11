/* Worker render hero ASCII (OffscreenCanvas).
 *
 * Semua kerja GPU — field pass, halo blur, komposit — pindah ke thread ini,
 * jadi main thread tidak lagi memblok saat frame lambat (software renderer).
 * Shader dan urutan draw datang dari hero-ascii-core, sama persis dengan jalur
 * main thread.
 */

import {
  FRAME_MS,
  createRenderer,
  uploadAtlas,
  type Renderer,
  type Settings,
} from './hero-ascii-core'

type InitMessage = {
  type: 'init'
  canvas: OffscreenCanvas
  settings: Settings
  ramp: Float32Array
  reduce: boolean
  width: number
  height: number
  ratio: number
  bitmap: ImageBitmap
  count: number
  grid: number[]
}

type AtlasMessage = { type: 'atlas'; bitmap: ImageBitmap; count: number; grid: number[] }
type SizeMessage = { type: 'size'; width: number; height: number; ratio: number }
type VisibleMessage = { type: 'visible'; visible: boolean }

const gl2 = self as unknown as {
  requestAnimationFrame?: (cb: (now: number) => void) => number
  cancelAnimationFrame?: (handle: number) => void
}

const hasRaf = typeof gl2.requestAnimationFrame === 'function'
const schedule = (cb: (now: number) => void): number =>
  hasRaf
    ? gl2.requestAnimationFrame!(cb)
    : (setTimeout(() => cb(performance.now()), FRAME_MS) as unknown as number)
const unschedule = (handle: number) => {
  if (!handle) return
  if (hasRaf) gl2.cancelAnimationFrame!(handle)
  else clearTimeout(handle)
}

let renderer: Renderer | null = null
let raf = 0
let last = 1
let visible = true
let disposed = false

const frame = (now: number) => {
  raf = 0
  if (disposed || !visible || !renderer) return
  // Cap 30fps, sama seperti jalur main thread.
  if (last && now - last < FRAME_MS) {
    raf = schedule(frame)
    return
  }
  last = now
  if (renderer.tick(now)) raf = schedule(frame)
  else last = 0
}

const wake = () => {
  if (!raf && !disposed && visible && renderer) raf = schedule(frame)
}

self.onmessage = async (event: MessageEvent) => {
  const data = event.data as InitMessage | AtlasMessage | SizeMessage | VisibleMessage

  if (data.type === 'init') {
    const message = data as InitMessage
    const gl = message.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) {
      self.postMessage({ type: 'fail' })
      return
    }
    renderer = createRenderer(gl, message.canvas, {
      settings: message.settings,
      ramp: message.ramp,
      reduce: message.reduce,
      atlas: uploadAtlas(gl, message.bitmap, message.count, message.grid),
      width: message.width,
      height: message.height,
      ratio: message.ratio,
    })
    if (!renderer) {
      self.postMessage({ type: 'fail' })
      return
    }
    visible = true
    last = 1
    renderer.reset()
    self.postMessage({ type: 'ready' })
    wake()
    return
  }

  if (!renderer) return

  if (data.type === 'size') {
    const message = data as SizeMessage
    renderer.setSize(message.width, message.height, message.ratio)
    renderer.reset()
    last = 0
    wake()
    return
  }

  if (data.type === 'atlas') {
    const message = data as AtlasMessage
    renderer.setAtlasSource(message.bitmap, message.count, message.grid)
    return
  }

  if (data.type === 'visible') {
    const message = data as VisibleMessage
    visible = message.visible
    if (visible) {
      renderer.reset()
      last = 0
      wake()
    } else {
      unschedule(raf)
      raf = 0
    }
  }
}
