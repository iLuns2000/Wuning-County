import { GameState, PlayerStats } from '@/types/game';

/**
 * NPC 对抗互动引擎
 * 用于处理玩家与 NPC 之间的对抗类互动（如射箭、棋局等）
 */

// 季一藕射箭能力基线
const JI_YI_OU_ARCHERY_BASE = 60;

/**
 * 计算玩家射箭胜率
 * 综合考虑：能力、准头、阅历
 * @param player 玩家属性
 * @param npcLevel NPC 能力等级（可选，默认季一藕基线）
 * @returns 胜率 (0-1)
 */
export function calcArcheryWinRate(
  player: PlayerStats, 
  npcLevel: number = JI_YI_OU_ARCHERY_BASE
): number {
  // 玩家综合水平计算
  // 综合 = 0.35 * 能力 + 0.25 * 准头 + 0.2 * 阅历/100 + 0.2 * 关系/100
  const experienceFactor = Math.min(1, (player.experience || 0) / 100);
  
  const playerScore = (
    0.35 * (player.ability || 0) +
    0.25 * (player.accuracy || 0) +
    0.2 * experienceFactor * 100
  );
  
  // 胜率 = 玩家得分 / (玩家得分 + NPC得分)
  // 添加基础随机性 (±10%)
  const randomFactor = (Math.random() - 0.5) * 0.2;
  
  let winRate = playerScore / (playerScore + npcLevel);
  
  // clamp 到 5% - 95% 范围
  winRate = Math.max(0.05, Math.min(0.95, winRate + randomFactor));
  
  return winRate;
}

/**
 * 模拟一次 NPC 射箭对战
 */
export interface DuelOutcome {
  playerWon: boolean;
  playerScore: number;
  npcScore: number;
  effect: {
    money: number;
    experience: number;
    accuracy: number;
  };
  logMessage: string;
}

/**
 * 季一藕射箭对战结果
 */
export function simulateJiYiOuArcheryDuel(state: GameState): DuelOutcome {
  const player = state.playerStats;
  const winRate = calcArcheryWinRate(player, JI_YI_OU_ARCHERY_BASE);
  const random = Math.random();
  const playerWon = random < winRate;
  
  // 计算得分
  const playerScore = Math.floor(50 + Math.random() * 50 + (player.accuracy || 0) * 0.3);
  const npcScore = Math.floor(50 + Math.random() * 50);
  
  if (playerWon) {
    // 季一藕赢了：玩家获得金钱和阅历
    return {
      playerWon: false,
      playerScore,
      npcScore,
      effect: {
        money: 20,
        experience: 10,
        accuracy: 0
      },
      logMessage: `切磋结束，季一藕略胜一筹！你获得银两+20，阅历+10。`
    };
  } else {
    // 玩家赢了：季一藕获得金钱，玩家获得准头
    return {
      playerWon: true,
      playerScore,
      npcScore,
      effect: {
        money: -10,
        experience: 0,
        accuracy: 20
      },
      logMessage: `切磋结束，你赢了季一藕！虽输了10文钱，但准头+20！`
    };
  }
}

/**
 * 获取当前射箭切磋次数
 */
export function getArcheryDuelCount(state: GameState): number {
  return (state.flags['ji_yi_ou_archery_duel_count'] as number) || 0;
}

/**
 * 增加射箭切磋次数并检查是否解锁狩猎
 */
export function incrementArcheryDuelCount(state: GameState): { 
  newCount: number; 
  huntUnlocked: boolean;
} {
  const currentCount = getArcheryDuelCount(state);
  const newCount = currentCount + 1;
  const huntUnlocked = newCount >= 10;
  
  return {
    newCount,
    huntUnlocked
  };
}
