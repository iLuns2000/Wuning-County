/**
 * 图片压缩脚本 - 将 JPEG/PNG 转换为 WebP 并压缩
 * 运行: node scripts/compress-images.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = 'public/images';
const MAX_SIZE_KB = 200; // 最大 200KB

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;
  
  const stats = fs.statSync(filePath);
  const sizeKB = stats.size / 1024;
  
  if (sizeKB <= MAX_SIZE_KB) {
    console.log(`  ⏩ 跳过 ${path.basename(filePath)} (${Math.round(sizeKB)}KB)`);
    return;
  }
  
  const outputPath = filePath.replace(ext, '.webp');
  
  try {
    await sharp(filePath)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSizeKB = newStats.size / 1024;
    const saved = ((sizeKB - newSizeKB) / sizeKB * 100).toFixed(1);
    
    console.log(`  ✅ ${path.basename(filePath)}: ${Math.round(sizeKB)}KB → ${Math.round(newSizeKB)}KB (节省 ${saved}%)`);
    
    // 删除原文件
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`  ❌ 失败 ${filePath}:`, err.message);
  }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => 
    ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
  );
  
  console.log(`\n🖼️  开始压缩 ${files.length} 张图片...\n`);
  
  for (const file of files) {
    await compressImage(path.join(IMAGES_DIR, file));
  }
  
  console.log('\n✅ 压缩完成！');
}

main();