import { Facility } from '@/types/game';

export const facilities: Facility[] = [
  {
    id: 'farmland',
    name: '良田',
    description: '购买一块肥沃的土地，雇佣佃农耕种。',
    cost: 500,
    dailyIncome: 15,
    incomeDescription: '田租收入',
    maxCount: 680,
    type: 'normal'
  },
  {
    id: 'fishpond',
    name: '鱼塘',
    description: '在城郊开挖鱼塘，养殖鱼苗。',
    cost: 1200,
    dailyIncome: 40,
    incomeDescription: '水产收入',
    maxCount: 340,
    type: 'normal'
  },
  {
    id: 'shop',
    name: '杂货铺',
    description: '在闹市区盘下一间铺面，经营日用百货。',
    cost: 3000,
    dailyIncome: 110,
    incomeDescription: '店铺盈利',
    maxCount: 170,
    type: 'normal'
  },
  {
    id: 'restaurant',
    name: '酒楼',
    description: '豪华的酒楼，往来皆是富商巨贾。',
    cost: 8000,
    dailyIncome: 300,
    incomeDescription: '酒楼分红',
    maxCount: 102,
    type: 'normal'
  },
  {
    id: 'bank',
    name: '钱庄股份',
    description: '入股本地最大的钱庄，坐享其成。',
    cost: 20000,
    dailyIncome: 800,
    incomeDescription: '钱庄红利',
    maxCount: 34,
    type: 'normal'
  },
  {
    id: 'quarry',
    name: '采石场',
    description: '开采山石，每日产出石料。可升级提高产量。',
    cost: 1000,
    dailyIncome: 0,
    incomeDescription: '石料产出',
    maxCount: 1,
    type: 'resource',
    resourceType: 'stone',
    resourceAmount: 2, // Base amount per level
    maxLevel: 10
  },
  {
    id: 'forestry',
    name: '林场',
    description: '经营林场，每日产出木材。可升级提高产量。',
    cost: 1000,
    dailyIncome: 0,
    incomeDescription: '木材产出',
    maxCount: 1,
    type: 'resource',
    resourceType: 'wood',
    resourceAmount: 2, // Base amount per level
    maxLevel: 10
  }
];
