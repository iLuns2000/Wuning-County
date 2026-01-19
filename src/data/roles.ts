/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:03:49
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-19 19:09:41
 * @FilePath: \textgame\src\data\roles.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import { RoleConfig } from '@/types/game';

export const roles: RoleConfig[] = [
  {
    id: 'magistrate',
    name: '县丞',
    description: '协助县令治理县城的官员。擅长政务，声望较高。',
    initialStats: {
      money: 100,
      reputation: 200,
      ability: 50,
      health: 100,
    },
    initialCountyStats: {
      economy: 50,
      order: 60,
      culture: 50,
      livelihood: 50,
    },
    specialAbility: {
      name: '巡视乡里',
      description: '深入基层，提升县城随机属性并获得声望。',
      costText: '消耗 15 体力',
    },
    passiveEffect: {
      name: '官威',
      description: '每日自动获得 2 点声望。',
    },
  },
  {
    id: 'merchant',
    name: '商人',
    description: '经营店铺的商人。初始资金雄厚，擅长经营。',
    initialStats: {
      money: 500,
      reputation: 50,
      ability: 30,
      health: 100,
    },
    initialCountyStats: {
      economy: 60,
      order: 40,
      culture: 40,
      livelihood: 50,
    },
    specialAbility: {
      name: '风险投资',
      description: '进行高风险投资，可能血本无归也可能大赚一笔。',
      costText: '消耗 100 金钱 + 10 体力',
    },
    passiveEffect: {
      name: '精明',
      description: '日常工作收益增加 20%。',
    },
  },
  {
    id: 'hero',
    name: '少侠',
    description: '行侠仗义的江湖人士。武艺高强，身体强健。',
    initialStats: {
      money: 50,
      reputation: 100,
      ability: 80,
      health: 120,
    },
    initialCountyStats: {
      economy: 40,
      order: 40,
      culture: 40,
      livelihood: 40,
    },
    specialAbility: {
      name: '闭关修炼',
      description: '消耗体力提升武学（能力值）。武学值是行走江湖的关键：\n• 60点：有资格参加武林大会\n• 90点：可完成"一代宗师"终极目标',
      costText: '消耗 30 体力',
    },
    passiveEffect: {
      name: '强健',
      description: '休息时额外恢复 10 点体力。',
    },
  },
];
