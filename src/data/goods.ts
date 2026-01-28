import { Good } from '@/types/game';

export const goods: Good[] = [
  {
    id: 'grain',
    name: '粮草',
    description: '民以食为天，价格随季节和战事波动。',
    basePrice: 10,
    volatility: 0.3,
    spoilageRate: 0.05,
  },
  {
    id: 'cloth',
    name: '布匹',
    description: '寻常百姓家的衣料，价格相对稳定。',
    basePrice: 50,
    volatility: 0.15,
  },
  {
    id: 'tea',
    name: '茶叶',
    description: '文人雅士的最爱，品质决定价格。',
    basePrice: 120,
    volatility: 0.25,
    spoilageRate: 0.02,
  },
  {
    id: 'iron',
    name: '铁器',
    description: '农具与兵器的原料，受管制影响大。',
    basePrice: 200,
    volatility: 0.4,
  },
  {
    id: 'leek',
    name: '鲜韭',
    description: '鲜韭，价格受季节与需求影响。',
    basePrice: 3,
    volatility: 0.3,
    spoilageRate: 0.2,
  },
  {
    id: 'leek_box',
    name: '韭菜盒子',
    description: '香喷喷的韭菜盒子，深受欢迎。',
    basePrice: 10,
    volatility: 0.1,
    spoilageRate: 0.1,
  },
];
