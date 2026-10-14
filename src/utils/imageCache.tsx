/**
 * 图片缓存管理器 - 基于 IndexedDB
 * 用于缓存游戏中的图片，减少网络请求和加载时间
 */

import { DBSchema, openDB, IDBPDatabase } from 'idb';

// 数据库配置
const DB_NAME = 'WuningCountyCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB 最大缓存

interface ImageCacheDB extends DBSchema {
  images: {
    key: string;
    value: {
      url: string;
      blob: Blob;
      timestamp: number;
      size: number;
      contentType: string;
    };
    indexes: { 'by-url': string; 'by-timestamp': number };
  };
}

class ImageCacheManager {
  private db: IDBPDatabase<ImageCacheDB> | null = null;
  private initPromise: Promise<void> | null = null;

  // 初始化数据库
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.db = await openDB<ImageCacheDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            store.createIndex('by-url', 'url', { unique: true });
            store.createIndex('by-timestamp', 'timestamp', { unique: false });
          }
        }
      });

      // 首次打开或版本升级时清理过期缓存
      await this.cleanExpiredCache();
    })();

    return this.initPromise;
  }

  // 保存图片到缓存
 async cacheImage(url: string, blob: Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    // 先检查缓存大小，必要时清理
    await this.checkAndCleanCache(blob.size);

    // 再创建事务保存图片
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.put({
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
      contentType: blob.type
    });

    await tx.done;
  }

  // 从缓存获取图片
  async getImage(url: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    const result = await this.db.get('images', url);

    if (result) {
      if (!result.blob.size || result.blob.type.startsWith('text/')) {
        await this.db.delete(STORE_NAME, url);
        return null;
      }
      // 更新访问时间
      await this.db.put('images', {
        ...result,
        timestamp: Date.now()
      });
      
      // 返回 Blob URL
      return URL.createObjectURL(result.blob);
    }

    return null;
  }

  // 检查图片是否存在缓存中
  async hasImage(url: string): Promise<boolean> {
    const cached = await this.getImage(url);
    if (cached) URL.revokeObjectURL(cached);
    return cached !== null;
  }

  async removeImage(url: string): Promise<void> {
    await this.init();
    await this.db?.delete(STORE_NAME, url);
  }

  // 获取缓存大小
  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const count = await this.db.count('images');
    // 估算：平均图片100KB
    return count * 100 * 1024;
  }

  // 清理过期缓存（30天前的）
  private async cleanExpiredCache(): Promise<void> {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    if (!this.db) return;

    let cursor = await this.db.transaction('images', 'readwrite').store.index('by-timestamp').openCursor(IDBKeyRange.upperBound(thirtyDaysAgo, true));
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }

  // 检查并清理缓存
  private async checkAndCleanCache(newSize: number): Promise<void> {
    const currentSize = await this.getCacheSize();
    
    if (currentSize + newSize > MAX_CACHE_SIZE) {
      if (!this.db) return;

      let freedSpace = 0;
      const targetFree = newSize;
      
      let cursor = await this.db.transaction('images', 'readwrite').store.index('by-timestamp').openCursor();
      
      while (cursor && freedSpace < targetFree) {
        freedSpace += cursor.value.size;
        await cursor.delete();
        cursor = await cursor.continue();
      }
    }
  }

  // 清除所有缓存
  async clearCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear();
    await tx.done;
  }
}

// 导出单例
export const imageCache = new ImageCacheManager();


/**
 * 带缓存的图片加载组件
 * 使用方式：<CachedImage src="/images/xxx.jpg" alt="xxx" />
 */
import React, { useState, useEffect, useRef } from 'react';

// HTTP 200 can contain the SPA's HTML fallback. Decode before using or caching it.
const isDecodableImage = (url: string): Promise<boolean> => new Promise(resolve => {
  const probe = new Image();
  probe.onload = () => resolve(probe.naturalWidth > 0);
  probe.onerror = () => resolve(false);
  probe.src = url;
});

interface CachedImageProps {
  src: string;
  alt?: string;
  className?: string;
  placeholder?: React.ReactNode;
  onError?: (error: Error) => void;
}

// 支持 WebP 回退的加载函数
const loadImageWithFallback = async (src: string, onError?: (err: Error) => void): Promise<string | null> => {
  // 提取基础路径和尝试的扩展名顺序
  const tryFormats = ['.webp', '.jpg', '.png', '.jpeg'];
  let basePath = src;
  
  // 找到当前扩展名位置
  const currentExt = tryFormats.find(ext => src.toLowerCase().endsWith(ext));
  if (currentExt) {
    basePath = src.slice(0, -currentExt.length);
    // 重新排序，优先尝试用户指定的格式
    const idx = tryFormats.indexOf(currentExt);
    if (idx > 0) {
      tryFormats.splice(idx, 1);
      tryFormats.unshift(currentExt);
    }
  }

  // 尝试加载每种格式
  for (const ext of tryFormats) {
    const trySrc = basePath + ext;
    try {
      // 先从缓存获取
      // Browser storage is optional: a cache error must not block the network.
      let cached: string | null = null;
      try { cached = await imageCache.getImage(trySrc); } catch {}
      if (cached) {
        if (await isDecodableImage(cached)) return cached;
        URL.revokeObjectURL(cached);
        try { await imageCache.removeImage(trySrc); } catch {}
      }

      // 下载并缓存
      const response = await fetch(trySrc, { cache: 'no-cache' });
      if (!response.ok) continue;
      if (response.headers.get('content-type')?.toLowerCase().startsWith('text/')) continue;
      
      const blob = await response.blob();
      if (!blob.size) continue;
      const url = URL.createObjectURL(blob);
      if (!(await isDecodableImage(url))) {
        URL.revokeObjectURL(url);
        continue;
      }
      try { await imageCache.cacheImage(trySrc, blob); } catch {}
      return url;
    } catch {
      // 继续尝试下一种格式
    }
  }
  
  onError?.(new Error('All formats failed'));
  return null;
};

export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt = '',
  className = '',
  placeholder,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const errorHandler = useRef(onError);
  errorHandler.current = onError;

  useEffect(() => {
    let mounted = true;
    let ownedUrl: string | null = null;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    const loadImage = async () => {
      if (!src) {
        setLoading(false);
        return;
      }

      try {
        const url = await loadImageWithFallback(src, (err) => {
          if (mounted) {
            setError(err);
            errorHandler.current?.(err);
          }
        });

        if (mounted && url) {
          ownedUrl = url;
          setImageUrl(url);
          setLoading(false);
        } else {
          if (url) URL.revokeObjectURL(url);
          if (!mounted) return;
          setError(new Error('Image load failed'));
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
          errorHandler.current?.(err as Error);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
      if (ownedUrl) URL.revokeObjectURL(ownedUrl);
    };
  }, [src]);

  if (loading) {
    return placeholder ? (
      <>{placeholder}</>
    ) : (
      <div className={`animate-pulse bg-gray-200 ${className}`} />
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <span>图片加载失败</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl || src} 
      alt={alt} 
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setError(new Error('Image load failed'))}
    />
  );
};

export default imageCache;
