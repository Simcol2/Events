// A tiny, dependency-free solid-color PNG encoder used only by the stub
// image provider, so the demo pipeline needs zero external calls or bundled
// binary assets. Not meant to do anything more than emit a valid, small PNG.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, false);
  return buf;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const crc = crc32(concatBytes([typeBytes, data]));
  return concatBytes([uint32BE(data.length), typeBytes, data, uint32BE(crc)]);
}

async function zlibDeflate(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate"); // zlib-wrapped, exactly what PNG IDAT expects
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export async function encodeSolidColorPng(
  width: number,
  height: number,
  [r, g, b]: [number, number, number]
): Promise<Uint8Array> {
  const bytesPerPixel = 3;
  const stride = 1 + width * bytesPerPixel; // +1 for the per-scanline filter byte
  const raw = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * bytesPerPixel;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const ihdr = concatBytes([
    uint32BE(width),
    uint32BE(height),
    new Uint8Array([8, 2, 0, 0, 0]), // 8-bit depth, color type 2 (RGB), default compression/filter/interlace
  ]);

  const idatData = await zlibDeflate(raw);

  return concatBytes([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", new Uint8Array(0)),
  ]);
}
