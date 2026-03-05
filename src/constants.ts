/**
 * 全局常量配置
 */

/**
 * 屏幕方向判断阈值
 * 当屏幕宽度/高度比例小于此值时判定为竖屏，否则为横屏
 */
export const SCREEN_ORIENTATION_RATIO = 1.0;

/**
 * 图片路径配置
 */
export const IMAGE_PATHS = {
  VERTICAL: '/images/vertical',  // 竖屏图片目录
  HORIZONTAL: '/images/row',      // 横屏图片目录
} as const;

/**
 * 背景图片配置
 */
export const BACKGROUND_IMAGES = {
  HOME: 'home_bg.jpg',
  GAME_DAY: 'day_bg.jpg',
  GAME_NIGHT: 'nignt_bg.jpg',  // 注意：文件名是 nignt（拼写错误），保持与原文件一致
  GAME_RAIN: 'rain_bg.jpg',
  GAME_RUINED: 'ruined_walls.jpg',
  GAME_RUINED_VERTICAL: 'ruined_walls_vertical.jpg',
} as const;

/**
 * 获取背景图片完整路径
 * @param isVertical 是否为竖屏
 * @param imageName 图片名称
 * @returns 完整的图片路径
 */
export function getBackgroundImage(isVertical: boolean, imageName: string): string {
  const basePath = isVertical ? IMAGE_PATHS.VERTICAL : IMAGE_PATHS.HORIZONTAL;
  return `${basePath}/${imageName}`;
}
