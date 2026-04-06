import type { GameState, LeekPlot } from '@/types/game';

/** 摩天大土专用地块 id */
export const LEEK_SKYSCRAPER_PLOT_ID = 4;
/** 摩天大土品种 id（单次固定收获 2000 把） */
export const LEEK_SKYSCRAPER_VARIETY_ID = 'skyscraper';

/** 旧存档补全第四块地 */
export function ensureLeekSkyscraperPlot(leekPlots: LeekPlot[] | undefined): LeekPlot[] {
  const plots = [...(leekPlots || [])];
  if (!plots.some(p => p.id === LEEK_SKYSCRAPER_PLOT_ID)) {
    plots.push({ id: LEEK_SKYSCRAPER_PLOT_ID, pest: 0, ready: false, fertility: 100 });
  }
  return plots;
}

/** 冷库最大扩建等级（含首次建造为 1 级） */
export const LEEK_MAX_COLD_STORAGE_LEVEL = 3;

/** 已建冷库时等级为 1–3；未建为 0。旧存档仅有 boolean 时视为 1 级。 */
export function getEffectiveLeekColdStorageLevel(
  state: Pick<GameState, 'leekFacilities' | 'leekColdStorageLevel'>
): number {
  if (!state.leekFacilities?.['cold_storage']) return 0;
  return Math.min(LEEK_MAX_COLD_STORAGE_LEVEL, Math.max(1, state.leekColdStorageLevel ?? 1));
}

/** 鲜韭「满仓」阈值：随冷库等级提高库容 */
export function leekStockCap(coldStorageLevel: number): number {
  return 40 + 20 * coldStorageLevel;
}

/** 韭菜盒子「满仓库」阈值 */
export function leekBoxStockCap(coldStorageLevel: number): number {
  return 20 + 15 * coldStorageLevel;
}

/** 冷库从当前等级扩建到下一级的花费（首次建造用 leekFacilities 中的 cost） */
export function coldStorageExpansionCost(currentLevel: number): number {
  if (currentLevel === 1) return 500;
  if (currentLevel === 2) return 700;
  return 0;
}

/** 有冷库时的腐损倍率：每级再乘 0.5 */
export function leekColdSpoilageMultiplier(level: number): number {
  if (level <= 0) return 1;
  return Math.pow(0.5, level);
}
