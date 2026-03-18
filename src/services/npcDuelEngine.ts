import { GameState, PlayerStats } from '@/types/game';

/**
 * NPC 对抗互动引擎
 * 用于处理玩家与 NPC 之间的对抗类互动（如射箭、棋局等）
 */

// 季一藕射箭能力基线
const JI_YI_OU_ARCHERY_BASE = 60;

/**
 * 模拟一次 NPC 射箭对战
 */
export interface DuelOutcome {
  playerWon: boolean;
  isDraw?: boolean;
  playerScore: number;
  npcScore: number;
  effect: {
    money: number;
    experience?: number;
    accuracy?: number;
    health?: number;
    relationChange?: Record<string, number>;
  };
  logMessage: string;
  winMessage?: string;
  loseMessage?: string;
  drawMessage?: string;
}

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
  const experienceFactor = Math.min(1, (player.experience || 0) / 100);
  
  const playerScore = (
    0.35 * (player.ability || 0) +
    0.25 * (player.accuracy || 0) +
    0.2 * experienceFactor * 100
  );
  
  const randomFactor = (Math.random() - 0.5) * 0.2;
  
  let winRate = playerScore / (playerScore + npcLevel);
  
  winRate = Math.max(0.05, Math.min(0.95, winRate + randomFactor));
  
  return winRate;
}

/**
 * 季一藕射箭对战结果
 */
export function simulateJiYiOuArcheryDuel(state: GameState): DuelOutcome {
  const player = state.playerStats;
  const winRate = calcArcheryWinRate(player, JI_YI_OU_ARCHERY_BASE);
  const random = Math.random();
  const playerWon = random < winRate;
  
  const playerScore = Math.floor(50 + Math.random() * 50 + (player.accuracy || 0) * 0.3);
  const npcScore = Math.floor(50 + Math.random() * 50);
  
  if (playerWon) {
    return {
      playerWon: true,
      playerScore,
      npcScore,
      effect: {
        money: 20,
        experience: 10,
        accuracy: 0
      },
      logMessage: `切磋结束，你赢了季一藕！获得银两+20，阅历+10。`
    };
  } else {
    return {
      playerWon: false,
      playerScore,
      npcScore,
      effect: {
        money: -10,
        experience: 0,
        accuracy: 20
      },
      logMessage: `切磋结束，季一藕略胜一筹！虽输了10文钱，但准头+20！`
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

/**
 * 诩小溪比武对战结果 - 50%概率
 */
export function simulateXuXiaoxiWudaoDuel(state: GameState): DuelOutcome {
  const random = Math.random();
  const playerWon = random < 0.5;
  
  const playerScore = Math.floor(50 + Math.random() * 50);
  const npcScore = Math.floor(50 + Math.random() * 50);
  
  if (playerWon) {
    return {
      playerWon: true,
      playerScore,
      npcScore,
      effect: {
        money: 10,
        health: 5
      },
      winMessage: '诩小溪抱拳道："（姑娘/公子）好功夫，今日战的痛快！"',
      logMessage: '比武胜利！金钱+10，健康+5，好感度+5'
    };
  } else {
    return {
      playerWon: false,
      playerScore,
      npcScore,
      effect: {
        money: 0,
        health: 0
      },
      loseMessage: '诩小溪淡淡道："继续练吧，你的功夫还不到家，下次希望看见你的进步。"',
      logMessage: '比武认输。好感度+2'
    };
  }
}

/**
 * 诩小溪下棋对战结果 - 50%概率
 */
export function simulateXuXiaoxiChessDuel(state: GameState): DuelOutcome {
  const random = Math.random();
  const playerWon = random < 0.5;
  
  const playerScore = Math.floor(50 + Math.random() * 50);
  const npcScore = Math.floor(50 + Math.random() * 50);
  
  if (playerWon) {
    return {
      playerWon: true,
      playerScore,
      npcScore,
      effect: {
        money: 10,
        health: 5
      },
      winMessage: '诩小溪鼓掌笑道："恭喜你赢了，看吧，很多事情看起来难，其实只要你去做也能解决，难的是勇于挑战的决心！"',
      logMessage: '下棋胜利！金钱+10，健康+5，好感度+5'
    };
  } else {
    return {
      playerWon: false,
      playerScore,
      npcScore,
      effect: {
        money: 5,
        health: 0
      },
      loseMessage: '诩小溪安慰道："没关系，下次继续努力，你很有天赋。"',
      logMessage: '下棋认输。金钱+5，好感度+2'
    };
  }
}
