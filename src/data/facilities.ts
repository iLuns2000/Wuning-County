import { Facility } from '@/types/game';

export const facilities: Facility[] = [
  {
    id: 'farmland',
    name: '良田',
    description: '购买一块肥沃的土地，雇佣佃农耕种。',
    cost: 500,
    dailyIncome: 15,
    incomeDescription: '田租收入',
  },
  {
    id: 'fishpond',
    name: '鱼塘',
    description: '在城郊开挖鱼塘，养殖鱼苗。',
    cost: 1200,
    dailyIncome: 40,
    incomeDescription: '水产收入',
  },
  {
    id: 'shop',
    name: '杂货铺',
    description: '在闹市区盘下一间铺面，经营日用百货。',
    cost: 3000,
    dailyIncome: 110,
    incomeDescription: '店铺盈利',
  },
  {
    id: 'restaurant',
    name: '酒楼',
    description: '豪华的酒楼，往来皆是富商巨贾。',
    cost: 8000,
    dailyIncome: 300,
    incomeDescription: '酒楼分红',
  },
  {
    id: 'bank',
    name: '钱庄股份',
    description: '入股本地最大的钱庄，坐享其成。',
    cost: 20000,
    dailyIncome: 800,
    incomeDescription: '钱庄红利',
  },
];
