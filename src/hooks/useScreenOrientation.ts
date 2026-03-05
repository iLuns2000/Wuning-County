import { useState, useEffect } from 'react';
import { SCREEN_ORIENTATION_RATIO } from '@/constants';

export type ScreenOrientation = 'vertical' | 'horizontal';

/**
 * 检测屏幕方向的自定义 Hook
 * @returns 当前屏幕方向（'vertical' 或 'horizontal'）
 */
export function useScreenOrientation(): ScreenOrientation {
  const [orientation, setOrientation] = useState<ScreenOrientation>(() => {
    return getOrientation();
  });

  useEffect(() => {
    const handleResize = () => {
      setOrientation(getOrientation());
    };

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 监听设备方向变化（移动设备）
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return orientation;
}

/**
 * 根据窗口尺寸判断屏幕方向
 */
function getOrientation(): ScreenOrientation {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / height;
  
  return ratio < SCREEN_ORIENTATION_RATIO ? 'vertical' : 'horizontal';
}

/**
 * 判断是否为竖屏
 */
export function isVerticalScreen(): boolean {
  return getOrientation() === 'vertical';
}

/**
 * 判断是否为横屏
 */
export function isHorizontalScreen(): boolean {
  return getOrientation() === 'horizontal';
}
