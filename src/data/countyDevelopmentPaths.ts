import { CountyDevelopmentPathId } from '@/types/game';

export interface CountyDevelopmentPathConfig {
  id: CountyDevelopmentPathId;
  name: string;
  description: string;
  unlockLevel: number;
  facilityIncomeMultiplier: number;
  moneyGainMultiplier: number;
  reputationGainMultiplier: number;
  countyGainMultiplier: Partial<Record<'economy' | 'order' | 'culture' | 'livelihood', number>>;
  countyLossMultiplier: Partial<Record<'economy' | 'order' | 'culture' | 'livelihood', number>>;
}

export const countyDevelopmentPaths: CountyDevelopmentPathConfig[] = [
  {
    id: 'trade',
    name: '商贸路线',
    description: '鼓励商贸往来，产业收益更高，经济提升更明显。',
    unlockLevel: 5,
    facilityIncomeMultiplier: 1.2,
    moneyGainMultiplier: 1.15,
    reputationGainMultiplier: 1,
    countyGainMultiplier: { economy: 1.25 },
    countyLossMultiplier: {}
  },
  {
    id: 'stability',
    name: '安民路线',
    description: '重视治安与民生，负面冲击更容易被缓冲。',
    unlockLevel: 10,
    facilityIncomeMultiplier: 0.95,
    moneyGainMultiplier: 1,
    reputationGainMultiplier: 1,
    countyGainMultiplier: { order: 1.25, livelihood: 1.2 },
    countyLossMultiplier: { order: 0.75, livelihood: 0.8 }
  },
  {
    id: 'culture',
    name: '文教路线',
    description: '兴学重教，文化提升更快，名望增长更高。',
    unlockLevel: 15,
    facilityIncomeMultiplier: 1,
    moneyGainMultiplier: 1,
    reputationGainMultiplier: 1.2,
    countyGainMultiplier: { culture: 1.3 },
    countyLossMultiplier: {}
  },
  {
    id: 'balanced',
    name: '综合治理',
    description: '四维均衡推进，治理全面但需要更高调度能力。',
    unlockLevel: 20,
    facilityIncomeMultiplier: 1.1,
    moneyGainMultiplier: 1.05,
    reputationGainMultiplier: 1.05,
    countyGainMultiplier: { economy: 1.15, order: 1.15, culture: 1.15, livelihood: 1.15 },
    countyLossMultiplier: { economy: 0.9, order: 0.9, culture: 0.9, livelihood: 0.9 }
  }
];

export const getCountyDevelopmentPath = (pathId: CountyDevelopmentPathId) => {
  if (pathId === 'none') return null;
  return countyDevelopmentPaths.find(path => path.id === pathId) || null;
};
