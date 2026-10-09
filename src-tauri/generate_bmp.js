// Generates valid 24-bit uncompressed Windows BMP files for NSIS installer
import fs from 'fs';
import path from 'path';

function createBmpBuffer(width, height, fillGradient) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buf = Buffer.alloc(fileSize);

  // BMP Header
  buf.write('BM', 0); // Signature
  buf.writeUInt32LE(fileSize, 2); // File size
  buf.writeUInt32LE(0, 6); // Reserved
  buf.writeUInt32LE(54, 10); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  buf.writeUInt32LE(40, 14); // Header size
  buf.writeInt32LE(width, 18); // Width
  buf.writeInt32LE(height, 22); // Height (positive = bottom-up)
  buf.writeUInt16LE(1, 26); // Color planes
  buf.writeUInt16LE(24, 28); // Bits per pixel (24-bit RGB)
  buf.writeUInt32LE(0, 30); // Compression (0 = BI_RGB)
  buf.writeUInt32LE(pixelArraySize, 34); // Image size
  buf.writeInt32LE(2835, 38); // Horizontal resolution (72 DPI)
  buf.writeInt32LE(2835, 42); // Vertical resolution (72 DPI)
  buf.writeUInt32LE(0, 46); // Colors in palette
  buf.writeUInt32LE(0, 50); // Important colors

  // Pixel data (BGR format, bottom-to-top)
  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const colOffset = rowOffset + x * 3;
      const [r, g, b] = fillGradient(x, y, width, height);
      buf[colOffset] = b;     // Blue
      buf[colOffset + 1] = g; // Green
      buf[colOffset + 2] = r; // Red
    }
  }

  return buf;
}

// 1. Sidebar Image (164 x 314 px) - Dark Forest Green with vibrant emerald glow
const sidebarBmp = createBmpBuffer(164, 314, (x, y, w, h) => {
  const normY = y / h;
  const normX = x / w;
  
  // Radial glow around top-center (x: 82, y: 70)
  const dx = (x - 82) / 82;
  const dy = (y - 70) / 70;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const glow = Math.max(0, 1 - dist * 0.9);

  // Deep forest green base (#081C15 to #1B4332)
  let r = Math.round(8 + normY * 18 + glow * 20);
  let g = Math.round(28 + normY * 39 + glow * 150);
  let b = Math.round(21 + normY * 29 + glow * 95);

  // Soft pattern accent lines
  if (Math.abs(y - 120) < 1 || Math.abs(y - 220) < 1) {
    g = Math.min(255, g + 25);
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
});

// 2. Header Banner (150 x 57 px)
const headerBmp = createBmpBuffer(150, 57, (x, y, w, h) => {
  const normX = x / w;
  const r = Math.round(10 + normX * 15);
  const g = Math.round(35 + normX * 45);
  const b = Math.round(26 + normX * 30);
  return [r, g, b];
});

const iconsDir = path.resolve('src-tauri/icons');
fs.writeFileSync(path.join(iconsDir, 'installer-sidebar.bmp'), sidebarBmp);
fs.writeFileSync(path.join(iconsDir, 'installer-header.bmp'), headerBmp);
console.log('Successfully generated installer-sidebar.bmp and installer-header.bmp in', iconsDir);
