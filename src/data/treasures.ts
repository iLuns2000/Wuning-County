/*
 * @Author: xyZhan
 * @Date: 2026-02-19 15:49:53
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-01 19:17:04
 * @FilePath: \textgame\src\data\treasures.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import { Item } from '@/types/game';

/** 珍宝阁「降税令」id，与 gameStore 购买/税收逻辑共用 */
export const TAX_RELIEF_EDICT_ID = 'tax_relief_edict';
/** 购买后生效的游戏日数 */
export const PROPERTY_TAX_HALVING_GAME_DAYS = 15;

export const treasures: Item[] = [
  {
    id: 'jade_seal',
    name: '前朝玉玺',
    description: '一方缺了一角的玉玺，据说曾被用来砸核桃。虽然没啥大用，但摆在家里看着就贵气逼人。',
    type: 'treasure',
  },
  {
    id: 'golden_armor',
    name: '金缕玉衣',
    description: '用金丝和玉片编织而成的衣服，穿上不仅不能防寒，还重得要命，但它是身份的象征。',
    type: 'treasure',
  },
  {
    id: 'phoenix_hairpin',
    name: '九尾凤钗',
    description: '传说中后宫之主的饰物，做工极其繁复，戴上它的人走路都不敢大喘气。',
    type: 'treasure',
  },
  {
    id: 'dragon_pearl',
    name: '东海龙珠',
    description: '一颗硕大无比的夜明珠，晚上能当灯泡用，就是有点费眼。',
    type: 'treasure',
  },
  {
    id: 'ivory_tower',
    name: '微雕象牙塔',
    description: '在象牙上雕刻了九层玲珑宝塔，需要用放大镜才能看清里面的佛像，极具艺术价值。',
    type: 'treasure',
  },
  {
    id: 'celestial_globe',
    name: '浑天仪模型',
    description: '纯金打造的浑天仪模型，虽然不能用来观测天象，但用来观测你的财富绰绰有余。',
    type: 'treasure',
  },
  {
    id: 'construction_order',
    name: '建材令',
    description: '用于建造建筑的指令，每个指令的价值都是1000000。',
    type: 'treasure',
  },
  {
    id: 'rare_stone',
    name: '稀有石料',
    description: '质地致密、纹理稳定的高阶石料，可用于官邸后期修缮。',
    type: 'treasure',
  },
  {
    id: 'xiao_he_tie',
    name: '小鹤的领带',
    description: '印有小鹤憧憬的楼县令水墨风头像的领带，也可当小发带。',
    type: 'treasure',
  },
  {
    id: TAX_RELIEF_EDICT_ID,
    name: '降税令',
    description:
      '官府认可的减免文书。购得后立即生效：连续十五个游戏日内，按家产阶梯征收的财产税减半；生效期间不可重复购买。',
    type: 'treasure',
    rarity: 'epic',
  },
];

export const treasurePrices: Record<string, number> = {
  'jade_seal': 500000,
  'golden_armor': 2000000,
  'phoenix_hairpin': 800000,
  'dragon_pearl': 1500000,
  'ivory_tower': 300000,
  'celestial_globe': 1000000,
  'construction_order': 1000000,
  'rare_stone': 1800000,
  'xiao_he_tie': 520,
  [TAX_RELIEF_EDICT_ID]: 999900,
};
