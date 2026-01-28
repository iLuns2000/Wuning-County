import { Effect } from '@/types/game';

export interface CharityOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: Effect;
  logMessage: string;
}

export const charities: CharityOption[] = [
  {
    id: 'repair_bridge',
    name: '修缮桥梁',
    description: '出资修缮县城周边的危桥，方便百姓出行。',
    cost: 1000,
    effect: {
      reputation: 10,
    },
    logMessage: '你出资修缮了城外的危桥，百姓们纷纷称赞你的善举。'
  },
  {
    id: 'build_school',
    name: '兴办义学',
    description: '捐资助学，让贫苦人家的孩子也能读得起书。',
    cost: 50000,
    effect: {
      reputation: 500,
    },
    logMessage: '你捐资兴办了义学，朗朗读书声传遍了县城。'
  },
  {
    id: 'disaster_relief',
    name: '施粥赈灾',
    description: '在城门口设立粥棚，救济流民和乞丐。',
    cost: 100000,
    effect: {
      reputation: 1000,
    },
    logMessage: '你设立粥棚救济灾民，全城百姓都感念你的恩德。'
  },
  {
    id: 'restore_temple',
    name: '重修庙宇',
    description: '重修破败的城隍庙，祈求风调雨顺，国泰民安。',
    cost: 1000000,
    effect: {
      reputation: 15000,
      money: 0, 
    },
    logMessage: '你斥巨资重修了城隍庙，香火鼎盛，据说有人看见了祥瑞之兆。'
  }
];
