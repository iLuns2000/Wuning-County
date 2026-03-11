/**
 * 图片缓存使用示例和说明
 * 
 * 使用方法：
 * 
 * 1. 基础使用 - 使用 CachedImage 组件
 * 
 * import { CachedImage } from '@/utils/imageCache';
 * 
 * <CachedImage 
 *   src="/images/characters/hero.jpg"
 *   alt="侠客"
 *   className="w-32 h-32 rounded-lg"
 *   placeholder={<div className="w-32 h-32 bg-gray-200">加载中...</div>}
 * />
 * 
 * 
 * 2. 高级使用 - 手动控制缓存
 * 
 * import { imageCache } from '@/utils/imageCache';
 * 
 * // 检查是否已缓存
 * const isCached = await imageCache.hasImage('/images/xxx.jpg');
 * 
 * // 获取缓存的图片URL
 * const url = await imageCache.getImage('/images/xxx.jpg');
 * 
 * // 手动缓存图片
 * const response = await fetch('/images/xxx.jpg');
 * const blob = await response.blob();
 * await imageCache.cacheImage('/images/xxx.jpg', blob);
 * 
 * // 获取缓存大小
 * const size = await imageCache.getCacheSize(); // bytes
 * 
 * // 清除所有缓存
 * await imageCache.clearCache();
 * 
 * 
 * 3. 在 React 组件中使用 - 示例
 * 
 * import React from 'react';
 * import { CachedImage } from '@/utils/imageCache';
 * 
 * const CharacterCard = ({ imageUrl, name }) => {
 *   return (
 *     <div className="character-card">
 *       <CachedImage 
 *         src={imageUrl} 
 *         alt={name}
 *         className="w-48 h-48 object-cover rounded-full"
 *         placeholder={
 *           <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
 *             <span className="text-2xl">❓</span>
 *           </div>
 *         }
 *       />
 *       <h3>{name}</h3>
 *     </div>
 *   );
 * };
 * 
 * 
 * 
 * 4. 性能优化建议
 * 
 * - 首次加载：图片会从网络下载并缓存
 * - 后续加载：直接从 IndexedDB 读取，几乎瞬时加载
 * - 离线可用：缓存的图片在离线时也能显示
 * - 自动清理：超过30天或超过100MB会自动清理
 * 
 * 
 * 5. 缓存策略
 * 
 * | 场景 | 行为 |
 * |------|------|
 * | 新用户首次访问 | 从网络下载 |
 * | 再次访问 | 从本地缓存读取 |
 * | 缓存命中 | <10ms 加载时间 |
 * | 缓存未命中 | 正常网络请求 |
 * 
 * 
 * 6. 注意事项
 * 
 * - 图片URL作为缓存key，确保唯一
 * - Blob URL会在组件卸载时由浏览器自动回收
 * - IndexedDB有配额限制，大型应用需监控
 * - 建议为图片使用CDN或静态资源
 */

export const imageCacheExample = {
  demo: '参照上文代码示例'
};