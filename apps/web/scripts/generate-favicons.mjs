import { writeFileSync } from 'fs'
import { deflateSync } from 'zlib'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Simple PNG generator for favicon placeholders
// This creates minimal PNG files as fallbacks for browsers that don't support SVG favicons

function createSimplePNG(size, color = [5, 217, 168], outputPath) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR chunk
  const width = size
  const height = size
  const bitDepth = 8
  const colorType = 2 // RGB
  const compressionMethod = 0
  const filterMethod = 0
  const interlaceMethod = 0
  
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = bitDepth
  ihdrData[9] = colorType
  ihdrData[10] = compressionMethod
  ihdrData[11] = filterMethod
  ihdrData[12] = interlaceMethod
  
  const ihdrChunk = createChunk('IHDR', ihdrData)
  
  // IDAT chunk - create simple image data
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte
    for (let x = 0; x < width; x++) {
      // Create a simple circle
      const cx = width / 2
      const cy = height / 2
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist <= Math.min(cx, cy) - 2) {
        rawData.push(color[0]) // R
        rawData.push(color[1]) // G
        rawData.push(color[2]) // B
      } else {
        rawData.push(11) // Dark background R
        rawData.push(31) // Dark background G
        rawData.push(46) // Dark background B
      }
    }
  }
  
  const compressed = deflateSync(Buffer.from(rawData), { level: 9 })
  const idatChunk = createChunk('IDAT', compressed)
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0))
  
  // Combine all chunks
  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
  
  writeFileSync(outputPath, png)
  console.log(`✓ Created ${outputPath}`)
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  
  const typeBuffer = Buffer.from(type)
  const crcData = Buffer.concat([typeBuffer, data])
  const crc = crc32(crcData)
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc >>> 0)
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

function crc32(data) {
  let crc = 0xffffffff
  const table = makeCRC32Table()
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  
  return crc ^ 0xffffffff
}

function makeCRC32Table() {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  return table
}

// Generate favicons
const publicDir = join(__dirname, '..', 'public')

createSimplePNG(32, [5, 217, 168], join(publicDir, 'favicon-32x32.png'))
createSimplePNG(16, [5, 217, 168], join(publicDir, 'favicon-16x16.png'))
createSimplePNG(180, [5, 217, 168], join(publicDir, 'apple-touch-icon.png'))

console.log('\n✓ PNG favicon fallbacks generated successfully!')
