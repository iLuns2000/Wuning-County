import { Achievement, GameState } from '@/types/game';

export const achievements: (Achievement & { condition: (state: GameState) => boolean })[] = [
  {
    id: 'first_pot_of_gold',
    name: '第一桶金',
    description: '持有金钱超过 1000 文',
    rewardExp: 50,
    condition: (state) => state.playerStats.money >= 1000
  },
  {
    id: 'survivor',
    name: '生存专家',
    description: '存活超过 10 天',
    rewardExp: 100,
    condition: (state) => state.day > 10
  },
  {
    id: 'veteran',
    name: '老江湖',
    description: '存活超过 30 天',
    rewardExp: 300,
    condition: (state) => state.day > 30
  },
  {
    id: 'social_butterfly',
    name: '交际花',
    description: '声望达到 500',
    rewardExp: 100,
    condition: (state) => state.playerStats.reputation >= 500
  },
  {
    id: 'highly_respected',
    name: '德高望重',
    description: '声望达到 2000',
    rewardExp: 500,
    condition: (state) => state.playerStats.reputation >= 2000
  },
  {
    id: 'scholar',
    name: '才高八斗',
    description: '能力值达到 100',
    rewardExp: 100,
    condition: (state) => state.playerStats.ability >= 100
  },
  {
    id: 'master',
    name: '一代宗师',
    description: '能力值达到 500',
    rewardExp: 500,
    condition: (state) => state.playerStats.ability >= 500
  },
  {
    id: 'wealthy',
    name: '富甲一方',
    description: '持有金钱超过 10000 文',
    rewardExp: 500,
    condition: (state) => state.playerStats.money >= 10000
  },
  {
    id: 'tycoon',
    name: '富可敌国',
    description: '持有金钱超过 100000 文',
    rewardExp: 2000,
    condition: (state) => state.playerStats.money >= 100000
  }
];
