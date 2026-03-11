/**
 * 图片缓存管理器 - 基于 IndexedDB
 * 用于缓存游戏中的图片，减少网络请求和加载时间
 */

import { DBSchema, IDBPDatabase } from 'idb';

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
      this.db = await window.indexedDB.open(DB_NAME, DB_VERSION);
      
      // 创建对象存储
      if (!this.db.objectStoreNames.contains(STORE_NAME)) {
        const store = this.db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('by-url', 'url', { unique: true });
        store.createIndex('by-timestamp', 'timestamp', { unique: false });
      }

      // 首次打开或版本升级时清理过期缓存
      await this.cleanExpiredCache();
    })();

    return this.initPromise;
  }

  // 保存图片到缓存
 async cacheImage(url: string, blob: Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // 检查缓存大小，必要时清理
    await this.checkAndCleanCache(blob.size);

    await store.put({
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
      contentType: blob.type
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 从缓存获取图片
  async getImage(url: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    const tx = this.db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by-url');
    const result = await new Promise<any>((resolve, reject) => {
      const request = index.get(url);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (result) {
      // 更新访问时间
      const updateTx = this.db!.transaction(STORE_NAME, 'readwrite');
      const updateStore = updateTx.objectStore(STORE_NAME);
      updateStore.put({
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
    return cached !== null;
  }

  // 获取缓存大小
  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const tx = this.db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => {
        // 估算：平均图片100KB
        resolve(request.result * 100 * 1024);
      };
      request.onerror = () => reject(0);
    });
  }

  // 清理过期缓存（30天前的）
  private async cleanExpiredCache(): Promise<void> {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by-timestamp');
    
    // 删除超时的记录
    const range = IDBKeyRange.upperBound(thirtyDaysAgo, true);
    const request = index.openCursor(range);
    
    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  // 检查并清理缓存
  private async checkAndCleanCache(newSize: number): Promise<void> {
    const currentSize = await this.getCacheSize();
    
    if (currentSize + newSize > MAX_CACHE_SIZE) {
      // 按时间排序，删除最老的图片直到有足够空间
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by-timestamp');
      
      let freedSpace = 0;
      const targetFree = newSize;
      
      const request = index.openCursor();
      
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor && freedSpace < targetFree) {
          freedSpace += cursor.value.size;
          cursor.delete();
          cursor.continue();
        }
      };
    }
  }

  // 清除所有缓存
  async clearCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

// 导出单例
export const imageCache = new ImageCacheManager();


/**
 * 带缓存的图片加载组件
 * 使用方式：<CachedImage src="/images/xxx.jpg" alt="xxx" />
 */
import React, { useState, useEffect } from 'react';

interface CachedImageProps {
  src: string;
  alt?: string;
  className?: string;
  placeholder?: React.ReactNode;
  onError?: (error: Error) => void;
}

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

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      if (!src) {
        setLoading(false);
        return;
      }

      try {
        // 尝试从缓存获取
        let url = await imageCache.getImage(src);

        // 如果缓存没有，下载并缓存
        if (!url) {
          const response = await fetch(src);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const blob = await response.blob();
          await imageCache.cacheImage(src, blob);
          url = URL.createObjectURL(blob);
        }

        if (mounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
          onError?.(err as Error);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
      // 清理临时URL（如果是我们创建的）
      if (imageUrl && imageUrl.startsWith('blob:')) {
        //URL.revokeObjectURL(imageUrl); // 保持缓存，不需要清理
      }
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
      onError={() => setError(new Error('Image load failed'))}
    />
  );
};

export default imageCache;