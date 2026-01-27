import { useGameStore } from '@/store/gameStore';
import useSound from 'use-sound';
import { useGameVibrate, VIBRATION_PATTERNS } from './useGameVibrate';

// 这里定义游戏中使用的音效路径
// 请确保在 public/sounds/ 目录下放入对应的音频文件
export const SOUNDS = {
  CLICK: '/sounds/click.mp3',
  HOVER: '/sounds/hover.mp3',
  SUCCESS: '/sounds/success.mp3',
  ERROR: '/sounds/error.mp3',
  TYPE: '/sounds/type.mp3',
  // 背景音乐示例
  BGM_MAIN: '/sounds/bgm_main.mp3',
};

/**
 * 封装 use-sound 的 Hook，自动应用全局音效设置（开关和音量）
 * @param soundUrl 音频文件路径
 * @param options use-sound 选项
 */
export const useGameSound = (soundUrl: string, options: any = {}) => {
  const { soundEnabled, volume } = useGameStore();

  const [play, exposedData] = useSound(soundUrl, {
    ...options,
    soundEnabled: soundEnabled, // 受全局开关控制
    volume: (options.volume || 1) * volume, // 全局音量作为系数
  });

  return [play, exposedData] as const;
};

/**
 * 预设的点击音效 Hook (带轻微震动)
 */
export const useClickSound = () => {
    const vibrate = useGameVibrate();
    const [play] = useGameSound(SOUNDS.CLICK, { volume: 0.5 });
    
    const playWithVibrate = () => {
        play();
        vibrate(VIBRATION_PATTERNS.LIGHT);
    };

    return [playWithVibrate] as const;
};

/**
 * 预设的成功音效 Hook (带成功震动)
 */
export const useSuccessSound = () => {
    const vibrate = useGameVibrate();
    const [play] = useGameSound(SOUNDS.SUCCESS, { volume: 0.6 });

    const playWithVibrate = () => {
        play();
        vibrate(VIBRATION_PATTERNS.SUCCESS);
    };

    return [playWithVibrate] as const;
};

/**
 * 预设的错误音效 Hook (带强震动)
 */
export const useErrorSound = () => {
    const vibrate = useGameVibrate();
    const [play] = useGameSound(SOUNDS.ERROR, { volume: 0.6 });

    const playWithVibrate = () => {
        play();
        vibrate(VIBRATION_PATTERNS.ERROR);
    };

    return [playWithVibrate] as const;
};
