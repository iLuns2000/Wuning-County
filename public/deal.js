import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// 解决ES模块中__dirname不存在的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置项 - 可根据需要灵活调整
const CONFIG = {
  // 目标文件夹路径（绝对/相对路径均可）
  targetDir: './images',
  // 是否保留原文件
  keepOriginal: true,
  // WebP压缩质量（0-100，数值越小压缩率越高，默认80）
  quality: 80,
  // 最大宽度限制（超过则等比例缩放，0表示不限制）
  maxWidth: 1920,
  // 最大高度限制（超过则等比例缩放，0表示不限制）
  maxHeight: 1080,
  // 是否压缩已存在的WebP文件（false则跳过已有webp）
  compressExistingWebp: true,
  // 临时文件后缀（处理同名文件时避免输入输出冲突）
  tempSuffix: '_temp_compress'
};

// 支持处理的图片格式
const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp'];

/**
 * 计算文件大小（字节转MB/KB，便于日志展示）
 * @param {number} bytes 文件字节数
 * @returns {string} 格式化后的大小字符串
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 检查路径是否存在
 * @param {string} path 要检查的路径
 * @returns {boolean} 是否存在
 */
async function pathExists(checkPath) {
  try {
    await fs.access(checkPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 处理单张图片：转换格式 + 压缩（解决输入输出文件冲突）
 * @param {string} filePath 原文件路径
 * @param {string} targetFilePath 目标文件路径
 */
async function processImage(filePath, targetFilePath) {
  try {
    // 获取原文件大小
    const originalStat = await fs.stat(filePath);
    const originalSize = originalStat.size;

    // 初始化sharp处理流
    let sharpInstance = sharp(filePath);
    
    // 获取图片原尺寸（用于判断是否需要缩放）
    const metadata = await sharpInstance.metadata();
    let width = metadata.width;
    let height = metadata.height;

    // 按最大尺寸等比例缩放
    if (CONFIG.maxWidth > 0 || CONFIG.maxHeight > 0) {
      const scaleRatio = Math.min(
        CONFIG.maxWidth > 0 ? CONFIG.maxWidth / width : 1,
        CONFIG.maxHeight > 0 ? CONFIG.maxHeight / height : 1
      );
      if (scaleRatio < 1) {
        width = Math.floor(width * scaleRatio);
        height = Math.floor(height * scaleRatio);
        sharpInstance = sharpInstance.resize(width, height);
        console.log(`📏 缩放图片：${width}x${height}（原：${metadata.width}x${metadata.height}）`);
      }
    }

    // 处理输入输出文件相同的情况（针对已是webp的文件）
    let finalTargetPath = targetFilePath;
    let tempFilePath = '';
    if (filePath === targetFilePath) {
      // 创建临时文件路径，避免读写冲突
      const ext = path.extname(targetFilePath);
      const base = path.basename(targetFilePath, ext);
      const dir = path.dirname(targetFilePath);
      tempFilePath = path.join(dir, `${base}${CONFIG.tempSuffix}${ext}`);
      finalTargetPath = tempFilePath;
    }

    // 转换为WebP并压缩
    await sharpInstance
      .webp({
        quality: CONFIG.quality,
        effort: 4
      })
      .toFile(finalTargetPath);

    // 如果使用了临时文件，替换原文件
    if (tempFilePath) {
      await fs.rename(tempFilePath, targetFilePath);
    }

    // 获取压缩后文件大小，计算压缩率
    const compressedStat = await fs.stat(targetFilePath);
    const compressedSize = compressedStat.size;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    console.log(
      `✅ 处理完成：${path.basename(filePath)} 
        原大小：${formatFileSize(originalSize)} → 新大小：${formatFileSize(compressedSize)} 
        压缩率：${compressionRatio}%`
    );

    // 删除原文件（如果配置为不保留，且原文件不是目标文件）
    if (!CONFIG.keepOriginal && filePath !== targetFilePath) {
      await fs.unlink(filePath);
      console.log(`🗑️ 删除原文件：${path.basename(filePath)}`);
    }

  } catch (error) {
    throw new Error(`处理失败：${error.message}`);
  }
}

/**
 * 遍历文件夹并批量处理图片
 * @param {string} dirPath 文件夹路径
 */
async function convertAndCompressImages(dirPath) {
  try {
    // 检查文件夹是否存在
    if (!(await pathExists(dirPath))) {
      console.error(`❌ 错误：文件夹 ${dirPath} 不存在`);
      return;
    }

    const files = await fs.readdir(dirPath);
    let processedCount = 0;
    let failedCount = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      // 递归处理子文件夹
      if (stat.isDirectory()) {
        await convertAndCompressImages(filePath);
        continue;
      }

      // 筛选支持的图片格式
      const ext = path.extname(file).toLowerCase().replace('.', '');
      if (!SUPPORTED_FORMATS.includes(ext)) continue;

      // 目标文件路径（统一为webp）
      const fileName = path.basename(file, path.extname(file));
      const targetFilePath = path.join(dirPath, `${fileName}.webp`);

      // 处理已有WebP的情况：是否需要重新压缩
      if (ext === 'webp') {
        if (await pathExists(targetFilePath) && !CONFIG.compressExistingWebp) {
          console.log(`ℹ️ 跳过已有WebP（未开启重压缩）：${file}`);
          continue;
        }
      }

      // 处理图片
      try {
        await processImage(filePath, targetFilePath);
        processedCount++;
      } catch (error) {
        console.error(`❌ ${error.message}（文件：${file}）`);
        failedCount++;
      }
    }

    // 输出汇总信息
    console.log(`\n🎉 文件夹处理完成：${dirPath}`);
    console.log(`✅ 成功处理：${processedCount} 张`);
    console.log(`❌ 处理失败：${failedCount} 张`);

  } catch (error) {
    console.error(`❌ 脚本执行出错：${error.message}`);
  }
}

// 启动脚本
const targetDirectory = path.resolve(__dirname, CONFIG.targetDir);
convertAndCompressImages(targetDirectory);