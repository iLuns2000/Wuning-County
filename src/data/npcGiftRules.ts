import { Effect, Item } from '@/types/game';

export type JiYiOuGiftCategory = 'tanghulu' | 'xiaolongbao' | 'pastry' | 'dried_snack';

type JiYiOuGiftReward = {
  category: JiYiOuGiftCategory;
  label: string;
  rewardText: string;
  effect: Effect;
};

const PASTRY_KEYWORDS = ['糕', '饼', '酥', '点心', '包'];

export const getJiYiOuGiftCategory = (item: Pick<Item, 'id' | 'name'>): JiYiOuGiftCategory | null => {
  if (item.id === 'snack_tanghulu') return 'tanghulu';
  if (item.id === 'snack_xiaolongbao') return 'xiaolongbao';

  if (PASTRY_KEYWORDS.some(keyword => item.name.includes(keyword))) {
    return 'pastry';
  }

  if (item.id.startsWith('snack_')) {
    return 'dried_snack';
  }

  return null;
};

export const isJiYiOuGiftFood = (item: Pick<Item, 'id' | 'name'>): boolean => {
  return getJiYiOuGiftCategory(item) !== null;
};

export const getJiYiOuGiftCategoryLabel = (category: JiYiOuGiftCategory): string => {
  const labelMap: Record<JiYiOuGiftCategory, string> = {
    tanghulu: '糖葫芦',
    xiaolongbao: '小笼包',
    pastry: '各式糕点',
    dried_snack: '其他干果零食'
  };
  return labelMap[category];
};

const jiYiOuGiftRewards: Record<JiYiOuGiftCategory, JiYiOuGiftReward> = {
  tanghulu: {
    category: 'tanghulu',
    label: '糖葫芦',
    rewardText: '她笑着与你聊了许久健康饮食，还给你把了平安脉。',
    effect: {
      experience: 30,
      health: 10,
      money: 30,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_healthy_diet_chat', 'ji_yi_ou_pingan_pulse']
    }
  },
  xiaolongbao: {
    category: 'xiaolongbao',
    label: '小笼包',
    rewardText: '她认真和你讲了当下节气养生，还塞给你两株仙鹤草。',
    effect: {
      experience: 30,
      money: 30,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_seasonal_health_tips', 'xianhe_grass', 'xianhe_grass']
    }
  },
  pastry: {
    category: 'pastry',
    label: '各式糕点',
    rewardText: '她语重心长地叮嘱你养身之法，并安排了一次艾灸体验。',
    effect: {
      experience: 20,
      health: 20,
      money: 20,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_earnest_advice', 'ji_yi_ou_moxibustion_experience']
    }
  },
  dried_snack: {
    category: 'dried_snack',
    label: '其他干果零食',
    rewardText: '她请你体验针灸调理，并送你一株仙鹤草。',
    effect: {
      health: 50,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_acupuncture_experience', 'xianhe_grass']
    }
  }
};

const jiYiOuGossipLorePool = [
  '【八卦】季一藕压低声音：听说茶坊说书人又把县令断案改编成了新段子。',
  '【八卦】季一藕眨眨眼：有人在后山见到神秘大鸟衔着药包飞过。',
  '【八卦】季一藕笑道：最近医馆外排队的人里，竟有好几位是来打听姻缘的。'
];

const jiYiOuMedicalLorePool = [
  '【医理】季一藕提醒你：饮食贵在有节，寒热辛甘都不宜偏执。',
  '【医理】季一藕说：春养肝、夏养心、秋养肺、冬养肾，作息要顺时。',
  '【医理】季一藕叮嘱：久坐后活动经络，配合温灸，往往更能缓解疲惫。'
];

export const getJiYiOuGiftReward = (category: JiYiOuGiftCategory): JiYiOuGiftReward => {
  return jiYiOuGiftRewards[category];
};

export const rollJiYiOuLoreDrop = (): string | null => {
  if (Math.random() >= 0.7) return null;

  const pool = Math.random() < 0.5 ? jiYiOuGossipLorePool : jiYiOuMedicalLorePool;
  return pool[Math.floor(Math.random() * pool.length)];
};
