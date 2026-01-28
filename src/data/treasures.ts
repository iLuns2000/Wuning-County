import { Item } from '@/types/game';

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
  }
];

export const treasurePrices: Record<string, number> = {
  'jade_seal': 500000,
  'golden_armor': 2000000,
  'phoenix_hairpin': 800000,
  'dragon_pearl': 1500000,
  'ivory_tower': 300000,
  'celestial_globe': 1000000
};
