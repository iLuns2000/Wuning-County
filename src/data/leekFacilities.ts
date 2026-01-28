import { Facility } from '@/types/game';

export const leekFacilities: Facility[] = [
  {
    id: 'drip_irrigation',
    name: '滴灌系统',
    description: '自动化灌溉系统，每日自动为所有地块浇水。',
    cost: 200,
    dailyIncome: 0,
    incomeDescription: '节省人力',
  },
  {
    id: 'mower',
    name: '自动收割机',
    description: '成熟时自动收割韭菜入库，但无法判断市场行情。',
    cost: 300,
    dailyIncome: 0,
    incomeDescription: '自动收割',
  },
  {
    id: 'cold_storage',
    name: '冷库',
    description: '专业的冷藏设备，显著降低库存物资的腐损率。',
    cost: 800,
    dailyIncome: 0,
    incomeDescription: '降低损耗',
  },
  {
    id: 'breeding_shed',
    name: '育种棚',
    description: '改良韭菜品种，提升种植出的韭菜品质。',
    cost: 1000,
    dailyIncome: 0,
    incomeDescription: '品质提升',
  },
  {
    id: 'processing_table',
    name: '精加工台',
    description: '提升加工效率，进一步降低韭菜盒子的损耗。',
    cost: 600,
    dailyIncome: 0,
    incomeDescription: '加工增效',
  }
];
