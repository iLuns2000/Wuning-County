import { Effect } from '@/types/game';

/**
 * 季一藕医馆动物互动规则配置
 * 包含小啾（鹦鹉）和小狗的互动规则
 */

// ─────────────────────────────────────────────────────────────
// 小啾（鹦鹉）相关配置
// ─────────────────────────────────────────────────────────────

/** 小啾可教学的合法短语 */
export const BIRD_VALID_PHRASES = [
  '恭喜发财',
  '好运连连',
  '身体健康',
  '万事如意',
  '福星高照',
  '大吉大利',
  '年年有余',
  '心想事成',
  '吉星高照',
  '五福临门',
  '财源广进',
  '步步高升',
  '学富五车',
  '才高八斗',
  '智慧过人'
];

/** 脏话关键词库（用于检测） */
export const SWEAR_WORDS = [
  '笨蛋', '傻瓜', '蠢货', '白痴', '傻子', '笨蛋', '滚开', '去死', '臭', '丑'
];

/** 喂食类型 */
export type BirdFoodType = 'nut' | 'fruit';

/** 小啾喂食奖励 */
export const BIRD_FEED_REWARDS: Record<BirdFoodType, Effect> = {
  nut: {
    experience: 10,
    money: -10,
    relationChange: { ji_yi_ou: 2 }
  },
  fruit: {
    experience: 15,
    money: -10,
    relationChange: { ji_yi_ou: 3 }
  }
};

/** 逗鸟奖励 */
export const BIRD_TEASE_REWARD: Effect = {
  experience: 5,
  health: -5,
  relationChange: { ji_yi_ou: 1 }
};

// ─────────────────────────────────────────────────────────────
// 小狗相关配置
// ─────────────────────────────────────────────────────────────

/** 狗狗互动类型 */
export type DogActionType = 'pet' | 'feed' | 'bark_learn';

/** 狗狗互动动作 */
export interface DogAction {
  id: DogActionType;
  label: string;
  description: string;
  cost?: Effect;
  reward?: Effect;
}

/** 狗狗互动动作配置 */
export const DOG_ACTIONS: DogAction[] = [
  {
    id: 'pet',
    label: '抚摸',
    description: '轻轻抚摸小狗的头',
    cost: {
      health: 5
    },
    reward: {
      experience: 5,
      relationChange: { ji_yi_ou: 1 }
    }
  },
  {
    id: 'feed',
    label: '喂零食',
    description: '给小狗喂些医馆特制的小零食',
    cost: {
      money: -10
    },
    reward: {
      experience: 10,
      relationChange: { ji_yi_ou: 2 }
    }
  },
  {
    id: 'bark_learn',
    label: '学狗叫',
    description: '尝试模仿狗叫声与小狗交流',
    cost: {
      health: 10
    }
  }
];

/** 学狗叫的能力要求 */
export const DOG_BARK_ABILITY_REQUIREMENT = 80;

/** 学狗叫前 4 次的惩罚 */
export const DOG_BARK_EARLY_PENALTY: Effect = {
  reputation: -10,
  health: -10
};

/** 狗叫称号后成功概率 */
export const DOG_BARK_SUCCESS_RATE = 0.5;

/** 狗叫称号后成功奖励 */
export const DOG_BARK_SUCCESS_REWARD: Effect = {
  reputation: 30,
  money: 50
};

/** 狗叫称号后失败惩罚 */
export const DOG_BARK_FAIL_PENALTY_DAYS = 1;

// ─────────────────────────────────────────────────────────────
// 通用配置
// ─────────────────────────────────────────────────────────────

/** 触发教说话所需的喂食次数 */
export const BIRD_FEED_TO_UNLOCK_TEACH = 2;

/** 学习短语所需次数 */
export const BIRD_LEARN_REQUIRED_COUNT = 10;

/** 小啾语录最大容量 */
export const BIRD_PHRASE_MAX_CAPACITY = 20;

/** 教脏话被抓累计次数阈值（触发称号） */
export const SWEAR_CAUGHT_THRESHOLD = 3;

/** 教脏话惩罚 */
export const SWEAR_TEACH_PENALTY: Effect = {
  money: -30,
  ability: 20
};

/** 医馆禁入天数 */
export const CLINIC_BAN_DAYS = 1;

/** 动物互动通用掉落 - 仙鹤草 */
export const COMMON_DROP_XIANHE_GRASS = {
  itemId: 'xianhe_grass',
  probability: 0.7,
  count: 1
} as const;

/** 动物互动通用掉落 - 阅历 */
export const COMMON_DROP_EXPERIENCE = 10;

/** 狗叫总次数阈值（触发称号） */
export const DOG_BARK_TOTAL_FOR_TITLE = 5;

/** 称号后每日狗叫上限 */
export const DOG_BARK_DAILY_LIMIT_AFTER_TITLE = 2;

/** 逗鸟/教鸟累计次数阈值（触发称号） */
export const BIRD_TEASE_TOTAL_FOR_TITLE = 6;

/** 称号奖励：咕咕嘎 */
export const TITLE_GU_GU_GA_REWARD: Effect = {
  money: 200,
  ability: 50
};

/** 称号奖励：汪汪汪，谁家的小狗 */
export const TITLE_WANG_WANG_WANG_REWARD: Effect = {
  reputation: 100,
  money: 300
};

// ─────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────

/**
 * 检测短语是否为脏话
 */
export function isSwearWord(phrase: string): boolean {
  const lowerPhrase = phrase.toLowerCase();
  return SWEAR_WORDS.some(word => lowerPhrase.includes(word));
}

/**
 * 获取默认的医馆动物状态
 */
export function getDefaultClinicAnimalState() {
  return {
    birdFeedToday: 0,
    birdFavor: 0,
    birdTeaseOrTeachCount: 0,
    birdLearnProgress: {} as Record<string, number>,
    birdLearnedPhrases: [] as string[],
    swearTeachCaughtCount: 0,
    dogBarkPracticeTotal: 0,
    dogBarkToday: 0,
    animalInteractionBannedUntilDay: 0,
    clinicEntryBannedUntilDay: 0
  };
}
