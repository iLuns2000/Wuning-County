import { Talent } from '@/types/game';

export const talents: Talent[] = [
  {
    id: 'mercantile',
    name: '经商之道',
    description: '每级提高 10% 的金钱获取效率',
    maxLevel: 5,
    baseCost: 100,
    effectType: 'money_gain',
    effectValue: 0.1
  },
  {
    id: 'eloquence',
    name: '能言善辩',
    description: '每级提高 10% 的声望获取效率',
    maxLevel: 5,
    baseCost: 100,
    effectType: 'reputation_gain',
    effectValue: 0.1
  },
  {
    id: 'fitness',
    name: '强身健体',
    description: '每级提高 10 点体力上限',
    maxLevel: 10,
    baseCost: 50,
    effectType: 'max_health',
    effectValue: 10
  },
  {
    id: 'wisdom',
    name: '博闻强识',
    description: '每级提高 10% 的能力值获取效率',
    maxLevel: 5,
    baseCost: 150,
    effectType: 'ability_gain',
    effectValue: 0.1
  },
  {
    id: 'efficiency',
    name: '事半功倍',
    description: '每级降低 1 点行动体力消耗（最低为1）',
    maxLevel: 3,
    baseCost: 300,
    effectType: 'action_cost',
    effectValue: 1
  }
];
