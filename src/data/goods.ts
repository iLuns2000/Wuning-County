import { Good } from '@/types/game';

export const goods: Good[] = [
  {
    id: 'grain',
    name: '粮草',
    description: '民以食为天，价格随季节和战事波动。',
    basePrice: 10,
    volatility: 0.3,
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
  },
  {
    id: 'iron',
    name: '铁器',
    description: '农具与兵器的原料，受管制影响大。',
    basePrice: 200,
    volatility: 0.4,
  },
  {
    id: 'antique',
    name: '古董',
    description: '盛世的收藏品，价格极不稳定。',
    basePrice: 1000,
    volatility: 1.0,
  },
];
