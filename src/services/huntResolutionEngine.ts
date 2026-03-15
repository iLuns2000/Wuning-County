import { GameState, PlayerStats, Effect } from '@/types/game';

/**
 * 狩猎结果概率表与结算引擎
 */

// 狩猎结果档位
export type HuntOutcomeLevel = 'excellent' | 'good' | 'normal' | 'poor' | 'terrible';

// 狩猎结果配置
export interface HuntOutcomeConfig {
  level: HuntOutcomeLevel;
  name: string;
  description: string;
  baseProbability: number; // 基础概率
  effect: {
    experience: number;
    money: number;
    health: number;
  };
  items?: string[];
}

// 狩猎结果表
export const huntOutcomeTable: HuntOutcomeConfig[] = [
  {
    level: 'excellent',
    name: '极好',
    description: '捕获了野鹿或山雀！',
    baseProbability: 0.1,
    effect: { experience: 40, money: 100, health: -30 }
  },
  {
    level: 'good',
    name: '较好',
    description: '收获了野山鸡和兔子！',
    baseProbability: 0.25,
    effect: { experience: 25, money: 50, health: -15 }
  },
  {
    level: 'normal',
    name: '一般',
    description: '抓到了一只竹鼠。',
    baseProbability: 0.35,
    effect: { experience: 15, money: 30, health: -10 }
  },
  {
    level: 'poor',
    name: '较差',
    description: '只采到了蘑菇野菜笋子。',
    baseProbability: 0.2,
    effect: { experience: 10, money: 15, health: -5 }
  },
  {
    level: 'terrible',
    name: '极差',
    description: '遭遇黑熊，被追得落荒而逃！',
    baseProbability: 0.1,
    effect: { experience: 50, money: 0, health: -30 },
    items: [] // 触发"喜欢做梦的逃兵"成就
  }
];

/**
 * 根据玩家属性调整狩猎结果概率
 */
function adjustProbabilitiesByStats(
  baseProbs: number[],
  player: PlayerStats
): number[] {
  // 玩家综合水平影响：高属性增加好结果概率
  const playerLevel = (
    0.35 * (player.ability || 0) +
    0.25 * (player.accuracy || 0) +
    0.2 * Math.min(1, (player.experience || 0) / 100) * 100
  ) / 100; // 归一化到 0-1
  
  // 权重调整：+0.2 到 +0.4 的偏移给好结果
  const adjustment = playerLevel * 0.3;
  
  const adjusted = [...baseProbs];
  // excellent 和 good 概率增加
  adjusted[0] = Math.min(0.25, adjusted[0] + adjustment);
  adjusted[1] = Math.min(0.4, adjusted[1] + adjustment * 0.8);
  // terrible 概率降低
  adjusted[4] = Math.max(0.02, adjusted[4] - adjustment * 0.5);
  
  // 归一化
  const sum = adjusted.reduce((a, b) => a + b, 0);
  return adjusted.map(p => p / sum);
}

/**
 * 抽样决定狩猎结果
 */
function sampleOutcome(probabilities: number[]): HuntOutcomeLevel {
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (random < cumulative) {
      return huntOutcomeTable[i].level;
    }
  }
  
  return 'normal'; // 默认
}

/**
 * 解析狩猎结果
 */
export interface HuntResult {
  outcome: HuntOutcomeConfig;
  effect: Effect;
  logMessage: string;
  achievementId?: string; // 如果是极差结果，发放成就
}

/**
 * 执行狩猎
 */
export function resolveHunt(state: GameState): HuntResult {
  const player = state.playerStats;
  
  // 获取基础概率
  const baseProbs = huntOutcomeTable.map(o => o.baseProbability);
  
  // 根据玩家属性调整概率
  const adjustedProbs = adjustProbabilitiesByStats(baseProbs, player);
  
  // 抽样结果
  const outcomeLevel = sampleOutcome(adjustedProbs);
  const outcome = huntOutcomeTable.find(o => o.level === outcomeLevel)!;
  
  // 构建 effect
  const effect: Effect = {
    experience: outcome.effect.experience,
    money: outcome.effect.money,
    health: outcome.effect.health
  };
  
  // 构建日志消息
  let logMessage = outcome.description;
  if (outcome.effect.experience > 0) {
    logMessage += ` 阅历+${outcome.effect.experience}`;
  }
  if (outcome.effect.money > 0) {
    logMessage += ` 银两+${outcome.effect.money}`;
  } else if (outcome.effect.money < 0) {
    logMessage += ` 银两${outcome.effect.money}`;
  }
  logMessage += ` 体力${outcome.effect.health}`;
  
  // 极差结果特殊处理
  let achievementId: string | undefined;
  if (outcomeLevel === 'terrible') {
    logMessage += ' 你获得了称号「喜欢做梦的逃兵」！';
    achievementId = 'dreaming_fugitive';
  }
  
  return {
    outcome,
    effect,
    logMessage,
    achievementId
  };
}
