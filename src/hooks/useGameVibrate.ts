import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

/**
 * 震动模式定义 (单位: 毫秒)
 */
export const VIBRATION_PATTERNS = {
  LIGHT: 15,          // 轻微触觉反馈 (如：按钮点击)
  MEDIUM: 40,         // 中等反馈 (如：交互成功)
  HEAVY: 80,          // 强烈反馈 (如：错误警告)
  SUCCESS: [40, 50, 40], // 成功模式：震-停-震
  ERROR: [50, 100, 50, 100, 50], // 错误模式
};

/**
 * 游戏震动反馈 Hook
 */
export const useGameVibrate = () => {
  const { vibrationEnabled } = useGameStore();

  const vibrate = useCallback((pattern: number | number[] = VIBRATION_PATTERNS.LIGHT) => {
    // 1. 检查开关
    if (!vibrationEnabled) return;

    // 2. 检查浏览器支持
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    // 3. 执行震动
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // 忽略不支持或被浏览器策略阻止的错误
      console.warn('Vibration failed:', e);
    }
  }, [vibrationEnabled]);

  return vibrate;
};
