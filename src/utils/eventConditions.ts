import { GameEvent, GameState } from '@/types/game';

const SEASONS = ['春', '夏', '秋', '冬'] as const;

export const checkEventTriggerCondition = (event: GameEvent, state: GameState): { passed: boolean; reason?: string } => {
  const cond = event.triggerCondition;
  if (!cond) return { passed: true };

  if (cond.requiredRole && state.role !== cond.requiredRole) {
    return { passed: false, reason: `仅限${cond.requiredRole}身份触发` };
  }

  if (cond.minReputation !== undefined && state.playerStats.reputation < cond.minReputation) {
    return { passed: false, reason: `声望不足（需${cond.minReputation}）` };
  }

  if (cond.minMoney !== undefined && state.playerStats.money < cond.minMoney) {
    return { passed: false, reason: `银两不足（需${cond.minMoney}）` };
  }

  if (cond.minAbility !== undefined && state.playerStats.ability < cond.minAbility) {
    return { passed: false, reason: `能力不足（需${cond.minAbility}）` };
  }

  if (cond.minDay !== undefined && state.day < cond.minDay) {
    return { passed: false, reason: `天数不足（第${cond.minDay}天后解锁）` };
  }

  if (cond.season) {
    const seasonIndex = Math.floor(((state.day - 1) % 360) / 90);
    const season = SEASONS[seasonIndex];
    if (cond.season !== season) {
      return { passed: false, reason: `仅限${cond.season}触发` };
    }
  }

  if (cond.requiredItems) {
    for (const [itemId, minCount] of Object.entries(cond.requiredItems)) {
      if ((state.inventory[itemId] || 0) < minCount) {
        return { passed: false, reason: `缺少物品：${itemId} x${minCount}` };
      }
    }
  }

  if (cond.custom && !cond.custom(state)) {
    return { passed: false, reason: '未满足事件前置条件' };
  }

  return { passed: true };
};
