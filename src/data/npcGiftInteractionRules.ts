import { Effect, Item } from '@/types/game';

/**
 * NPC 赠礼互动规则配置
 * 用于通用化 NPC 赠礼系统，支持多个 NPC 的不同赠礼规则
 */

// 礼物分类类型
export type GiftCategory = string;

// 礼物匹配器类型
export type GiftMatcher = 
  | { type: 'exact'; itemId: string }
  | { type: 'prefix'; prefix: string }
  | { type: 'keyword'; keywords: string[] }
  | { type: 'tag'; tag: string };

// 分类配置
export interface GiftCategoryConfig {
  id: GiftCategory;
  label: string;
  matchers: GiftMatcher[];
  rewardText: string;
  effect: Effect;
  loreDrop?: {
    probability: number;
    pools: {
      weight: number;
      texts: string[];
    }[];
  };
}

// NPC 赠礼规则
export interface NPCGiftRule {
  npcId: string;
  npcName: string;
  description: string;
  categories: GiftCategoryConfig[];
  categoryOrder?: GiftCategory[]; // 分类展示顺序
}

// 季一藕赠礼规则
const jiYiOuCategories: GiftCategoryConfig[] = [
  {
    id: 'tanghulu',
    label: '糖葫芦',
    matchers: [
      { type: 'exact', itemId: 'snack_tanghulu' }
    ],
    rewardText: '她笑着与你聊了许久健康饮食，还给你把了平安脉。',
    effect: {
      experience: 30,
      health: 10,
      money: 30,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_healthy_diet_chat', 'ji_yi_ou_pingan_pulse']
    },
    loreDrop: {
      probability: 0.3,
      pools: [
        {
          weight: 0.5,
          texts: [
            '【八卦】季一藕压低声音：听说茶坊说书人又把县令断案改编成了新段子。',
            '【八卦】季一藕眨眨眼：有人在后山见到神秘大鸟衔着药包飞过。',
            '【八卦】季一藕笑道：最近医馆外排队的人里，竟有好几位是来打听姻缘的。'
          ]
        },
        {
          weight: 0.5,
          texts: [
            '【医理】季一藕提醒你：饮食贵在有节，寒热辛甘都不宜偏执。',
            '【医理】季一藕说：春养肝、夏养心、秋养肺、冬养肾，作息要顺时。',
            '【医理】季一藕叮嘱：久坐后活动经络，配合温灸，往往更能缓解疲惫。'
          ]
        }
      ]
    }
  },
  {
    id: 'xiaolongbao',
    label: '小笼包',
    matchers: [
      { type: 'exact', itemId: 'snack_xiaolongbao' }
    ],
    rewardText: '她认真和你讲了当下节气养生，还塞给你两株仙鹤草。',
    effect: {
      experience: 30,
      money: 30,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_seasonal_health_tips', 'xianhe_grass', 'xianhe_grass']
    },
    loreDrop: {
      probability: 0.3,
      pools: [
        {
          weight: 0.5,
          texts: [
            '【八卦】季一藕压低声音：听说茶坊说书人又把县令断案改编成了新段子。',
            '【八卦】季一藕眨眨眼：有人在后山见到神秘大鸟衔着药包飞过。',
            '【八卦】季一藕笑道：最近医馆外排队的人里，竟有好几位是来打听姻缘的。'
          ]
        },
        {
          weight: 0.5,
          texts: [
            '【医理】季一藕提醒你：饮食贵在有节，寒热辛甘都不宜偏执。',
            '【医理】季一藕说：春养肝、夏养心、秋养肺、冬养肾，作息要顺时。',
            '【医理】季一藕叮嘱：久坐后活动经络，配合温灸，往往更能缓解疲惫。'
          ]
        }
      ]
    }
  },
  {
    id: 'pastry',
    label: '各式糕点',
    matchers: [
      { type: 'keyword', keywords: ['糕', '饼', '酥', '点心', '包'] }
    ],
    rewardText: '她语重心长地叮嘱你养身之法，并安排了一次艾灸体验。',
    effect: {
      experience: 20,
      health: 20,
      money: 20,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_earnest_advice', 'ji_yi_ou_moxibustion_experience']
    },
    loreDrop: {
      probability: 0.3,
      pools: [
        {
          weight: 0.5,
          texts: [
            '【八卦】季一藕压低声音：听说茶坊说书人又把县令断案改编成了新段子。',
            '【八卦】季一藕眨眨眼：有人在后山见到神秘大鸟衔着药包飞过。',
            '【八卦】季一藕笑道：最近医馆外排队的人里，竟有好几位是来打听姻缘的。'
          ]
        },
        {
          weight: 0.5,
          texts: [
            '【医理】季一藕提醒你：饮食贵在有节，寒热辛甘都不宜偏执。',
            '【医理】季一藕说：春养肝、夏养心、秋养肺、冬养肾，作息要顺时。',
            '【医理】季一藕叮嘱：久坐后活动经络，配合温灸，往往更能缓解疲惫。'
          ]
        }
      ]
    }
  },
  {
    id: 'dried_snack',
    label: '其他干果零食',
    matchers: [
      { type: 'prefix', prefix: 'snack_' }
    ],
    rewardText: '她请你体验针灸调理，并送你一株仙鹤草。',
    effect: {
      health: 50,
      relationChange: { ji_yi_ou: 10 },
      itemsAdd: ['ji_yi_ou_acupuncture_experience', 'xianhe_grass']
    },
    loreDrop: {
      probability: 0.3,
      pools: [
        {
          weight: 0.5,
          texts: [
            '【八卦】季一藕压低声音：听说茶坊说书人又把县令断案改编成了新段子。',
            '【八卦】季一藕眨眨眼：有人在后山见到神秘大鸟衔着药包飞过。',
            '【八卦】季一藕笑道：最近医馆外排队的人里，竟有好几位是来打听姻缘的。'
          ]
        },
        {
          weight: 0.5,
          texts: [
            '【医理】季一藕提醒你：饮食贵在有节，寒热辛甘都不宜偏执。',
            '【医理】季一藕说：春养肝、夏养心、秋养肺、冬养肾，作息要顺时。',
            '【医理】季一藕叮嘱：久坐后活动经络，配合温灸，往往更能缓解疲惫。'
          ]
        }
      ]
    }
  }
];

// 所有 NPC 赠礼规则
export const npcGiftRules: NPCGiftRule[] = [
  {
    npcId: 'ji_yi_ou',
    npcName: '季一藕',
    description: '带着美食上门，她会随机分享八卦日常或医学常识。',
    categories: jiYiOuCategories,
    categoryOrder: ['tanghulu', 'xiaolongbao', 'pastry', 'dried_snack']
  }
];

// 获取指定 NPC 的赠礼规则
export function getNPCGiftRule(npcId: string): NPCGiftRule | undefined {
  return npcGiftRules.find(rule => rule.npcId === npcId);
}

// 检查是否有指定 NPC 的赠礼规则
export function hasNPCGiftRule(npcId: string): boolean {
  return npcGiftRules.some(rule => rule.npcId === npcId);
}
