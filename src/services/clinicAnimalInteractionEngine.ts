import { Effect, GameState, ClinicAnimalState } from '@/types/game';
import {
  BirdFoodType,
  isSwearWord,
  BIRD_FEED_REWARDS,
  BIRD_TEASE_REWARD,
  BIRD_FEED_TO_UNLOCK_TEACH,
  BIRD_LEARN_REQUIRED_COUNT,
  BIRD_PHRASE_MAX_CAPACITY,
  SWEAR_CAUGHT_THRESHOLD,
  SWEAR_TEACH_PENALTY,
  CLINIC_BAN_DAYS,
  COMMON_DROP_XIANHE_GRASS,
  COMMON_DROP_EXPERIENCE,
  DOG_BARK_ABILITY_REQUIREMENT,
  DOG_BARK_EARLY_PENALTY,
  DOG_BARK_SUCCESS_RATE,
  DOG_BARK_SUCCESS_REWARD,
  DOG_BARK_FAIL_PENALTY_DAYS,
  DOG_BARK_TOTAL_FOR_TITLE,
  DOG_BARK_DAILY_LIMIT_AFTER_TITLE,
  TITLE_GU_GU_GA_REWARD,
  TITLE_WANG_WANG_WANG_REWARD,
  BIRD_TEASE_TOTAL_FOR_TITLE,
  getDefaultClinicAnimalState
} from '@/data/clinicAnimalRules';

/**
 * 季一藕医馆动物互动引擎
 * 处理小啾和小狗的互动逻辑
 */

// ─────────────────────────────────────────────────────────────
// 引擎结果类型
// ─────────────────────────────────────────────────────────────

export interface ClinicAnimalActionResult {
  success: boolean;
  message: string;
  effect?: Effect;
  statePatch?: Partial<ClinicAnimalState>;
  unlockedTitle?: string;
  logs: string[];
}

// ─────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────

/** 获取或初始化医馆动物状态 */
function getOrInitClinicState(state: GameState): ClinicAnimalState {
  if (!state.clinicAnimals) {
    return getDefaultClinicAnimalState();
  }
  return state.clinicAnimals;
}

/** 随机判定是否掉落仙鹤草 */
function rollXianheGrassDrop(): { itemId: string; probability: number; count: number } | null {
  if (Math.random() < COMMON_DROP_XIANHE_GRASS.probability) {
    return { itemId: COMMON_DROP_XIANHE_GRASS.itemId, probability: COMMON_DROP_XIANHE_GRASS.probability, count: COMMON_DROP_XIANHE_GRASS.count };
  }
  return null;
}

/** 构建通用效果（仙鹤草+阅历） */
function buildCommonDropEffect(): Effect {
  const xianhe = rollXianheGrassDrop();
  const effect: Effect = { experience: COMMON_DROP_EXPERIENCE };
  if (xianhe) {
    effect.probabilisticItemsAdd = [xianhe];
  }
  return effect;
}

// ─────────────────────────────────────────────────────────────
// 门禁检查 API
// ─────────────────────────────────────────────────────────────

/**
 * 检查是否可以进入西林医馆
 */
export function canEnterClinic(state: GameState): { allowed: boolean; reason?: string } {
  const clinicState = getOrInitClinicState(state);
  const currentDay = state.day;

  if (clinicState.clinicEntryBannedUntilDay > currentDay) {
    const remainingDays = clinicState.clinicEntryBannedUntilDay - currentDay;
    return {
      allowed: false,
      reason: `你因「一意孤行」称号被禁止进入医馆，还需 ${remainingDays} 天才能进入。`
    };
  }

  return { allowed: true };
}

/**
 * 检查是否可以与动物互动
 */
export function canInteractAnimals(state: GameState): { allowed: boolean; reason?: string } {
  const clinicState = getOrInitClinicState(state);
  const currentDay = state.day;

  if (clinicState.animalInteractionBannedUntilDay > currentDay) {
    const remainingDays = clinicState.animalInteractionBannedUntilDay - currentDay;
    return {
      allowed: false,
      reason: `今日已禁止与动物互动，还需 ${remainingDays} 天才能互动。`
    };
  }

  return { allowed: true };
}

/**
 * 检查是否可以教小啾说话（需要先喂食 2 次）
 */
export function canTeachBird(state: GameState): { allowed: boolean; reason?: string } {
  const clinicState = getOrInitClinicState(state);

  if (clinicState.birdFeedToday < BIRD_FEED_TO_UNLOCK_TEACH) {
    return {
      allowed: false,
      reason: `需要先喂小啾 ${BIRD_FEED_TO_UNLOCK_TEACH} 次才能教它说话（还需 ${BIRD_FEED_TO_UNLOCK_TEACH - clinicState.birdFeedToday} 次）。`
    };
  }

  return { allowed: true };
}

/**
 * 检查是否可以学狗叫
 */
export function canPracticeDogBark(
  state: GameState,
  hasPatients: boolean
): { allowed: boolean; reason?: string } {
  const clinicState = getOrInitClinicState(state);
  const currentDay = state.day;

  // 检查能力要求
  if (state.playerStats.ability < DOG_BARK_ABILITY_REQUIREMENT) {
    return {
      allowed: false,
      reason: `能力值需达到 ${DOG_BARK_ABILITY_REQUIREMENT} 才能学狗叫（当前 ${state.playerStats.ability}）。`
    };
  }

  // 检查是否有患者
  if (hasPatients) {
    return {
      allowed: false,
      reason: '医馆内有患者，暂时不能学狗叫。'
    };
  }

  // 检查是否被禁
  const animalCheck = canInteractAnimals(state);
  if (!animalCheck.allowed) {
    return { allowed: false, reason: animalCheck.reason };
  }

  // 检查是否已有称号，检查次数
  const hasTitle = clinicState.dogBarkPracticeTotal >= DOG_BARK_TOTAL_FOR_TITLE;
  if (hasTitle) {
    if (clinicState.dogBarkToday >= DOG_BARK_DAILY_LIMIT_AFTER_TITLE) {
      return {
        allowed: false,
        reason: `今日已学狗叫 ${clinicState.dogBarkToday} 次，明日再来吧。`
      };
    }
  }

  return { allowed: true };
}

// ─────────────────────────────────────────────────────────────
// 互动动作 API
// ─────────────────────────────────────────────────────────────

/**
 * 喂小啾
 */
export function feedBird(
  state: GameState,
  foodType: BirdFoodType
): ClinicAnimalActionResult {
  const clinicState = getOrInitClinicState(state);
  const logs: string[] = [];

  // 获取喂食奖励
  const feedReward = BIRD_FEED_REWARDS[foodType];
  const rewardEffect = { ...feedReward };

  // 构建通用掉落
  const commonDrop = buildCommonDropEffect();
  const combinedEffect: Effect = {
    ...rewardEffect,
    experience: (rewardEffect.experience || 0) + (commonDrop.experience || 0),
    health: (rewardEffect.health || 0) + (commonDrop.health || 0),
    probabilisticItemsAdd: commonDrop.probabilisticItemsAdd
  };

  logs.push(`你给小啾喂了${foodType === 'nut' ? '坚果' : '水果'}，小啾高兴地叫了几声。`);

  const statePatch: Partial<ClinicAnimalState> = {
    birdFeedToday: clinicState.birdFeedToday + 1,
    birdFavor: clinicState.birdFavor + (foodType === 'fruit' ? 3 : 2)
  };

  return {
    success: true,
    message: logs.join('\n'),
    effect: combinedEffect,
    statePatch,
    logs
  };
}

/**
 * 逗鸟
 */
export function teaseBird(state: GameState): ClinicAnimalActionResult {
  const clinicState = getOrInitClinicState(state);
  const logs: string[] = [];

  // 构建奖励
  const rewardEffect = { ...BIRD_TEASE_REWARD };
  const commonDrop = buildCommonDropEffect();
  const combinedEffect: Effect = {
    ...rewardEffect,
    experience: (rewardEffect.experience || 0) + (commonDrop.experience || 0),
    probabilisticItemsAdd: commonDrop.probabilisticItemsAdd
  };

  // 随机逗鸟文案
  const teaseLines = [
    '你朝小啾做了个鬼脸，小啾歪着头好奇地看着你。',
    '你用手轻轻碰了碰小啾的羽毛，它蹦跳着躲开了。',
    '你对着小啾吹了声口哨，小啾扑棱着翅膀回应你。',
    '你轻轻摇晃手指吸引了小啾的注意，它跟着你的手转动脑袋。'
  ];
  const selectedLine = teaseLines[Math.floor(Math.random() * teaseLines.length)];
  logs.push(selectedLine);

  // 检查是否触发「咕咕嘎」称号
  const newTeaseCount = clinicState.birdTeaseOrTeachCount + 1;
  let unlockedTitle: string | undefined;
  if (newTeaseCount >= BIRD_TEASE_TOTAL_FOR_TITLE && clinicState.birdTeaseOrTeachCount < BIRD_TEASE_TOTAL_FOR_TITLE) {
    unlockedTitle = '咕咕嘎';
    logs.push(`【成就解锁】逗鸟/教鸟累计达 ${BIRD_TEASE_TOTAL_FOR_TITLE} 次，获得称号「咕咕嘎」！`);
    logs.push(`奖励：铜钱 +${TITLE_GU_GU_GA_REWARD.money}，能力 +${TITLE_GU_GU_GA_REWARD.ability}！`);
  }

  const statePatch: Partial<ClinicAnimalState> = {
    birdTeaseOrTeachCount: newTeaseCount
  };

  return {
    success: true,
    message: logs.join('\n'),
    effect: combinedEffect,
    statePatch,
    unlockedTitle,
    logs
  };
}

/**
 * 教小啾说话
 */
export function teachBirdPhrase(
  state: GameState,
  phrase: string
): ClinicAnimalActionResult {
  const clinicState = getOrInitClinicState(state);
  const logs: string[] = [];

  // 检查是否教会
  const isSwear = isSwearWord(phrase);

  if (isSwear) {
    // 教脏话 - 被发现！
    const newCaughtCount = clinicState.swearTeachCaughtCount + 1;

    logs.push(`小啾学着你大声喊出"${phrase}"！`);
    logs.push(`不好！季一藕听到了，皱着眉看向你...`);
    logs.push(`【惩罚】铜钱 ${SWEAR_TEACH_PENALTY.money}，能力 +${SWEAR_TEACH_PENALTY.ability}，好感 -5`);

    let unlockedTitle: string | undefined;
    let clinicBanDays = 0;

    if (newCaughtCount >= SWEAR_CAUGHT_THRESHOLD) {
      unlockedTitle = '一意孤行';
      clinicBanDays = CLINIC_BAN_DAYS;
      logs.push(`【成就解锁】教脏话被抓累计 ${SWEAR_CAUGHT_THRESHOLD} 次，获得称号「一意孤行」！`);
      logs.push(`【惩罚】未来 ${CLINIC_BAN_DAYS} 天内禁止进入西林医馆！`);
    }

    const statePatch: Partial<ClinicAnimalState> = {
      swearTeachCaughtCount: newCaughtCount,
      clinicEntryBannedUntilDay: clinicBanDays > 0 ? state.day + clinicBanDays : clinicState.clinicEntryBannedUntilDay,
      birdTeaseOrTeachCount: clinicState.birdTeaseOrTeachCount + 1
    };

    const effect: Effect = {
      money: SWEAR_TEACH_PENALTY.money,
      ability: SWEAR_TEACH_PENALTY.ability,
      relationChange: { ji_yi_ou: -5 }
    };

    return {
      success: true,
      message: logs.join('\n'),
      effect,
      statePatch,
      unlockedTitle,
      logs
    };
  }

  // 正常教学
  const currentProgress = clinicState.birdLearnProgress[phrase] || 0;
  const newProgress = currentProgress + 1;

  let learned = false;
  let forgotPhrase: string | undefined;

  if (newProgress >= BIRD_LEARN_REQUIRED_COUNT) {
    // 学会了！
    learned = true;
    logs.push(`小啾重复了${BIRD_LEARN_REQUIRED_COUNT}遍"${phrase}"，终于学会了！`);

    // 处理 FIFO 队列
    let newLearnedPhrases = [...clinicState.birdLearnedPhrases];
    if (newLearnedPhrases.length >= BIRD_PHRASE_MAX_CAPACITY) {
      forgotPhrase = newLearnedPhrases.shift();
      logs.push(`小啾忘记了最早学的"${forgotPhrase}"...`);
    }
    newLearnedPhrases.push(phrase);

    // 从学习进度中移除
    const newLearnProgress = { ...clinicState.birdLearnProgress };
    delete newLearnProgress[phrase];

    const statePatch: Partial<ClinicAnimalState> = {
      birdLearnProgress: newLearnProgress,
      birdLearnedPhrases: newLearnedPhrases,
      birdTeaseOrTeachCount: clinicState.birdTeaseOrTeachCount + 1
    };

    // 检查是否触发「咕咕嘎」称号
    const newTeaseCount = clinicState.birdTeaseOrTeachCount + 1;
    let unlockedTitle: string | undefined;
    if (newTeaseCount >= BIRD_TEASE_TOTAL_FOR_TITLE && clinicState.birdTeaseOrTeachCount < BIRD_TEASE_TOTAL_FOR_TITLE) {
      unlockedTitle = '咕咕嘎';
      logs.push(`【成就解锁】逗鸟/教鸟累计达 ${BIRD_TEASE_TOTAL_FOR_TITLE} 次，获得称号「咕咕嘎」！`);
    }

    return {
      success: true,
      message: logs.join('\n'),
      effect: { experience: 20 },
      statePatch,
      unlockedTitle,
      logs
    };
  }

  // 还在学习中
  logs.push(`你对小啾说"${phrase}"，它跟着学了一遍（${newProgress}/${BIRD_LEARN_REQUIRED_COUNT}）。`);

  const newLearnProgress = { ...clinicState.birdLearnProgress, [phrase]: newProgress };

  const statePatch: Partial<ClinicAnimalState> = {
    birdLearnProgress: newLearnProgress,
    birdTeaseOrTeachCount: clinicState.birdTeaseOrTeachCount + 1
  };

  return {
    success: true,
    message: logs.join('\n'),
    effect: { experience: 5 },
    statePatch,
    logs
  };
}

/**
 * 互动小狗
 */
export function interactDog(
  state: GameState,
  actionId: 'pet' | 'feed'
): ClinicAnimalActionResult {
  const clinicState = getOrInitClinicState(state);
  const logs: string[] = [];

  const actionConfig = {
    pet: {
      line: '你轻轻抚摸小狗的头，它舒服地闭上眼睛。',
      reward: BIRD_TEASE_REWARD
    },
    feed: {
      line: '你给小狗喂了医馆特制的小零食，它高兴地摇尾巴。',
      reward: { experience: 10, health: 5, relationChange: { ji_yi_ou: 2 } }
    }
  };

  const config = actionConfig[actionId];
  const rewardEffect = { ...config.reward };
  const commonDrop = buildCommonDropEffect();

  const combinedEffect: Effect = {
    ...rewardEffect,
    experience: (rewardEffect.experience || 0) + (commonDrop.experience || 0),
    health: (rewardEffect.health || 0) + (commonDrop.health || 0),
    probabilisticItemsAdd: commonDrop.probabilisticItemsAdd
  };

  logs.push(config.line);

  return {
    success: true,
    message: logs.join('\n'),
    effect: combinedEffect,
    logs
  };
}

/**
 * 学狗叫
 */
export function practiceDogBark(
  state: GameState,
  hasPatients: boolean
): ClinicAnimalActionResult {
  const clinicState = getOrInitClinicState(state);
  const logs: string[] = [];

  // 预检查
  const canCheck = canPracticeDogBark(state, hasPatients);
  if (!canCheck.allowed) {
    return {
      success: false,
      message: canCheck.reason || '无法学狗叫',
      logs: [canCheck.reason || '无法学狗叫']
    };
  }

  const totalBarks = clinicState.dogBarkPracticeTotal;
  const hasTitle = totalBarks >= DOG_BARK_TOTAL_FOR_TITLE;

  // 前 4 次固定惩罚
  if (totalBarks < 4) {
    logs.push('你对着小狗"汪汪"叫了两声...');
    logs.push(`【惩罚】声望 ${DOG_BARK_EARLY_PENALTY.reputation}，体力 ${DOG_BARK_EARLY_PENALTY.health}`);

    const statePatch: Partial<ClinicAnimalState> = {
      dogBarkPracticeTotal: totalBarks + 1,
      dogBarkToday: clinicState.dogBarkToday + 1
    };

    return {
      success: true,
      message: logs.join('\n'),
      effect: DOG_BARK_EARLY_PENALTY,
      statePatch,
      logs
    };
  }

  // 第 5 次 - 触发称号
  if (totalBarks === 4) {
    logs.push('你对着小狗"汪汪"叫了两声...');
    logs.push('小狗歪着头看你，突然你也觉得自己有些傻...');
    logs.push(`【成就解锁】学狗叫累计达 ${DOG_BARK_TOTAL_FOR_TITLE} 次，获得称号「汪汪汪，谁家的小狗」！`);
    logs.push(`奖励：声望 +${TITLE_WANG_WANG_WANG_REWARD.reputation}，铜钱 +${TITLE_WANG_WANG_WANG_REWARD.money}！`);

    const statePatch: Partial<ClinicAnimalState> = {
      dogBarkPracticeTotal: totalBarks + 1,
      dogBarkToday: clinicState.dogBarkToday + 1
    };

    return {
      success: true,
      message: logs.join('\n'),
      effect: TITLE_WANG_WANG_WANG_REWARD,
      statePatch,
      unlockedTitle: '汪汪汪，谁家的小狗',
      logs
    };
  }

  // 称号后 - 50% 成功率
  const success = Math.random() < DOG_BARK_SUCCESS_RATE;

  if (success) {
    logs.push('你对着小狗"汪汪"叫了两声...');
    logs.push('小狗兴奋地回应你："汪汪！"');
    logs.push(`【成功】声望 +${DOG_BARK_SUCCESS_REWARD.reputation}，铜钱 +${DOG_BARK_SUCCESS_REWARD.money}`);

    const statePatch: Partial<ClinicAnimalState> = {
      dogBarkPracticeTotal: totalBarks + 1,
      dogBarkToday: clinicState.dogBarkToday + 1
    };

    return {
      success: true,
      message: logs.join('\n'),
      effect: DOG_BARK_SUCCESS_REWARD,
      statePatch,
      logs
    };
  } else {
    logs.push('你对着小狗"汪汪"叫了两声...');
    logs.push('小狗疑惑地看了你一眼，仿佛在说：你谁？');
    logs.push(`【失败】今日已禁止动物互动。`);

    const statePatch: Partial<ClinicAnimalState> = {
      dogBarkToday: clinicState.dogBarkToday + 1,
      animalInteractionBannedUntilDay: state.day + DOG_BARK_FAIL_PENALTY_DAYS
    };

    return {
      success: true,
      message: logs.join('\n'),
      effect: {},
      statePatch,
      logs
    };
  }
}

/**
 * 获取小啾已学语录
 */
export function getBirdLearnedPhrases(state: GameState): string[] {
  const clinicState = getOrInitClinicState(state);
  return clinicState.birdLearnedPhrases;
}

/**
 * 轮播小啾语录
 */
export function playBirdPhrase(state: GameState): ClinicAnimalActionResult {
  const phrases = getBirdLearnedPhrases(state);

  if (phrases.length === 0) {
    return {
      success: false,
      message: '小啾还没有学会任何话呢。',
      logs: ['小啾还没有学会任何话呢。']
    };
  }

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const lines = [
    `小啾清脆地喊道："${randomPhrase}！${randomPhrase}！"`,
    `小啾摇头晃脑地说："${randomPhrase}..."`,
    `小啾兴奋地叫道："${randomPhrase}！${randomPhrase}！${randomPhrase}！"`,
    `小啾低声模仿："${randomPhrase}...${randomPhrase}..."`
  ];
  const selectedLine = lines[Math.floor(Math.random() * lines.length)];

  return {
    success: true,
    message: selectedLine,
    logs: [selectedLine]
  };
}

/**
 * 获取动物互动状态摘要（用于 UI 显示）
 */
export function getClinicAnimalSummary(state: GameState): {
  birdFeedToday: number;
  birdFavor: number;
  birdLearnedCount: number;
  dogBarkTotal: number;
  dogBarkToday: number;
  hasTitle_gugu_ga: boolean;
  hasTitle_wang_wang_wang: boolean;
  hasTitle_yi_yi_gu_xing: boolean;
  canTeachBird: boolean;
  canBarkToday: boolean;
  bannedUntilDay: number;
} {
  const clinicState = getOrInitClinicState(state);
  const currentDay = state.day;

  return {
    birdFeedToday: clinicState.birdFeedToday,
    birdFavor: clinicState.birdFavor,
    birdLearnedCount: clinicState.birdLearnedPhrases.length,
    dogBarkTotal: clinicState.dogBarkPracticeTotal,
    dogBarkToday: clinicState.dogBarkToday,
    hasTitle_gugu_ga: clinicState.birdTeaseOrTeachCount >= BIRD_TEASE_TOTAL_FOR_TITLE,
    hasTitle_wang_wang_wang: clinicState.dogBarkPracticeTotal >= DOG_BARK_TOTAL_FOR_TITLE,
    hasTitle_yi_yi_gu_xing: clinicState.swearTeachCaughtCount >= SWEAR_CAUGHT_THRESHOLD,
    canTeachBird: clinicState.birdFeedToday >= BIRD_FEED_TO_UNLOCK_TEACH,
    canBarkToday: clinicState.dogBarkPracticeTotal >= DOG_BARK_TOTAL_FOR_TITLE
      ? clinicState.dogBarkToday < DOG_BARK_DAILY_LIMIT_AFTER_TITLE
      : clinicState.dogBarkPracticeTotal < 4,
    bannedUntilDay: clinicState.animalInteractionBannedUntilDay
  };
}
