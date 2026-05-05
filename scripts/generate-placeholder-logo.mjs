/**
 * 将输入图片缩放为 256x256 PNG，用作 VS Code 扩展 Logo。
 *
 * 用法: node scripts/generate-placeholder-logo.mjs <输入图片路径>
 *
 * 示例: node scripts/generate-placeholder-logo.mjs D:\Downloads\youcommit-logo-raw.png
 */
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 256;

const input = process.argv[2];
if (!input) {
  console.error('用法: node scripts/generate-placeholder-logo.mjs <输入图片路径>');
  process.exit(1);
}

const outDir = join(__dirname, '..', 'resources', 'logo');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'youcommit-logo.png');

const meta = await sharp(input).metadata();
const w = meta.width, h = meta.height;
const side = Math.min(w, h);

// Extract inner 78% of the image (removes outer padding)
const crop = Math.round(side * 0.78);
const left = Math.round((w - crop) / 2);
const top = Math.round((h - crop) / 2);

await sharp(input)
  .extract({ left, top, width: crop, height: crop })
  .resize(SIZE, SIZE)
  .png()
  .toFile(outPath);

console.log(`✅ Logo 已生成: ${outPath} (${SIZE}x${SIZE})`);
