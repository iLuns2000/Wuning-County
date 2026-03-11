/**
 * 背景图片预加载和缓存工具
 * 用于游戏背景图片的预加载和缓存
 */

import { imageCache } from './imageCache';

/**
 * 预加载背景图片到缓存
 */
export async function preloadBackgroundImages(imagePaths: string[]): Promise<void> {
  const loadPromises = imagePaths.map(async (path) => {
    try {
      // 检查是否已缓存
      const cached = await imageCache.getImage(path);
      if (cached) {
        console.log(`[BackgroundCache] 已缓存: ${path}`);
        return;
      }
      
      // 未缓存，下载并缓存
      const response = await fetch(path);
      if (!response.ok) return;
      
      const blob = await response.blob();
      await imageCache.cacheImage(path, blob);
      console.log(`[BackgroundCache] 已缓存: ${path}`);
    } catch (error) {
      console.warn(`[BackgroundCache] 缓存失败: ${path}`, error);
    }
  });

  await Promise.allSettled(loadPromises);
}

/**
 * 预加载游戏关键背景
 */
export async function preloadGameBackgrounds(): Promise<void> {
  const criticalBackgrounds = [
    '/images/row/home_bg.jpg',
    '/images/vertical/home_bg.jpg',
    '/images/row/day_bg.jpg',
    '/images/vertical/day_bg.jpg',
    '/images/row/nignt_bg.jpg',
    '/images/vertical/nignt_bg.jpg',
  ];

  await preloadBackgroundImages(criticalBackgrounds);
}

/**
 * 带有缓存的背景图片组件
 * 优先使用缓存，提供更好的加载体验
 */
import React, { useState, useEffect } from 'react';

interface CachedBackgroundImageProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onLoad?: () => void;
}

export const CachedBackgroundImage: React.FC<CachedBackgroundImageProps> = ({
  src,
  className = '',
  style = {},
  children,
  onLoad
}) => {
  const [loaded, setLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoaded(false);

    const loadImage = async () => {
      try {
        // 先尝试从缓存获取
        let url = await imageCache.getImage(src);
        
        // 缓存未命中，下载
        if (!url) {
          const response = await fetch(src);
          if (!response.ok) return;
          
          const blob = await response.blob();
          await imageCache.cacheImage(src, blob);
          url = URL.createObjectURL(blob);
        }

        if (mounted) {
          setImageUrl(url);
          setLoaded(true);
          onLoad?.();
        }
      } catch (error) {
        console.warn('背景图片加载失败:', src, error);
      }
    };

    if (src) {
      loadImage();
    }

    return () => {
      mounted = false;
    };
  }, [src]);

  return (
    <div 
      className={className}
      style={{
        ...style,
        backgroundImage: imageUrl ? `url(${imageUrl})` : style.backgroundImage,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};