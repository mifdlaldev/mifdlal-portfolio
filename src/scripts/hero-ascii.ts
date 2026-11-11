/* Host hero ASCII untuk main thread.
 *
 * Latar belakang performa: shader hero dieksekusi di GPU. Di lingkungan tanpa
 * GPU nyata (headless, VM, mesin yang jatuh ke SwiftShader/llvmpipe) setiap
 * frame memblok main thread ratusan milidetik, dan karena loop-nya 30fps terus
 * menerus, main thread tidak pernah tenang: TBT Lighthouse meledak.
 *
 * Karena itu jalur utama melempar seluruh render ke Web Worker lewat
 * OffscreenCanvas. Main thread hanya membangun tekstur atlas glyph satu kali
 * lalu mengirim ukuran saat resize. Perilaku visual tidak berubah: shader,
 * ukuran kanvas, dan cap 30fps sama persis, hanya thread-nya berbeda.
 *
 * Kalau browser tidak punya OffscreenCanvas + transferControlToOffscreen,
 * atau worker gagal start, render turun ke jalur inline (main thread) persis
 * seperti versi sebelumnya. Tidak ada perbedaan hasil gambar di antara keduanya.
 */

import {
  ATLAS_CELL_H,
  ATLAS_CELL_W,
  ATLAS_COLUMNS,
  CLICK_EFFECTS,
  DEFAULT_CHARACTERS,
  DEFAULT_FONT,
  FONT_SCALE,
  FRAME_MS,
  MAX_COLORS,
  SHAPES,
  clamp,
  createRenderer,
  toLab,
  uploadAtlas,
  type HeroAsciiOptions,
  type Renderer,
  type Settings,
} from './hero-ascii-core'

type AtlasPaint = { canvas: HTMLCanvasElement; count: number; grid: number[] }

const GL_ATTRS: WebGLContextAttributes = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
  stencil: false,
}

/* Glyph digambar ke kanvas 2D sekali, lalu diunggah sebagai satu tekstur.
 * Di worker tidak ada dokumen, jadi teksturnya dikirim sebagai ImageBitmap. */
const paintAtlas = (characters: string, fontFamily: string): AtlasPaint => {
  const list = [...new Set([...characters].filter((char) => char !== '\n' && char !== '\r'))]
  if (!list.length) list.push(' ')
  const font = `300 ${Math.round(ATLAS_CELL_H * FONT_SCALE)}px ${fontFamily}`
  const columns = Math.min(ATLAS_COLUMNS, list.length)
  const rows = Math.ceil(list.length / columns)
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_CELL_W * columns
  canvas.height = ATLAS_CELL_H * rows
  const context = canvas.getContext('2d')
  if (context) {
    context.font = font
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#fff' // literal teknis: tekstur glyph, bukan warna palet
    list.forEach((char, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      context.fillText(
        char,
        column * ATLAS_CELL_W + ATLAS_CELL_W / 2,
        row * ATLAS_CELL_H + ATLAS_CELL_H / 2 + 3
      )
    })
  }
  return { canvas, count: list.length, grid: [columns, rows] }
}

const resolveSettings = (options: HeroAsciiOptions): Settings => {
  const {
    shape = 'horizon',
    characters = DEFAULT_CHARACTERS,
    cellSize = 18,
    colors,
    density = 0.8,
    glyphOpacity = 0.85,
    glow = 0.2,
    depthOfField = 0,
    flicker = 0.2,
    softness = 0.5,
    scale = 1,
    flow = 0.5,
    speed = 1,
    gradientOpacity = 0.9,
    grain = 0.08,
    variation = 0,
    mouseInteraction = true,
    scrambleRadius = 0.1,
    clickEffect = 'wave',
    intro = true,
    lightMode = false,
    fontFamily = DEFAULT_FONT,
    dpr,
  } = options

  /* Warna boleh datang sebagai var(--token) supaya palet hanya hidup di CSS. */
  const resolve = (c: string) => {
    const m = c.match(/^var\((--[\w-]+)\)$/)
    if (!m) return c
    const v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim()
    return v || c
  }
  const palette = (
    Array.isArray(colors) && colors.length ? colors : ['var(--electric)', 'var(--ink-900)']
  )
    .map(resolve)
    .slice(0, MAX_COLORS)

  return {
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],
    shape: SHAPES[shape] ?? 0,
    characters: characters || DEFAULT_CHARACTERS,
    cellSize: clamp(cellSize, 6, 64),
    density: clamp(density, 0, 1),
    glyphOpacity: clamp(glyphOpacity, 0, 1),
    glow: clamp(glow, 0, 2),
    depthOfField: clamp(depthOfField, 0, 1),
    flicker: clamp(flicker, 0, 1),
    softness: clamp(softness, 0, 1),
    scale: clamp(scale, 0.4, 2.5),
    flow: clamp(flow, 0, 2),
    speed: Math.max(0, speed),
    gradientOpacity: clamp(gradientOpacity, 0, 1),
    grain: clamp(grain, 0, 0.4),
    variation: Math.max(0, variation),
    mouseInteraction,
    scrambleRadius: clamp(scrambleRadius, 0.02, 0.4),
    clickEffect: CLICK_EFFECTS[clickEffect] ?? 1,
    intro,
    lightMode,
    fontFamily: fontFamily || DEFAULT_FONT,
    dpr,
  }
}

const buildRamp = (colors: string[]) => {
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const cache = new Map<string, number[]>()
  const parse = (value: string): number[] => {
    const key = String(value)
    const cached = cache.get(key)
    if (cached) return cached
    let rgb: number[] = [0, 0, 0]
    if (probe) {
      probe.clearRect(0, 0, 1, 1)
      probe.fillStyle = '#000000' // literal teknis: kanvas probe 1x1, tidak terlihat
      probe.fillStyle = key
      probe.fillRect(0, 0, 1, 1)
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
      rgb = [r / 255, g / 255, b / 255]
    }
    cache.set(key, rgb)
    return rgb
  }
  const ramp = new Float32Array(MAX_COLORS * 3)
  colors.forEach((color, i) => ramp.set(toLab(parse(color)), i * 3))
  return ramp
}

const ratioNow = (settings: Settings) => Math.min(settings.dpr || window.devicePixelRatio || 1, 1.5)

/* Jalur cadangan: render di main thread. Identik dengan perilaku versi React. */
const mountInline = (
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  settings: Settings,
  ramp: Float32Array,
  reduce: boolean
) => {
  const gl = canvas.getContext('webgl2', GL_ATTRS)
  if (!gl) return
  const paint = paintAtlas(settings.characters, settings.fontFamily)
  const renderer = createRenderer(gl, canvas, {
    settings,
    ramp,
    reduce,
    atlas: uploadAtlas(gl, paint.canvas, paint.count, paint.grid),
    width: container.clientWidth,
    height: container.clientHeight,
    ratio: ratioNow(settings),
  })
  if (!renderer) return

  let raf = 0
  let visible = true
  let last = 0
  let disposed = false

  const frame = (now: number) => {
    raf = 0
    if (disposed || !visible || document.hidden) return
    // Cap 30fps: animasi dekoratif tidak butuh 60fps.
    if (last && now - last < FRAME_MS) {
      raf = requestAnimationFrame(frame)
      return
    }
    last = now
    if (renderer.tick(now)) raf = requestAnimationFrame(frame)
    else last = 0
  }

  const wake = () => {
    if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame)
  }

  const locate = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    const x = (event.clientX - rect.left) / Math.max(1, rect.width)
    const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height)
    const aspect = rect.width / Math.max(1, rect.height)
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
    return { x: (x - 0.5) * aspect, y: y - 0.5, inside }
  }

  const onPointerMove = (event: PointerEvent) => {
    const point = locate(event)
    renderer.feedMove(point.x, point.y, point.inside)
    if (settings.mouseInteraction && !reduce) wake()
  }

  const onPointerDown = (event: PointerEvent) => {
    const point = locate(event)
    renderer.feedDown(point.x, point.y, point.inside)
    if (settings.clickEffect && !reduce) wake()
  }

  const onVisibility = () => {
    renderer.reset()
    last = 0
    wake()
  }

  const resize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight, ratioNow(settings))
    renderer.reset()
    last = 0
    wake()
  }

  new ResizeObserver(resize).observe(container)
  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
    if (visible) {
      renderer.reset()
      last = 0
      wake()
    }
  }).observe(container)
  if (settings.mouseInteraction) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
  }
  if (settings.clickEffect) {
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
  }
  document.addEventListener('visibilitychange', onVisibility)

  document.fonts?.load?.(`300 64px ${settings.fontFamily}`, settings.characters).then(
    () => {
      if (disposed) return
      const next = paintAtlas(settings.characters, settings.fontFamily)
      renderer.setAtlas(uploadAtlas(gl, next.canvas, next.count, next.grid))
    },
    () => {}
  )

  resize()
}

/* Jalur utama: render di worker. Main thread hanya kirim ukuran + atlas. */
const mountWorker = async (
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  settings: Settings,
  ramp: Float32Array,
  reduce: boolean
): Promise<void> => {
  const paint = paintAtlas(settings.characters, settings.fontFamily)
  const bitmap = await createImageBitmap(paint.canvas)

  const offscreen = canvas.transferControlToOffscreen()
  const worker = new Worker(new URL('./hero-ascii.worker.ts', import.meta.url), {
    type: 'module',
  })

  let ready = false
  let ratio = ratioNow(settings)

  const post = (message: unknown, transfer: Transferable[] = []) =>
    worker.postMessage(message, transfer)

  const fail = () => {
    if (ready) return
    ready = true
    worker.terminate()
    /* Kontrol kanvas sudah pindah ke worker dan tidak bisa ditarik kembali,
     * jadi pasang kanvas baru lalu render di main thread. */
    const replacement = canvas.cloneNode() as HTMLCanvasElement
    canvas.replaceWith(replacement)
    mountInline(container, replacement, settings, ramp, reduce)
  }

  worker.onerror = fail
  worker.onmessage = (event: MessageEvent) => {
    const data = event.data as { type?: string }
    if (data?.type === 'ready') ready = true
    if (data?.type === 'fail') fail()
  }

  post(
    {
      type: 'init',
      canvas: offscreen,
      settings,
      ramp,
      reduce,
      width: container.clientWidth,
      height: container.clientHeight,
      ratio,
      bitmap,
      count: paint.count,
      grid: paint.grid,
    },
    [offscreen, bitmap]
  )

  new ResizeObserver(() => {
    ratio = ratioNow(settings)
    post({ type: 'size', width: container.clientWidth, height: container.clientHeight, ratio })
  }).observe(container)

  new IntersectionObserver((entries) => {
    post({ type: 'visible', visible: entries.some((entry) => entry.isIntersecting) })
  }).observe(container)

  document.addEventListener('visibilitychange', () => {
    post({ type: 'visible', visible: !document.hidden })
  })

  document.fonts?.load?.(`300 64px ${settings.fontFamily}`, settings.characters).then(
    async () => {
      const next = paintAtlas(settings.characters, settings.fontFamily)
      const updated = await createImageBitmap(next.canvas)
      post({ type: 'atlas', bitmap: updated, count: next.count, grid: next.grid }, [updated])
    },
    () => {}
  )
}

export function mountHeroAscii(
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  options: HeroAsciiOptions = {}
) {
  const settings = resolveSettings(options)
  const ramp = buildRamp(settings.colors)
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const canOffscreen =
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    'transferControlToOffscreen' in canvas

  if (canOffscreen) {
    mountWorker(container, canvas, settings, ramp, reduce).catch(() => {
      const replacement = canvas.cloneNode() as HTMLCanvasElement
      canvas.replaceWith(replacement)
      mountInline(container, replacement, settings, ramp, reduce)
    })
    return
  }
  mountInline(container, canvas, settings, ramp, reduce)
}
