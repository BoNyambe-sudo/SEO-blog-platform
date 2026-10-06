import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../static')
mkdirSync(outDir, { recursive: true })

const crcTable = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function makeRenderer(w, h, ss) {
  const W = w * ss
  const H = h * ss
  const buf = new Float32Array(W * H * 4)
  return {
    W,
    H,
    ss,
    buf,
    clear(r, g, b, a = 255) {
      for (let i = 0; i < buf.length; i += 4) {
        buf[i] = r
        buf[i + 1] = g
        buf[i + 2] = b
        buf[i + 3] = a
      }
    },
    paint(fn) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const c = fn(x, y)
          if (!c) continue
          const i = (y * W + x) * 4
          const sa = c[3] / 255
          const da = buf[i + 3] / 255
          const out = sa + da * (1 - sa)
          if (out <= 0) continue
          buf[i] = (c[0] * sa + buf[i] * da * (1 - sa)) / out
          buf[i + 1] = (c[1] * sa + buf[i + 1] * da * (1 - sa)) / out
          buf[i + 2] = (c[2] * sa + buf[i + 2] * da * (1 - sa)) / out
          buf[i + 3] = out * 255
        }
      }
    },
    toRGBA() {
      const out = Buffer.alloc(w * h * 4)
      const n = ss * ss
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let r = 0
          let g = 0
          let b = 0
          let a = 0
          for (let dy = 0; dy < ss; dy++) {
            for (let dx = 0; dx < ss; dx++) {
              const i = ((y * ss + dy) * W + (x * ss + dx)) * 4
              r += buf[i]
              g += buf[i + 1]
              b += buf[i + 2]
              a += buf[i + 3]
            }
          }
          const o = (y * w + x) * 4
          out[o] = r / n
          out[o + 1] = g / n
          out[o + 2] = b / n
          out[o + 3] = a / n
        }
      }
      return out
    },
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function withAlpha(rgb, a) {
  return [rgb[0], rgb[1], rgb[2], a * 255]
}

function circleFn(cx, cy, r, color, stroke = 0) {
  return (x, y) => {
    const d = Math.hypot(x - cx, y - cy)
    if (stroke > 0) {
      return Math.abs(d - r) <= stroke / 2 ? color : null
    }
    return d <= r ? color : null
  }
}

function lineFn(x1, y1, x2, y2, width, color) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  return (x, y) => {
    let t = ((x - x1) * dx + (y - y1) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const px = x1 + t * dx
    const py = y1 + t * dy
    return Math.hypot(x - px, y - py) <= width / 2 ? color : null
  }
}

function inRoundedRect(x, y, x0, y0, w, h, r) {
  if (x < x0 || x > x0 + w || y < y0 || y > y0 + h) return false
  if (x >= x0 + r && x <= x0 + w - r) return true
  if (y >= y0 + r && y <= y0 + h - r) return true
  const corners = [
    [x0 + r, y0 + r],
    [x0 + w - r, y0 + r],
    [x0 + r, y0 + h - r],
    [x0 + w - r, y0 + h - r],
  ]
  return corners.some(([cx, cy]) => Math.hypot(x - cx, y - cy) <= r)
}

function combine(...fns) {
  return (x, y) => {
    for (const fn of fns) {
      const c = fn(x, y)
      if (c) return c
    }
    return null
  }
}

function magnifierMark(cx, cy, ringR, ringW, handleLen, handleW, color) {
  const diag = Math.SQRT1_2
  const startX = cx + diag * ringR
  const startY = cy + diag * ringR
  const endX = cx + diag * (ringR + handleLen)
  const endY = cy + diag * (ringR + handleLen)
  return combine(
    circleFn(cx, cy, ringR, color, ringW),
    lineFn(startX, startY, endX, endY, handleW, color),
  )
}

function verticalGradient(_w, h, top, bottom) {
  const [tr, tg, tb] = hexToRgb(top)
  const [br, bg, bb] = hexToRgb(bottom)
  return (_x, y) => {
    const t = h === 0 ? 0 : y / (h - 1)
    return [
      tr + (br - tr) * t,
      tg + (bg - tg) * t,
      tb + (bb - tb) * t,
      255,
    ]
  }
}

function radialGlow(cx, cy, radius, rgb, maxAlpha) {
  return (x, y) => {
    const d = Math.hypot(x - cx, y - cy)
    if (d >= radius) return null
    const t = 1 - d / radius
    const a = maxAlpha * t * t
    return [rgb[0], rgb[1], rgb[2], a * 255]
  }
}

function renderIcon(size, ss) {
  const r = makeRenderer(size, size, ss)
  const grad = verticalGradient(size, size, '#0e7490', '#0891b2')
  const radius = size * 0.22
  r.paint((x, y) => (inRoundedRect(x, y, 0, 0, size, size, radius) ? grad(x, y) : null))
  const white = [255, 255, 255, 255]
  r.paint(
    magnifierMark(
      size * 0.42,
      size * 0.42,
      size * 0.21,
      size * 0.085,
      size * 0.2,
      size * 0.095,
      white,
    ),
  )
  return r.toRGBA()
}

function renderAppleTouchIcon(size, ss) {
  const r = makeRenderer(size, size, ss)
  const grad = verticalGradient(size, size, '#0b5a66', '#0e7490')
  r.paint((x, y) => (inRoundedRect(x, y, 0, 0, size, size, size * 0.22) ? grad(x, y) : null))
  r.paint(radialGlow(size * 0.85, size * 0.1, size * 0.9, hexToRgb('#67e8f9'), 0.22))
  const white = [255, 255, 255, 255]
  r.paint(
    magnifierMark(
      size * 0.42,
      size * 0.42,
      size * 0.21,
      size * 0.085,
      size * 0.2,
      size * 0.095,
      white,
    ),
  )
  return r.toRGBA()
}

function renderOG(width, height, ss) {
  const r = makeRenderer(width, height, ss)
  r.paint(verticalGradient(width, height, '#03242b', '#0b5563'))
  r.paint(radialGlow(width * 0.88, height * 0.08, width * 0.55, hexToRgb('#22d3ee'), 0.16))
  r.paint(radialGlow(width * 0.05, height * 0.95, width * 0.5, hexToRgb('#0e7490'), 0.25))
  const ringColor = withAlpha(hexToRgb('#67e8f9'), 0.14)
  r.paint(circleFn(width * 0.5, height * 0.52, height * 0.62, ringColor, 3))
  r.paint(circleFn(width * 0.5, height * 0.52, height * 0.44, ringColor, 2))
  const tileSize = height * 0.62
  const tx = width * 0.5 - tileSize / 2
  const ty = height * 0.52 - tileSize / 2
  const tileGrad = (_x, y) => {
    const t = (y - ty) / tileSize
    const top = hexToRgb('#0e7490')
    const bottom = hexToRgb('#22d3ee')
    return [
      top[0] + (bottom[0] - top[0]) * t,
      top[1] + (bottom[1] - top[1]) * t,
      top[2] + (bottom[2] - top[2]) * t,
      255,
    ]
  }
  r.paint((x, y) => (inRoundedRect(x, y, tx, ty, tileSize, tileSize, tileSize * 0.22) ? tileGrad(x, y) : null))
  const white = [255, 255, 255, 255]
  const cx = width * 0.5
  const cy = height * 0.52
  r.paint(
    magnifierMark(
      cx - tileSize * 0.04,
      cy - tileSize * 0.04,
      tileSize * 0.21,
      tileSize * 0.085,
      tileSize * 0.2,
      tileSize * 0.095,
      white,
    ),
  )
  return r.toRGBA()
}

function buildIco(images) {
  const count = images.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)
  const entries = []
  let offset = 6 + count * 16
  const pngs = []
  for (const { width, height, png } of images) {
    const entry = Buffer.alloc(16)
    entry[width >= 256 ? 'writeUInt8' : 'writeUInt8'](width >= 256 ? 0 : width, 0)
    entry.writeUInt8(height >= 256 ? 0 : height, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += png.length
    pngs.push(png)
  }
  return Buffer.concat([header, ...entries, ...pngs])
}

const favicon32 = renderIcon(32, 4)
const favicon64 = renderIcon(64, 4)
const apple = renderAppleTouchIcon(180, 4)
const og = renderOG(1200, 630, 2)

writeFileSync(resolve(outDir, 'favicon.ico'), buildIco([
  { width: 32, height: 32, png: encodePNG(32, 32, favicon32) },
  { width: 64, height: 64, png: encodePNG(64, 64, favicon64) },
]))
writeFileSync(resolve(outDir, 'apple-touch-icon.png'), encodePNG(180, 180, apple))
writeFileSync(resolve(outDir, 'og-default.png'), encodePNG(1200, 630, og))

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0e7490"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <circle cx="27" cy="27" r="11" fill="none" stroke="#ffffff" stroke-width="5"/>
  <line x1="35" y1="35" x2="47" y2="47" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
</svg>
`
writeFileSync(resolve(outDir, 'favicon.svg'), faviconSvg)

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03242b"/>
      <stop offset="1" stop-color="#0b5563"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0e7490"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1056" cy="50" r="340" fill="url(#glow)"/>
  <circle cx="600" cy="328" r="390" fill="none" stroke="#67e8f9" stroke-opacity="0.14" stroke-width="3"/>
  <circle cx="600" cy="328" r="277" fill="none" stroke="#67e8f9" stroke-opacity="0.14" stroke-width="2"/>
  <rect x="411" y="134" width="378" height="378" rx="83" fill="url(#tile)"/>
  <circle cx="574" cy="307" r="79" fill="none" stroke="#ffffff" stroke-width="32"/>
  <line x1="631" y1="364" x2="713" y2="446" stroke="#ffffff" stroke-width="36" stroke-linecap="round"/>
</svg>
`
writeFileSync(resolve(outDir, 'og-default.svg'), ogSvg)

console.log('Generated assets in', outDir)
for (const file of ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'og-default.png', 'og-default.svg']) {
  console.log(' -', file)
}
