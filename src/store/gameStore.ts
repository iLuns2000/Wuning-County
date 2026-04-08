import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, RoleType, GameEvent, Effect, PlayerProfile, WeatherType, ApparelSlot, Pigeon, PigeonRaceType, PigeonRaceRecord, PigeonDopingTier, CountyDevelopmentPathId, ActiveDebuff, LeekGardenStats } from '@/types/game';
import { roles } from '@/data/roles';
import { randomEvents, npcEvents } from '@/data/events';
import { tasks } from '@/data/tasks';
import { policies } from '@/data/policies';
import { fortunes } from '@/data/fortunes';
import { talents } from '@/data/talents';
import { achievements } from '@/data/achievements';
import { npcs } from '@/data/npcs';
import { goods } from '@/data/goods';
import { facilities } from '@/data/facilities';
import { leekFacilities } from '@/data/leekFacilities';
import {
  LEEK_MAX_COLD_STORAGE_LEVEL,
  coldStorageExpansionCost,
  leekColdSpoilageMultiplier,
  getEffectiveLeekColdStorageLevel,
  ensureLeekSkyscraperPlot,
  LEEK_SKYSCRAPER_PLOT_ID,
  LEEK_SKYSCRAPER_VARIETY_ID,
} from '@/data/leekGardenConstants';
import { items, hairstyleItemIds, barberExclusiveHairItemIds } from '@/data/items';
import { snacks } from '@/data/snacks';
import { treasurePrices, TAX_RELIEF_EDICT_ID, PROPERTY_TAX_HALVING_GAME_DAYS } from '@/data/treasures';
import { charities } from '@/data/charities';
import { officeUpgrades } from '@/data/officeUpgrades';
import { countyDevelopmentPaths, getCountyDevelopmentPath } from '@/data/countyDevelopmentPaths';
import { getJiYiOuGiftCategory, getJiYiOuGiftReward, rollJiYiOuLoreDrop } from '@/data/npcGiftRules';
import { buildGiftOutcome } from '@/services/npcGiftInteractionEngine';
import { hasNPCGiftRule } from '@/data/npcGiftInteractionRules';
import { debuffConfigs, getDebuffConfig } from '@/data/debuffs';
import {
  feedBird,
  teaseBird,
  teachBirdPhrase,
  interactDog,
  practiceDogBark,
  playBirdPhrase,
  canEnterClinic,
  canInteractAnimals,
  canTeachBird,
  canPracticeDogBark,
  getClinicAnimalSummary,
  getBirdLearnedPhrases,
  ClinicAnimalActionResult
} from '@/services/clinicAnimalInteractionEngine';
import { getDefaultClinicAnimalState } from '@/data/clinicAnimalRules';
import { BirdFoodType } from '@/data/clinicAnimalRules';
import { checkEventTriggerCondition } from '@/utils/eventConditions';

// Weather System Helper
const SEASON_LENGTH = 90;
const SEASONS = ['春', '夏', '秋', '冬'] as const;
// 辅助函数：inventory Record 增加物品
const invAdd = (inv: Record<string, number>, itemId: string, count = 1): Record<string, number> => {
  return { ...inv, [itemId]: (inv[itemId] || 0) + count };
};

// 辅助函数：inventory Record 移除一个物品（减少1个数量）
const invRemoveOne = (inv: Record<string, number>, itemId: string): Record<string, number> => {
  const cur = inv[itemId] || 0;
  if (cur <= 1) {
    const next = { ...inv };
    delete next[itemId];
    return next;
  }
  return { ...inv, [itemId]: cur - 1 };
};

// 辅助函数：inventory Record 移除指定数量
const invRemoveN = (inv: Record<string, number>, itemId: string, count: number): Record<string, number> => {
  const cur = inv[itemId] || 0;
  const next = Math.max(0, cur - count);
  if (next === 0) {
    const result = { ...inv };
    delete result[itemId];
    return result;
  }
  return { ...inv, [itemId]: next };
};

// 辅助函数：检查 inventory 中是否有某物品
const invHas = (inv: Record<string, number>, itemId: string): boolean => (inv[itemId] || 0) > 0;

const defaultLeekGardenStats = (): LeekGardenStats => ({
  totalHarvestedLeek: 0,
  totalSoldLeekUnits: 0,
  leekRevenueToday: 0,
  bestLeekRevenueOneDay: 0,
  maxQualityAtHarvest: 0,
  anyFacilityPurchased: false,
});

// 数据迁移辅助函数：将旧格式 inventory (string[]) 转换为新格式 (Record<string, number>)
// 返回 null 表示无需迁移（已是新格式）
export const migrateInventoryToRecord = (inventory: any): { result: Record<string, number>; migrated: boolean } => {
  if (Array.isArray(inventory)) {
    // 旧格式：string[]，需要迁移
    const record: Record<string, number> = {};
    (inventory as string[]).forEach((id) => {
      record[id] = (record[id] || 0) + 1;
    });
    return { result: record, migrated: true };
  }
  if (inventory && typeof inventory === 'object') {
    // 已是新格式
    return { result: inventory as Record<string, number>, migrated: false };
  }
  return { result: {}, migrated: false };
};


export const getDateInfo = (day: number) => {
  const adjustedDay = day - 1;
  const year = Math.floor(adjustedDay / (SEASON_LENGTH * 4)) + 1;
  const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
  const dayOfSeason = (adjustedDay % SEASON_LENGTH) + 1;

  return {
    year,
    season: SEASONS[seasonIndex],
    seasonIndex, // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
    dayOfSeason
  };
};


const applyDevelopmentMultiplier = (value: number, positiveMultiplier: number = 1, negativeMultiplier: number = 1) => {
  if (value > 0) return Math.floor(value * positiveMultiplier);
  if (value < 0) return Math.ceil(value * negativeMultiplier);
  return value;
};

type RelationPenaltyEffect = {
  money?: number;
  reputation?: number;
  ability?: number;
  health?: number;
  experience?: number;
};

type RelationPenalty = {
  threshold: number;
  flag: string;
  effect: RelationPenaltyEffect;
  message: string;
};

const npcFactions = [
  { id: 'yamen', members: ['lou_xianling', 'qi_jiu', 'xiao_zhou'] },
  { id: 'medical', members: ['song_songsheng', 'san_yue', 'mingyue_qingfeng', 'xiao_he'] },
  { id: 'craft', members: ['wuyan', 'guan_yuhe', 'baizhou', 'luhua'] },
  { id: 'commerce', members: ['yun_xi_npc', 'feng_ge', 'ye_xiao', 'shisanyue'] },
  { id: 'neighbors', members: ['lao_li', 'lao_zhang', 'vimi'] },
  { id: 'tea', members: ['cha_du', 'qian_xiaolu', 'ying_yue', 'wan_lai_qiu'] }
];

const negativeRelationPenalties: RelationPenalty[] = [
  {
    threshold: -20,
    flag: 'low',
    effect: { reputation: -5, money: -5 },
    message: '【嫌隙】{name}在坊间散布冷言，声望下降。'
  },
  {
    threshold: -50,
    flag: 'deep',
    effect: { reputation: -10, money: -20, health: -5 },
    message: '【反噬】{name}处处刁难，你付出了额外代价。'
  }
];

const resolveRelationPenalties = (state: GameState, npcId: string, previousRelation: number, newRelation: number) => {
  let moneyChange = 0;
  let reputationChange = 0;
  let abilityChange = 0;
  let healthChange = 0;
  let experienceChange = 0;
  const messages: string[] = [];
  const flags: string[] = [];
  const events: GameEvent[] = [];

  const npc = npcs.find(n => n.id === npcId);
  const name = npc ? npc.name : npcId;

  negativeRelationPenalties.forEach(penalty => {
    const flagKey = `npc_relation_penalty_${penalty.flag}_${npcId}`;
    const alreadyTriggered = state.flags[flagKey];
    if (!alreadyTriggered && previousRelation > penalty.threshold && newRelation <= penalty.threshold) {
      if (penalty.effect.money) moneyChange += penalty.effect.money;
      if (penalty.effect.reputation) reputationChange += penalty.effect.reputation;
      if (penalty.effect.ability) abilityChange += penalty.effect.ability;
      if (penalty.effect.health) healthChange += penalty.effect.health;
      if (penalty.effect.experience) experienceChange += penalty.effect.experience;
      messages.push(penalty.message.replace('{name}', name));
      flags.push(flagKey);
      if (penalty.flag === 'low') {
        const event = buildFactionRippleEvent(npcId);
        if (event) events.push(event);
      }
      if (penalty.flag === 'deep') {
        events.push(buildRedemptionEvent(npcId, 1));
      }
    }
  });

  return {
    moneyChange,
    reputationChange,
    abilityChange,
    healthChange,
    experienceChange,
    messages,
    flags,
    events
  };
};

const getFactionMembers = (npcId: string) => {
  const faction = npcFactions.find(group => group.members.includes(npcId));
  if (!faction) return [];
  return faction.members.filter(id => id !== npcId);
};

const buildFactionRippleEvent = (npcId: string): GameEvent | null => {
  const members = getFactionMembers(npcId);
  if (members.length === 0) return null;
  const npc = npcs.find(n => n.id === npcId);
  const name = npc ? npc.name : npcId;

  const hardChange: Record<string, number> = {};
  const softChange: Record<string, number> = {};
  members.forEach(id => {
    hardChange[id] = -4;
    softChange[id] = -1;
  });

  return {
    id: `faction_backlash_${npcId}_${Date.now()}`,
    title: '派系连坐',
    description: `你与${name}结怨，相关圈子开始对你冷眼相待。`,
    type: 'npc',
    options: [
      {
        label: '登门解释(20文)',
        message: `你四处解释，与${name}相关的人对你的不满稍有缓解。`,
        effect: { money: -20, relationChange: softChange }
      },
      {
        label: '置之不理',
        message: `你不愿解释，流言愈演愈烈。`,
        effect: { relationChange: hardChange }
      }
    ]
  };
};

const buildRedemptionEvent = (npcId: string, stage: 1 | 2): GameEvent => {
  const npc = npcs.find(n => n.id === npcId);
  const name = npc ? npc.name : npcId;

  if (stage === 1) {
    return {
      id: `redemption_stage1_${npcId}_${Date.now()}`,
      title: '赎罪·赔礼',
      description: `你与${name}的矛盾已传开，是时候想个补救之法。`,
      type: 'npc',
      options: [
        {
          label: '备礼上门(30文)',
          message: `你带着薄礼登门赔罪，${name}神色稍缓。`,
          effect: { money: -30, relationChange: { [npcId]: 10 }, flagsIncrement: [`redemption_stage2_${npcId}`] }
        },
        {
          label: '登门道歉',
          message: `你郑重道歉，${name}勉强应下。`,
          effect: { reputation: -2, relationChange: { [npcId]: 6 }, flagsIncrement: [`redemption_stage2_${npcId}`] }
        },
        {
          label: '置之不理',
          message: `你选择冷处理，裂痕进一步扩大。`,
          effect: { relationChange: { [npcId]: -5 } }
        }
      ]
    };
  }

  return {
    id: `redemption_stage2_${npcId}_${Date.now()}`,
    title: '赎罪·补偿',
    description: `${name}提出一项补偿要求，愿意给你挽回的机会。`,
    type: 'npc',
    options: [
      {
        label: '亲自帮忙(体力-15)',
        message: `你亲自出力补偿，${name}态度缓和。`,
        effect: { health: -15, relationChange: { [npcId]: 15 }, reputation: 5, flagsSet: { [`redemption_done_${npcId}`]: true } }
      },
      {
        label: '银两补偿(80文)',
        message: `你用银两补偿损失，${name}接受了你的诚意。`,
        effect: { money: -80, relationChange: { [npcId]: 20 }, reputation: 3, flagsSet: { [`redemption_done_${npcId}`]: true } }
      },
      {
        label: '拖延',
        message: `你迟迟不肯补偿，${name}更加不满。`,
        effect: { relationChange: { [npcId]: -5 } }
      }
    ]
  };
};

// ── 赛鸽纯函数 ────────────────────────────────────────────
const clampStat = (v: number) => Math.max(1, Math.min(100, v));

const getWeatherRaceRiskModifier = (weather: WeatherType) => {
  switch (weather) {
    case 'rain_heavy':
    case 'snow_heavy':
      return { lostBonus: 0.10, injuryBonus: 0.05, speedPenalty: 0.15 };
    case 'rain_light':
    case 'snow_light':
      return { lostBonus: 0.05, injuryBonus: 0.02, speedPenalty: 0.08 };
    default: // sunny / cloudy
      return { lostBonus: 0.02, injuryBonus: 0.01, speedPenalty: 0 };
  }
};

/** 灰市补剂档位配置（与设计文档 3 档对齐，抽象命名） */
const PIGEON_DOPING_TIERS: Record<
  PigeonDopingTier,
  {
    label: string;
    cost: number;
    baseCatch: number;
    metabolicAdd: number;
    postFatigue: number;
  }
> = {
  1: { label: '速燃剂', cost: 60, baseCatch: 0.08, metabolicAdd: 8, postFatigue: 20 },
  2: { label: '强效剂', cost: 120, baseCatch: 0.18, metabolicAdd: 16, postFatigue: 35 },
  3: { label: '禁忌剂', cost: 220, baseCatch: 0.35, metabolicAdd: 28, postFatigue: 0 },
};

const isBadWeatherForDopingInspection = (weather: WeatherType) =>
  weather === 'rain_heavy' || weather === 'snow_heavy' || weather === 'rain_light' || weather === 'snow_light';

const isPigeonBoosterUnlocked = (state: Pick<GameState, 'flags' | 'pigeonBoosterUnlocked'>) =>
  !!state.pigeonBoosterUnlocked || !!state.flags?.pigeon_booster_unlocked;

type CalcPigeonRaceScoreOpts = {
  boosterTier?: PigeonDopingTier;
  rng?: () => number;
};

const calcPigeonRaceScore = (
  pigeon: Pigeon,
  raceType: PigeonRaceType,
  weather: WeatherType,
  opts?: CalcPigeonRaceScoreOpts
): number => {
  const rng = opts?.rng ?? Math.random;
  const tier = opts?.boosterTier;
  const metabolicDamage = pigeon.metabolicDamage ?? 0;
  const speedDebuff = (pigeon.speedDebuffDaysLeft ?? 0) > 0 ? (pigeon.speedDebuffAmount ?? 0) : 0;

  let speed = pigeon.stats.speed + (tier === 1 ? 8 : tier === 2 ? 14 : tier === 3 ? 22 : 0);
  let endurance = pigeon.stats.endurance + (tier === 2 ? 10 : tier === 3 ? 16 : 0);
  let courage = pigeon.stats.courage + (tier === 1 ? 6 : 0);
  speed = clampStat(speed - speedDebuff);
  endurance = clampStat(endurance);
  courage = clampStat(courage);
  const { homing } = pigeon.stats;

  const modifier = getWeatherRaceRiskModifier(weather);
  const fatiguePenalty = Math.max(0, pigeon.fatigue - 40) * 0.4;
  const damagePenalty = metabolicDamage * 0.15;
  let base: number;
  if (raceType === 'sprint') {
    base = speed * 0.5 + endurance * 0.2 + homing * 0.2 + courage * 0.1;
  } else {
    base = endurance * 0.5 + homing * 0.3 + speed * 0.1 + courage * 0.1;
  }
  const noise = (rng() - 0.5) * 20;
  return Math.max(0, base * (1 - modifier.speedPenalty) - fatiguePenalty - damagePenalty + noise);
};

/** 禁忌剂：名次档位提升一档（向更前一名靠拢，最好为第 1） */
const rollRaceRank = (score: number, rng: () => number, tier3Boost?: boolean): number => {
  let rank: number;
  if (score >= 70) rank = rng() < 0.7 ? 1 : 2;
  else if (score >= 55) rank = rng() < 0.5 ? 2 : (rng() < 0.5 ? 1 : 3);
  else if (score >= 42) rank = 3;
  else rank = Math.min(8, Math.floor(4 + rng() * 5));
  if (tier3Boost && rank > 1) rank -= 1;
  return rank;
};

const calcRaceReward = (
  raceType: PigeonRaceType,
  rank: number
): { money: number; reputation: number } => {
  const table: Record<PigeonRaceType, Record<number, { money: number; reputation: number }>> = {
    sprint: {
      1: { money: 80, reputation: 12 },
      2: { money: 45, reputation: 6 },
      3: { money: 20, reputation: 2 },
    },
    endurance: {
      1: { money: 130, reputation: 18 },
      2: { money: 70, reputation: 9 },
      3: { money: 30, reputation: 3 },
    },
  };
  return table[raceType][rank] ?? { money: 0, reputation: 0 };
};
// ─────────────────────────────────────────────────────────

const generateWeather = (seasonIndex: number): WeatherType => {
  const rand = Math.random();

  // Probabilities based on season
  switch (seasonIndex) {
    case 0: // Spring
      if (rand < 0.5) return 'sunny';
      if (rand < 0.7) return 'cloudy';
      if (rand < 0.9) return 'rain_light';
      return 'rain_heavy';
    case 1: // Summer
      if (rand < 0.4) return 'sunny';
      if (rand < 0.5) return 'cloudy';
      if (rand < 0.7) return 'rain_light';
      return 'rain_heavy';
    case 2: // Autumn
      if (rand < 0.6) return 'sunny';
      if (rand < 0.8) return 'cloudy';
      if (rand < 0.95) return 'rain_light';
      return 'rain_heavy';
    case 3: // Winter
      if (rand < 0.4) return 'cloudy';
      if (rand < 0.6) return 'sunny';
      if (rand < 0.8) return 'snow_light';
      return 'snow_heavy';
    default:
      return 'sunny';
  }
};

interface GameStore extends GameState {
  currentEvent: GameEvent | null;
  eventQueue: GameEvent[];
  isGameOver: boolean;
  marketState: 'normal' | 'undercut' | 'cooperative' | 'boom' | 'crash';

  startGame: (roleId: RoleType) => void;
  nextDay: () => void;
  handleEventOption: (effect?: Effect, message?: string, addDebuffIds?: string[]) => void;
  addLog: (message: string) => void;
  triggerEvent: () => void;
  triggerSpecificEvent: (eventId: string) => void;
  dismissEvent: () => void;
  resetGame: () => void;
  checkTaskCompletion: () => void;
  handleTaskAction: () => void;
  incrementGiftFailure: (npcId: string) => void;
  resetGiftFailure: (npcId: string) => void;
  incrementDailyCount: (type: 'work' | 'rest') => void;
  setPolicy: (policyId: string) => void;
  cancelPolicy: () => void;
  divineFortune: () => void;

  // UI State for Achievements
  latestUnlockedAchievementId?: string;

  // Explore State
  isExploring: boolean;
  exploreResult: {
    money: number;
    reputation: number;
    itemId?: string;
    message?: string;
  } | null;

  // Market Price Locks
  priceLocks: Record<string, { endDay: number, minPriceMultiplier: number }>;
  dailyPurchasedGoods: string[]; // Track goods bought today
  hasInteractedToday: boolean;
  markInteraction: () => void;

  // Market & Economy
  buyGood: (goodId: string, quantity: number) => void;
  sellGood: (goodId: string, quantity: number) => void;

  // Facility Methods
  buyFacility: (facilityId: string) => void;
  buyLeekFacility: (id: string, cost?: number) => void;

  // Loan Methods
  loan: (amount: number) => void;
  repayLoan: (amount: number) => void;

  // Talent & Achievement Methods
  upgradeTalent: (talentId: string) => void;
  checkAchievements: () => void;

  // NPC Interaction Methods
  interactWithNPC: (npcId: string, type: 'gift' | 'chat' | 'action' | 'loan' | 'work') => { success: boolean; message: string };
  giftItemToNpc: (npcId: string, itemId: string) => { success: boolean; message: string };
  giftFoodToJiYiOu: (itemId: string) => { success: boolean; message: string };
  checkVoiceStatus: () => boolean;

  // 季一藕医馆动物互动 Methods
  feedClinicBird: (foodType: BirdFoodType) => { success: boolean; message: string };
  teaseClinicBird: () => { success: boolean; message: string };
  teachClinicBirdPhrase: (phrase: string) => { success: boolean; message: string };
  interactClinicDog: (actionId: 'pet' | 'feed') => { success: boolean; message: string };
  practiceClinicDogBark: (hasPatients: boolean) => { success: boolean; message: string };
  playClinicBirdPhrase: () => { success: boolean; message: string };
  getClinicAnimalStatus: () => ReturnType<typeof getClinicAnimalSummary>;
  canEnterClinic: () => { allowed: boolean; reason?: string };
  canInteractClinicAnimals: () => { allowed: boolean; reason?: string };
  canTeachClinicBird: () => { allowed: boolean; reason?: string };
  canPracticeClinicDogBark: (hasPatients: boolean) => { allowed: boolean; reason?: string };

  // Profile Methods
  setPlayerProfile: (profile: Partial<PlayerProfile>) => void;
  setIsMoGuRenaming: (value: boolean) => void;

  // Time Methods
  updateTimeSettings: (settings: Partial<import('@/types/game').TimeSettings>) => void;
  resetDayTimer: () => void;
  togglePause: (paused: boolean) => void;

  // Developer Mode Methods
  updateStats: (updates: Partial<GameState>) => void;

  // Achievement Actions
  dismissAchievementPopup: () => void;

  // Activity Popup Actions
  setActivityPopup: (activity: { id: string; title?: string; content?: string; imageUrl: string; imageAlt?: string; linkUrl?: string; } | null) => void;
  dismissActivityPopup: (activityId: string, contentHash: string) => void;

  // Explore Actions
  performExplore: () => void;
  fillCave: () => void;

  // Save/Load Methods
  exportSave: () => { url: string; filename: string };
  exportSaveString: () => string; // New method for clipboard export
  importSave: (data: string) => boolean;
  saveToFile: () => Promise<boolean>;
  shareSave: () => Promise<boolean>;

  // Sound Settings
  soundEnabled: boolean;
  volume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;

  // Haptic Settings
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;

  // Background Settings
  showBackgroundImage: boolean;
  setShowBackgroundImage: (show: boolean) => void;
  
  // Glass Effect Settings
  glassEffectEnabled: boolean;
  setGlassEffectEnabled: (enabled: boolean) => void;

  plantLeek: (plotId: number, variety: { id: string; growthTicks: number; baseYield: number; baseQuality: number; toughness?: number }) => void;
  waterLeek: (plotId: number) => void;
  fertilizeLeek: (plotId: number) => void;
  harvestLeek: (plotId: number) => void;
  processLeek: () => void;
  submitLeekOrder: (orderId: string) => void;

  // Item Methods
  buyItem: (itemId: string, cost: number) => void;
  useItem: (itemId: string) => void;
  equipApparel: (slot: ApparelSlot, itemId: string) => void;
  unequipApparel: (slot: ApparelSlot) => void;
  randomizeHairStyle: () => { success: boolean; hairItemId?: string; hairName?: string; isNew: boolean; };
  equipAccessory: (itemId: string) => void;
  unequipAccessory: (itemId: string) => void;

  // Gold Sinks
  buyTreasure: (treasureId: string) => void;
  performCharity: (charityId: string) => void;

  // Disaster Relief
  donateDisasterRelief: (type: 'grain' | 'cloth', amount: number) => void;

  // Office Upgrades
  startUpgradeOffice: () => void;
  speedUpUpgrade: (type: 'free' | 'item' | 'ad', value: number) => void;
  completeUpgrade: () => void;
  checkUpgradeStatus: () => void;
  cancelUpgradeOffice: () => void;
  setCountyDevelopmentPath: (pathId: CountyDevelopmentPathId) => void;
  maintainCountyDefense: () => void;
  processResourceTick: () => void;

  // 自动巡逻系统
  buyAutoPatrol: () => { success: boolean; message: string };

  // 赛鸽系统
  buyPigeon: (name?: string) => void;
  renamePigeon: (id: string, name: string) => void;
  trainPigeon: (id: string, mode: 'speed' | 'endurance' | 'homing') => void;
  enterPigeonRace: (id: string, raceType: PigeonRaceType) => void;
  usePigeonBooster: (pigeonId: string, tier: PigeonDopingTier) => void;
  selectPigeon: (id?: string) => void;
  /** 处置鸽舍中的鸽子：炖汤得物品 / 售卖 100 文 / 免费放生 */
  releasePigeon: (id: string, mode: 'soup' | 'sell' | 'free') => void;
  dismissRaidAlert: () => void;

  // Debuff 系统
  addDebuff: (id: string, source?: string) => void;
  removeDebuff: (id: string, reason?: string) => void;
  tickDebuffsPerDay: () => { logs: string[]; economyDelta: number; orderDelta: number; cultureDelta: number; livelihoodDelta: number; moneyDelta: number; reputationDelta: number; facilityIncomeMultiplier: number; cultureGainMultiplier: number };
  checkDebuffTriggers: () => void;
  tryClearDebuff: (id: string, methodId: string) => { success: boolean; message: string };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      role: null,
      day: 1,
      weather: 'sunny', // Default weather
      // Sound Defaults
      soundEnabled: true,
      volume: 0.5,
      // Haptic Defaults
      vibrationEnabled: true,
      // Background Defaults
      showBackgroundImage: true,
      // Glass Effect Defaults
      glassEffectEnabled: true,
      officeState: { level: 1, isUpgrading: false },
      countyDevelopment: { currentPath: 'none', lastSwitchedDay: 1 },
      externalThreat: { banditThreat: 15, defense: 40, warRisk: 5, lastRaidDay: 0 },
      timeSettings: {
        dayDurationSeconds: 300, // 5 minutes default
        isTimeFlowEnabled: true,
        dayStartTime: Date.now(),
        isPaused: false,
        mobileToastSeconds: 1.5,
      },
      playerProfile: { name: '无名', avatar: '' },
      playerStats: { money: 0, reputation: 0, ability: 0, health: 100, experience: 0, accuracy: 0, debt: 0 },
      countyStats: { economy: 50, order: 50, culture: 50, livelihood: 50 },
      dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0, caveFilled: false, pigeonRace: 0, pigeonBooster: 0, extraDefenseCount: 0 },
      npcInteractionStates: {},
      isVoiceLost: false,
      isMoGuRenaming: false,
      collectedScrolls: [],
      inventory: {},
      equippedApparel: {},
      equippedAccessories: [],
      flags: {},
      npcRelations: {},
      logs: [],
      currentEvent: null,
      eventQueue: [],
      isGameOver: false,
      marketState: 'normal',
      currentTaskId: undefined,
      completedTaskIds: [],
      giftFailureCounts: {},
      talents: {},
      achievements: [],
      latestUnlockedAchievementId: undefined, // Init UI state
      isExploring: false,
      exploreResult: null,
      priceLocks: {},
      dailyPurchasedGoods: [],
      hasInteractedToday: false,
      marketPrices: goods.reduce((acc, good) => ({ ...acc, [good.id]: good.basePrice }), {}),
      marketInventory: goods.reduce((acc, good) => ({ ...acc, [good.id]: Math.floor(Math.random() * 51) + 50 }), {}),
      ownedGoods: {},
      ownedFacilities: {},
      leekPlots: [
        { id: 1, pest: 0, ready: false, fertility: 100 },
        { id: 2, pest: 0, ready: false, fertility: 100 },
        { id: 3, pest: 0, ready: false, fertility: 100 },
        { id: LEEK_SKYSCRAPER_PLOT_ID, pest: 0, ready: false, fertility: 100 },
      ],
      leekFacilities: {},
      leekOrders: [],
      leekColdStorageLevel: 0,
      leekGardenStats: defaultLeekGardenStats(),
      disasterState: { type: 'none', active: false, duration: 0, lastTriggerDay: 0 },
      // 赛鸽系统初始状态
      pigeons: [],
      pigeonRaceHistory: [],
      selectedPigeonId: undefined,
      pigeonBoosterUnlocked: false,
      pendingDoping: null,
      dopingStreak: 0,
      lastPlayerDopingDay: 0,
      pigeonDopingCaughtDays: [],
      pigeonBoosterLockUntilDay: undefined,
      pigeonCleanWinStreak: 0,
      propertyTaxHalvingDaysLeft: undefined,

      // Debuff 系统初始状态
      activeDebuffs: [],
      lastDebuffCheckDay: 0,

      // 季一藕医馆动物互动初始状态
      clinicAnimals: getDefaultClinicAnimalState(),

      // 活动弹窗初始状态
      activityPopup: null,
      dismissedActivities: {},

      markInteraction: () => {
        const state = get();
        if (!state.hasInteractedToday) {
          set({ hasInteractedToday: true });
        }
      },

      dismissAchievementPopup: () => set({ latestUnlockedAchievementId: undefined }),

      setActivityPopup: (activity) => set({ activityPopup: activity }),
      dismissActivityPopup: (activityId, contentHash) => {
        set((state) => ({
          dismissedActivities: {
            ...state.dismissedActivities,
            [activityId]: contentHash,
          },
          activityPopup: null,
        }));
      },

      performExplore: () => {
        set({ isExploring: true, exploreResult: null });

        const state = get();
        let failChance = 0.1;

        // If cave has been filled today, reduce fail chance to 0
        if (state.dailyCounts.caveFilled) {
          failChance = 0;
        }

        // Ability reduction: 1 point = 0.01% = 0.0001
        failChance -= state.playerStats.ability * 0.0001;

        // Fortune modifier
        if (state.fortuneLevel === 'great_blessing') {
          failChance = 0;
        } else if (state.fortuneLevel === 'blessing') {
          failChance -= 0.05;
        } else if (state.fortuneLevel === 'bad_luck') {
          failChance += 0.05;
        } else if (state.fortuneLevel === 'terrible_luck') {
          failChance += 0.10;
        }

        failChance = Math.max(0, Math.min(1, failChance));

        if (Math.random() < failChance) {
          const failMessage = '你在出城探险的路上掉入了一个莫名其妙的洞，上面写着惊鹊的盗洞…………费了九牛二虎之力爬上去之后灰溜溜的回家了，嘴里喊着下次别让我碰到！不然让我烤了你';
          get().addLog('【探险】出师不利，空手而归。');

          set(state => ({
            dailyCounts: {
              ...state.dailyCounts,
              explore: (state.dailyCounts.explore || 0) + 1
            },
            exploreResult: { money: 0, reputation: 0, message: failMessage },
          }));

          // Simulate delay same as success
          setTimeout(() => {
            set({ isExploring: false });
          }, 2000);
          return;
        }

        // Random rewards
        let money = Math.floor(Math.random() * 50) + 10; // 10-60 money
        const reputation = Math.floor(Math.random() * 10) + 5; // 5-15 reputation
        let itemId: string | undefined = undefined;
        let healthChange = 0;
        let extraMessage = '';
        const droppedItems: string[] = [];

        // 60% chance to find Wood (1-3)
        if (Math.random() < 0.6) {
          const count = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < count; i++) droppedItems.push('wood');
          extraMessage += ` 拾得${count}根木头。`;
        }

        // 60% chance to find Stone (1-3)
        if (Math.random() < 0.6) {
          const count = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < count; i++) droppedItems.push('stone');
          extraMessage += ` 拾得${count}块石头。`;
        }

        // INCREASED DROP RATE: 25% chance to get an item (was 15%)
        if (Math.random() < 0.25) {
          const pool = ['lovesickness_tablet', 'wolf_claw', 'goose_feather', 'holy_water'];
          itemId = pool[Math.floor(Math.random() * pool.length)];
          droppedItems.push(itemId);
        }

        // 40% chance to find forging material (single piece)
        if (Math.random() < 0.4) {
          const materialPool = [
            'metal_xuantie_mixed',
            'metal_xuantie_pure',
            'metal_hanyue_mixed',
            'metal_hanyue_pure',
            'metal_chitong_mixed',
            'metal_chitong_pure',
            'wood_lingxi_core',
            'wood_jinsong',
            'wood_niujin'
          ];
          const mat = materialPool[Math.floor(Math.random() * materialPool.length)];
          droppedItems.push(mat);
          const matName = items.find(i => i.id === mat)?.name || '材料';
          extraMessage += ` 捡得一份${matName}。`;
        }

        if (Math.random() < 0.01) {
          const pool = ['construction_order'];
          itemId = pool[Math.floor(Math.random() * pool.length)];
          droppedItems.push(itemId);
        }

        // NEGATIVE BUFFS/EVENTS
        // 30% chance to encounter a minor setback
        if (Math.random() < 0.3) {
          const setbacks = [
            { msg: '但不小心摔了一跤，擦破了皮。', health: -5, money: 0 },
            { msg: '回来的路上遇到了剪径的强盗，破财消灾。', health: 0, money: -20 },
            { msg: '为了躲避野兽，跑得气喘吁吁。', health: -10, money: 0 },
            { msg: '不慎遗失了一些零钱。', health: 0, money: -10 }
          ];
          const setback = setbacks[Math.floor(Math.random() * setbacks.length)];
          extraMessage += ` ${setback.msg}`;
          healthChange = setback.health;
          money += setback.money;
        }

        const effect: Effect = {
          money,
          reputation,
          health: healthChange,
          itemsAdd: droppedItems.length > 0 ? droppedItems : undefined,
        };

        // Check for "Night Rain Jianghu" achievement
        if (state.weather === 'rain_heavy') {
          if (!invHas(state.inventory, 'cursed_sword')) {
            effect.itemsAdd = effect.itemsAdd ? [...effect.itemsAdd, 'cursed_sword'] : ['cursed_sword'];
          }
        }

        // Apply rewards
        get().handleEventOption(effect);

        // Increment explore count
        set(state => ({
          dailyCounts: {
            ...state.dailyCounts,
            explore: (state.dailyCounts.explore || 0) + 1
          },
          exploreResult: {
            money,
            reputation,
            itemId,
            message: extraMessage ? `探索归来。${extraMessage}` : undefined
          },
        }));

        setTimeout(() => {
          set({ isExploring: false });
        }, 2000); // Sync with UI delay
      },

      buyGood: (goodId, quantity) => {
        const state = get();
        let price = state.marketPrices[goodId];
        if (state.marketState === 'cooperative') {
          price = Math.ceil(price * 1.1);
        }
        const highRelationsCount = Object.values(state.npcRelations).filter(r => r > 50).length;
        const discount = Math.min(0.2, highRelationsCount * 0.02);
        price = Math.floor(price * (1 - discount));
        const cost = price * quantity;

        // Check market inventory
        const currentStock = state.marketInventory[goodId] || 0;
        if (currentStock < quantity) {
          state.addLog(`市场库存不足，仅剩 ${currentStock} 个。`);
          return;
        }

        if (state.playerStats.money < cost) {
          state.addLog('资金不足，无法购买。');
          return;
        }
        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
          dailyPurchasedGoods: state.dailyPurchasedGoods.includes(goodId) ? state.dailyPurchasedGoods : [...state.dailyPurchasedGoods, goodId],
          ownedGoods: {
            ...state.ownedGoods,
            [goodId]: (state.ownedGoods[goodId] || 0) + quantity
          },
          marketInventory: {
            ...state.marketInventory,
            [goodId]: (state.marketInventory[goodId] || 0) - quantity
          }
        }));
        get().addLog(`【市集】花费 ${cost} 文买入 ${quantity} 个${goods.find(g => g.id === goodId)?.name}。`);
      },

      sellGood: (goodId, quantity) => {
        const state = get();
        const currentQty = state.ownedGoods[goodId] || 0;

        if (currentQty < quantity) {
          state.addLog('库存不足，无法出售。');
          return;
        }

        let price = state.marketPrices[goodId];
        if (state.marketState === 'undercut') {
          price = Math.floor(price * 0.7);
          get().addLog('【市集】遭遇商贩恶意压价，售价大跌。');
        } else if (state.marketState === 'cooperative') {
          price = Math.floor(price * 1.1);
        }
        const earnings = price * quantity;

        set(state => {
          const base = state.leekGardenStats ?? defaultLeekGardenStats();
          let leekGardenStats = base;
          if (goodId === 'leek') {
            leekGardenStats = {
              ...base,
              totalSoldLeekUnits: base.totalSoldLeekUnits + quantity,
              leekRevenueToday: base.leekRevenueToday + earnings,
            };
          } else if (goodId === 'leek_box') {
            leekGardenStats = {
              ...base,
              leekRevenueToday: base.leekRevenueToday + earnings,
            };
          }
          return {
            playerStats: { ...state.playerStats, money: state.playerStats.money + earnings },
            ownedGoods: {
              ...state.ownedGoods,
              [goodId]: currentQty - quantity,
            },
            leekGardenStats,
          };
        });
        get().addLog(`【市集】出售 ${quantity} 个${goods.find(g => g.id === goodId)?.name}，获得 ${earnings} 文。`);
        if (goodId === 'leek' || goodId === 'leek_box') {
          get().checkAchievements();
        }
      },

      buyFacility: (facilityId) => {
        const state = get();
        const facility = facilities.find(f => f.id === facilityId);
        if (!facility) return;

        const currentCount = state.ownedFacilities[facilityId] || 0;

        // Resource Facility Logic (Upgrade System)
        if (facility.type === 'resource') {
          const maxLevel = facility.maxLevel || 10;
          if (currentCount >= maxLevel) {
            state.addLog('此设施已达最高等级。');
            return;
          }

          // Cost scales with level: Base * 1.5^Level
          const upgradeCost = Math.floor(facility.cost * Math.pow(1.5, currentCount));

          if (state.playerStats.money < upgradeCost) {
            state.addLog(`资金不足，升级需要 ${upgradeCost} 文。`);
            return;
          }

          set(state => ({
            playerStats: { ...state.playerStats, money: state.playerStats.money - upgradeCost },
            ownedFacilities: {
              ...state.ownedFacilities,
              [facilityId]: currentCount + 1
            }
          }));
          const action = currentCount === 0 ? '置办' : '升级';
          get().addLog(`【产业】花费 ${upgradeCost} 文${action}了 ${facility.name} (LV.${currentCount + 1})。`);
          return;
        }

        // Normal Facility Logic (Quantity System)
        const maxCount = facility.maxCount || 999;
        if (currentCount >= maxCount) {
          state.addLog(`此产业已达置办上限（${maxCount}）。`);
          return;
        }

        if (state.playerStats.money < facility.cost) {
          state.addLog('资金不足，无法置办此产业。');
          return;
        }

        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - facility.cost },
          ownedFacilities: {
            ...state.ownedFacilities,
            [facilityId]: (state.ownedFacilities[facilityId] || 0) + 1
          }
        }));
        get().addLog(`【产业】花费 ${facility.cost} 文置办了 ${facility.name}。`);
      },

      buyLeekFacility: (id, cost) => {
        const state = get();
        const def = leekFacilities.find(f => f.id === id);
        let finalCost = cost ?? (def?.cost ?? 0);

        if (id === 'cold_storage') {
          const hasCold = !!state.leekFacilities?.['cold_storage'];
          const level = getEffectiveLeekColdStorageLevel(state);
          if (hasCold && level >= LEEK_MAX_COLD_STORAGE_LEVEL) {
            get().addLog('冷库已达最大规模。');
            return;
          }
          if (hasCold) {
            finalCost = coldStorageExpansionCost(level);
          }
          if (state.playerStats.money < finalCost) {
            state.addLog('资金不足。');
            return;
          }
          if (!hasCold) {
            set(s => ({
              playerStats: { ...s.playerStats, money: s.playerStats.money - finalCost },
              leekFacilities: { ...s.leekFacilities, cold_storage: true },
              leekColdStorageLevel: 1,
              leekGardenStats: {
                ...(s.leekGardenStats ?? defaultLeekGardenStats()),
                anyFacilityPurchased: true,
              },
            }));
            get().addLog('【韭菜园】成功添置设施。');
          } else {
            set(s => ({
              playerStats: { ...s.playerStats, money: s.playerStats.money - finalCost },
              leekColdStorageLevel: level + 1,
            }));
            get().addLog(`【韭菜园】冷库扩建完成（${level + 1}/${LEEK_MAX_COLD_STORAGE_LEVEL} 级）。`);
          }
          get().checkAchievements();
          return;
        }

        if (state.leekFacilities?.[id]) {
          state.addLog('你已经拥有此设施。');
          return;
        }
        if (state.playerStats.money < finalCost) {
          state.addLog('资金不足。');
          return;
        }
        set(s => ({
          playerStats: { ...s.playerStats, money: s.playerStats.money - finalCost },
          leekFacilities: { ...s.leekFacilities, [id]: true },
          leekGardenStats: {
            ...(s.leekGardenStats ?? defaultLeekGardenStats()),
            anyFacilityPurchased: true,
          },
        }));
        get().addLog('【韭菜园】成功添置设施。');
        get().checkAchievements();
      },

      loan: (amount) => {
        if (amount <= 0) return;
        set(state => ({
          playerStats: {
            ...state.playerStats,
            money: state.playerStats.money + amount,
            debt: (state.playerStats.debt || 0) + amount
          },
          logs: [`向钱庄借款 ${amount} 文。`, ...state.logs]
        }));
      },

      repayLoan: (amount) => {
        const state = get();
        const currentDebt = state.playerStats.debt || 0;
        if (currentDebt <= 0) return;

        const actualRepay = Math.min(amount, currentDebt);
        if (state.playerStats.money < actualRepay) {
          state.addLog('资金不足，无法还款。');
          return;
        }

        set(state => ({
          playerStats: {
            ...state.playerStats,
            money: state.playerStats.money - actualRepay,
            debt: currentDebt - actualRepay
          },
          logs: [`归还借款 ${actualRepay} 文。`, ...state.logs]
        }));
      },

      plantLeek: (plotId, variety) => {
        if (variety.id === LEEK_SKYSCRAPER_VARIETY_ID && plotId !== LEEK_SKYSCRAPER_PLOT_ID) {
          get().addLog('【韭菜园】摩天大土品种仅可在摩天大土地块种植。');
          return;
        }
        if (plotId === LEEK_SKYSCRAPER_PLOT_ID && variety.id !== LEEK_SKYSCRAPER_VARIETY_ID) {
          get().addLog('【韭菜园】该地块仅可种植摩天大土品种。');
          return;
        }
        set(state => {
          const plots = (state.leekPlots || []).map(p => {
            if (p.id === plotId) {
              if ((p.fertility || 0) <= 0) {
                get().addLog('【韭菜园】该地块土地贫瘠，无法种植，请休耕恢复。');
                return p;
              }
              return {
                ...p,
                varietyId: variety.id,
                growthProgress: 0,
                growthTarget: variety.growthTicks,
                watered: false,
                fertilized: false,
                pest: 0,
                quality: variety.baseQuality,
                baseYield: variety.baseYield,
                toughness: variety.toughness || 0,
                ready: false,
              };
            }
            return p;
          });
          return { leekPlots: plots };
        });
        get().addLog('【韭菜园】种下新韭。');
      },
      waterLeek: (plotId) => {
        set(state => {
          const plots = (state.leekPlots || []).map(p => p.id === plotId ? { ...p, watered: true, quality: Math.min(100, (p.quality || 0) + 2) } : p);
          return { leekPlots: plots };
        });
        get().addLog('【韭菜园】完成浇水。');
      },
      fertilizeLeek: (plotId) => {
        set(state => {
          const plots = (state.leekPlots || []).map(p => p.id === plotId ? { ...p, fertilized: true, quality: Math.min(100, (p.quality || 0) + 4) } : p);
          return { leekPlots: plots };
        });
        get().addLog('【韭菜园】施下肥料。');
      },
      harvestLeek: (plotId) => {
        const state = get();
        const plot = (state.leekPlots || []).find(p => p.id === plotId);
        if (!plot || !plot.ready || !plot.varietyId) return;

        const currentFertility = plot.fertility || 100;
        const plotQuality = plot.quality || 0;
        const isSkyscraper = plot.varietyId === LEEK_SKYSCRAPER_VARIETY_ID;

        let qty: number;
        let nextFertility: number;

        if (isSkyscraper) {
          qty = 2000;
          nextFertility = 0;
        } else {
          let baseYield = Math.max(1, (plot as any).baseYield || plot.growthTarget || 3);
          if (currentFertility < 30) {
            baseYield = Math.max(1, Math.floor(baseYield * 0.5));
            get().addLog('【韭菜园】土地贫瘠，收成大减。');
          }
          const qualityBonus = Math.floor((plot.quality || 0) / 10);
          const pestPenalty = Math.floor((plot.pest || 0) / 20);
          qty = Math.max(1, baseYield + qualityBonus - pestPenalty);
          nextFertility = Math.max(0, currentFertility - 10);
        }

        set(s => {
          const base = s.leekGardenStats ?? defaultLeekGardenStats();
          return {
            ownedGoods: { ...s.ownedGoods, leek: (s.ownedGoods['leek'] || 0) + qty },
            leekPlots: (s.leekPlots || []).map(p => p.id === plotId ? { id: plotId, pest: 0, ready: false, fertility: nextFertility } : p),
            leekGardenStats: {
              ...base,
              totalHarvestedLeek: base.totalHarvestedLeek + qty,
              maxQualityAtHarvest: Math.max(base.maxQualityAtHarvest, plotQuality),
            },
          };
        });
        get().addLog(`【韭菜园】收获鲜韭 ${qty} 把。`);
        get().checkAchievements();
      },
      processLeek: () => {
        const state = get();
        const leekCount = state.ownedGoods['leek'] || 0;
        if (leekCount < 2) {
          get().addLog('鲜韭不足（需2把）。');
          return;
        }
        if (state.playerStats.money < 2) {
          get().addLog('加工资金不足（需2文）。');
          return;
        }
        // Check facilities? For now let's assume manual processing or basic facility unlocked by default/cheap.
        // Let's require a "Processing Table" (id: processor) if we want to be strict, but for now let's make it basic.
        // Or check if user has bought "processing_table" facility.
        // Simplified: Can always process, but maybe slower/more expensive without facility?
        // Let's just consume resources.

        set(s => ({
          playerStats: { ...s.playerStats, money: s.playerStats.money - 2 },
          ownedGoods: {
            ...s.ownedGoods,
            leek: (s.ownedGoods['leek'] || 0) - 2,
            leek_box: (s.ownedGoods['leek_box'] || 0) + 1
          }
        }));
        get().addLog('【加工】制作了1个香喷喷的韭菜盒子。');
      },
      submitLeekOrder: (orderId) => {
        const state = get();
        const order = (state.leekOrders || []).find(o => o.id === orderId);
        if (!order) return;

        // We don't track quality per item in inventory (simplified model), so we assume inventory quality meets requirement?
        // Or we just check quantity.
        // To support "Quality Threshold", we might need to store avg quality in inventory or just assume player's skill check.
        // Let's simplify: Check quantity only, but maybe check a global "Garden Reputation" or just assume quality is OK if user accepts.
        // OR: We check if `ownedGoods` has enough.

        const currentQty = state.ownedGoods['leek'] || 0;
        if (currentQty < order.quantity) {
          get().addLog('库存不足以交付此订单。');
          return;
        }

        const basePrice = goods.find(g => g.id === 'leek')?.basePrice || 3;
        const totalReward = Math.floor(basePrice * order.quantity * order.priceMultiplier);

        set(s => {
          const base = s.leekGardenStats ?? defaultLeekGardenStats();
          return {
            ownedGoods: { ...s.ownedGoods, leek: currentQty - order.quantity },
            playerStats: { ...s.playerStats, money: s.playerStats.money + totalReward },
            leekOrders: (s.leekOrders || []).filter(o => o.id !== orderId),
            leekGardenStats: {
              ...base,
              totalSoldLeekUnits: base.totalSoldLeekUnits + order.quantity,
              leekRevenueToday: base.leekRevenueToday + totalReward,
            },
          };
        });
        get().addLog(`【订单】交付订单，获得 ${totalReward} 文。`);
        get().checkAchievements();
      },

      buyItem: (itemId, cost) => {
        const state = get();
        if (state.playerStats.money < cost) {
          get().addLog('资金不足。');
          return;
        }
        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
          inventory: invAdd(state.inventory, itemId)
        }));
        // 优先从 items 查找，否则从 snacks 查找
        const itemName = items.find(i => i.id === itemId)?.name || snacks.find(s => s.id === itemId)?.name || '物品';
        get().addLog(`【市集】花费 ${cost} 文购买了 ${itemName}。`);
      },

      buyTreasure: (treasureId) => {
        const state = get();
        const cost = treasurePrices[treasureId];
        if (!cost) return;

        if (state.playerStats.money < cost) {
          get().addLog('资金不足，无法购买此珍宝。');
          return;
        }

        if (treasureId === TAX_RELIEF_EDICT_ID) {
          if ((state.propertyTaxHalvingDaysLeft ?? 0) > 0) {
            get().addLog('【珍宝阁】降税令仍在生效，暂不可重复购买。');
            return;
          }
          const treasure = items.find(i => i.id === treasureId);
          if (!treasure) return;
          set(s => ({
            playerStats: { ...s.playerStats, money: s.playerStats.money - cost },
            propertyTaxHalvingDaysLeft: PROPERTY_TAX_HALVING_GAME_DAYS,
          }));
          get().addLog(
            `【珍宝阁】花费 ${cost} 文购得【${treasure.name}】，文书已呈官府备案，即日起连续 ${PROPERTY_TAX_HALVING_GAME_DAYS} 个游戏日内财产税减半。`
          );
          get().handleEventOption({ reputation: 5, culture: 2 }, '');
          return;
        }

        // construction_order 是一个特殊的珍宝，可以重复购买
        if (invHas(state.inventory, treasureId) && treasureId !== 'construction_order') {
          get().addLog('你已经拥有此珍宝了。');
          return;
        }

        const treasure = items.find(i => i.id === treasureId);
        if (!treasure) return;

        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
          inventory: invAdd(state.inventory, treasureId)
        }));

        get().addLog(`【珍宝阁】挥金如土！花费 ${cost} 文购得了稀世珍宝【${treasure.name}】。`);
        // Buying treasures increases reputation slightly as a hidden bonus
        get().handleEventOption({ reputation: 5, culture: 2 }, '');
      },

      performCharity: (charityId) => {
        const state = get();
        const charity = charities.find(c => c.id === charityId);
        if (!charity) return;

        if (state.playerStats.money < charity.cost) {
          get().addLog('囊中羞涩，无法行善。');
          return;
        }

        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - charity.cost }
        }));

        get().handleEventOption(charity.effect, '');
        get().addLog(`【善行】${charity.logMessage}`);
      },

      fillCave: () => {
        const state = get();
        const cost = 100; // 填洞成本

        if (state.playerStats.money < cost) {
          get().addLog('囊中羞涩，无法填洞。');
          return;
        }

        if (state.dailyCounts.caveFilled) {
          get().addLog('今日已经填过洞了。');
          return;
        }

        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
          dailyCounts: { ...state.dailyCounts, caveFilled: true }
        }));

        get().addLog(`【填洞】花费 ${cost} 文填洞，今日探险不会再掉入盗洞。`);
      },

      donateDisasterRelief: (type, amount) => {
        const state = get();
        if (!state.disasterState.active || state.disasterState.type !== 'flood') {
          get().addLog('当前并无灾情。');
          return;
        }

        const goodId = type;
        const currentStock = state.ownedGoods[goodId] || 0;
        if (currentStock < amount) {
          get().addLog('物资不足。');
          return;
        }

        // Rewards: Reputation.
        // Grain (price ~10), Cloth (price ~50).
        // 1 Reputation per 50 value?
        const value = type === 'grain' ? 10 * amount : 50 * amount;
        const repGain = Math.ceil(value / 50);

        set(s => ({
          ownedGoods: { ...s.ownedGoods, [goodId]: currentStock - amount },
          playerStats: { ...s.playerStats, reputation: s.playerStats.reputation + repGain }
        }));

        get().addLog(`【赈灾】捐赠了 ${amount} ${type === 'grain' ? '粮草' : '布匹'}，获得了 ${repGain} 点声望。百姓对你的义举感激涕零。`);
      },

      useItem: (itemId) => {
        const state = get();
        if (!invHas(state.inventory, itemId)) return;

        // 优先从 items 查找，否则从 snacks 查找
        const item = items.find(i => i.id === itemId) || snacks.find(s => s.id === itemId);
        if (item && item.effect) {
          get().handleEventOption(item.effect, `使用了 ${item.name}`);
        } else {
          get().addLog(`使用了 ${item?.name || '物品'}，但是什么也没发生。`);
        }

        set(state => ({ inventory: invRemoveOne(state.inventory, itemId) }));
      },

      equipApparel: (slot, itemId) => {
        const state = get();
        const item = items.find(i => i.id === itemId);
        if (!item || item.type !== 'apparel' || item.slot !== slot) {
          get().addLog('此物不可用于该衣装部位。');
          return;
        }
        if (!invHas(state.inventory, itemId)) {
          get().addLog('行囊中没有此衣装。');
          return;
        }
        set(s => ({
          equippedApparel: { ...s.equippedApparel, [slot]: itemId }
        }));
        get().addLog(`已更换${item.name}。`);
      },

      unequipApparel: (slot) => {
        const state = get();
        if (!state.equippedApparel[slot]) return;
        set(s => ({
          equippedApparel: { ...s.equippedApparel, [slot]: undefined }
        }));
      },

      randomizeHairStyle: () => {
        const state = get();
        const hairItems = hairstyleItemIds.flatMap(id => {
          const item = items.find(candidate => candidate.id === id);
          return item ? [item] : [];
        });
        if (hairItems.length === 0) {
          get().addLog('【梦幻只雕剃肆】今日竟无发样可换。');
          return { success: false, isNew: false };
        }

        const barberExclusiveSet = new Set(barberExclusiveHairItemIds);
        const barberExclusiveItems = hairItems.filter(item => barberExclusiveSet.has(item.id));
        const normalHairItems = hairItems.filter(item => !barberExclusiveSet.has(item.id));

        const shouldRollExclusive = barberExclusiveItems.length > 0 && Math.random() < 0.1;
        const sourcePool = shouldRollExclusive ? barberExclusiveItems : (normalHairItems.length > 0 ? normalHairItems : hairItems);
        const availableHairItems = sourcePool.filter(item => item.id !== state.equippedApparel.hair);
        const pool = availableHairItems.length > 0 ? availableHairItems : sourcePool;
        const nextHair = pool[Math.floor(Math.random() * pool.length)];
        const alreadyOwned = invHas(state.inventory, nextHair.id);

        set(s => ({
          inventory: alreadyOwned ? s.inventory : invAdd(s.inventory, nextHair.id),
          equippedApparel: { ...s.equippedApparel, hair: nextHair.id }
        }));

        get().addLog(`【发型】换上了${nextHair.name}。`);
        return { success: true, hairItemId: nextHair.id, hairName: nextHair.name, isNew: !alreadyOwned };
      },

      equipAccessory: (itemId) => {
        const state = get();
        const item = items.find(i => i.id === itemId);
        if (!item || item.type !== 'accessory') {
          get().addLog('此物不可作为首饰佩戴。');
          return;
        }
        if (!invHas(state.inventory, itemId)) {
          get().addLog('行囊中没有此首饰。');
          return;
        }
        if (state.equippedAccessories.includes(itemId)) {
          return;
        }
        const slot = item.slot;
        let nextAccessories = [...state.equippedAccessories];
        if (slot) {
          nextAccessories = nextAccessories.filter(id => items.find(i => i.id === id)?.slot !== slot);
        }
        if (nextAccessories.length >= 3) {
          get().addLog('首饰最多佩戴三件。');
          return;
        }
        nextAccessories.push(itemId);
        set({ equippedAccessories: nextAccessories });
        get().addLog(`已佩戴${item.name}。`);
      },

      unequipAccessory: (itemId) => {
        const state = get();
        if (!state.equippedAccessories.includes(itemId)) return;
        set({ equippedAccessories: state.equippedAccessories.filter(id => id !== itemId) });
      },

      updateTimeSettings: (settings) => {
        set(state => ({
          timeSettings: { ...state.timeSettings, ...settings }
        }));
      },

      resetDayTimer: () => {
        set(state => ({
          timeSettings: { ...state.timeSettings, dayStartTime: Date.now(), isPaused: false }
        }));
      },

      togglePause: (paused) => {
        set(state => {
          // If pausing, calculate elapsed so we can adjust startTime on resume?
          // Simplified: Just toggle pause flag. The component will handle elapsed time logic by using stored duration.
          // Actually, if we pause, we need to adjust startTime when we resume to "freeze" the time.
          // But for now let's keep it simple. If we want to support true pause/resume, we need to track 'elapsed' in store or adjust startTime.
          // Let's adjust startTime on resume:
          // When pausing: store 'pauseTime'.
          // When resuming: startTime = startTime + (now - pauseTime).
          // For MVP: let's just use the boolean. The TimeManager component can handle "pausing" the visual timer.
          // However, Date.now() keeps moving. If I pause for 10 mins, the day will end immediately on resume if I don't adjust.
          // Strategy: When pausing, save 'elapsedTimeAtPause'. When resuming, set 'dayStartTime = Date.now() - elapsedTimeAtPause'.

          // Re-implementing correctly:
          let newSettings = { ...state.timeSettings, isPaused: paused };

          if (paused) {
            // We are pausing.
            // We don't need to do anything to start time yet, just stop checking.
            // But we need to know how much time had passed to restore it.
            // Let's store 'elapsedTime' in the store? No, let's use a "pauseTimestamp".
            // Actually, simplest way:
            // We need to shift dayStartTime forward by the duration of the pause.
            // So we need to store 'lastPauseTime' in state?
            // Let's rely on the component to calculate offsets? No, store is source of truth.

            // Better approach: 
            // We will add 'pausedAt' timestamp to settings.
            // When resuming: dayStartTime += (Date.now() - pausedAt).
            newSettings = { ...newSettings, pausedAt: Date.now() } as any;
          } else {
            // Resuming
            if ((state.timeSettings as any).pausedAt) {
              const pauseDuration = Date.now() - (state.timeSettings as any).pausedAt;
              newSettings.dayStartTime = state.timeSettings.dayStartTime + pauseDuration;
              newSettings = { ...newSettings, pausedAt: undefined } as any;
            }
          }

          return { timeSettings: newSettings };
        });
      },

      setPlayerProfile: (profile) => {
        set(state => ({
          playerProfile: { 
            name: profile.name ?? state.playerProfile?.name ?? '无名', 
            avatar: profile.avatar ?? state.playerProfile?.avatar ?? '',
            nameChangeUsed: profile.nameChangeUsed ?? state.playerProfile?.nameChangeUsed
          }
        }));
      },

      setIsMoGuRenaming: (value) => {
        set({ isMoGuRenaming: value });
      },

      startGame: (roleId) => {
        const roleConfig = roles.find(r => r.id === roleId);
        if (!roleConfig) return;

        const firstTask = tasks.find(t => t.role === roleId && t.id.endsWith('_1'));

        set({
          role: roleId,
          day: 1,
          weather: 'sunny',
          playerProfile: { name: roleConfig.name, avatar: '' },
          playerStats: { ...roleConfig.initialStats, experience: 0 },
          countyStats: { ...roleConfig.initialCountyStats },
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0, caveFilled: false, pigeonRace: 0, pigeonBooster: 0, extraDefenseCount: 0 },
          npcInteractionStates: {},
          isVoiceLost: false,
          isMoGuRenaming: false,
          collectedScrolls: [],
          activePolicyId: undefined,
          inventory: {},
          equippedApparel: {},
          equippedAccessories: [],
          flags: {},
          npcRelations: {},
          logs: [`开始游戏，身份：${roleConfig.name}`],
          currentEvent: null,
          isGameOver: false,
          currentTaskId: firstTask?.id,
          completedTaskIds: [],
          giftFailureCounts: {},
          talents: {},
          achievements: [],
          hasInteractedToday: false,
          marketPrices: goods.reduce((acc, good) => ({ ...acc, [good.id]: good.basePrice }), {}),
          ownedGoods: {},
          ownedFacilities: {},
          // 赛鸽系统
          pigeons: [],
          pigeonRaceHistory: [],
          selectedPigeonId: undefined,
          pigeonBoosterUnlocked: false,
          pendingDoping: null,
          dopingStreak: 0,
          lastPlayerDopingDay: 0,
          pigeonDopingCaughtDays: [],
          pigeonBoosterLockUntilDay: undefined,
          pigeonCleanWinStreak: 0,
          propertyTaxHalvingDaysLeft: undefined,
          countyDevelopment: { currentPath: 'none', lastSwitchedDay: 1 },
          externalThreat: { banditThreat: 15, defense: 40, warRisk: 5, lastRaidDay: 0 },
        });

        if (firstTask) {
          setTimeout(() => get().addLog(`【主线任务】${firstTask.title}: ${firstTask.description}`), 0);
        }
      },

      checkTaskCompletion: () => {
        const state = get();
        if (!state.currentTaskId) return;
        const task = tasks.find(t => t.id === state.currentTaskId);
        if (!task) return;

        if (task.checkCompletion(state)) {
          get().addLog(`【任务完成】${task.title}`);

          const nextTaskId = task.nextTaskId;

          set((state) => ({
            currentTaskId: nextTaskId,
            completedTaskIds: [...state.completedTaskIds, task.id]
          }));

          get().handleEventOption(task.reward, task.rewardText);

          if (nextTaskId) {
            const nextTask = tasks.find(t => t.id === nextTaskId);
            if (nextTask) {
              get().addLog(`【新任务】${nextTask.title}: ${nextTask.description}`);
            }
          } else {
            get().addLog(`【恭喜】你已完成所有主线任务！`);
          }
        }
      },

      handleTaskAction: () => {
        const state = get();
        if (!state.currentTaskId) return;
        const task = tasks.find(t => t.id === state.currentTaskId);
        if (!task || !task.specialAction) return;

        const result = task.specialAction.handler(state);
        if (result.success) {
          get().handleEventOption(result.effect, result.message);
        } else {
          get().addLog(result.message);
        }
      },

      checkVoiceStatus: () => {
        return get().isVoiceLost;
      },

      interactWithNPC: (npcId, type) => {
        const state = get();
        const npcState = state.npcInteractionStates[npcId] || { dailyGiftCount: 0, dailyChatCount: 0, dailyActionCount: 0 };

        if (type === 'chat') {
          if (state.isVoiceLost) {
            return { success: false, message: '你嗓子哑了，发不出声音，无法闲聊。' };
          }

          if (state.dailyCounts.chatTotal >= 100) {
            return { success: false, message: '你今天说的话太多了，嗓子已经开始冒烟了。' };
          }

          if (npcState.dailyChatCount >= 10) {
            const previousRelation = state.npcRelations[npcId] || 0;
            const newRelation = previousRelation - 1;
            const penalty = resolveRelationPenalties(state, npcId, previousRelation, newRelation);
            const penaltyEvents = penalty.events || [];

            set(prev => {
              const newPlayerStats = { ...prev.playerStats };
              newPlayerStats.money += penalty.moneyChange;
              newPlayerStats.reputation += penalty.reputationChange;
              newPlayerStats.ability += penalty.abilityChange;
              newPlayerStats.health += penalty.healthChange;
              newPlayerStats.experience += penalty.experienceChange;

              const fitnessLevel = prev.talents['fitness'] || 0;
              const maxHealth = 100 + fitnessLevel * 10;
              newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation);
              newPlayerStats.ability = Math.min(120, Math.max(0, newPlayerStats.ability));
              newPlayerStats.health = Math.min(maxHealth, Math.max(0, newPlayerStats.health));

              const newFlags = { ...prev.flags };
              penalty.flags.forEach(flag => {
                newFlags[flag] = 1;
              });

              const nextState = {
                npcInteractionStates: {
                  ...prev.npcInteractionStates,
                  [npcId]: { ...npcState, dailyChatCount: npcState.dailyChatCount + 1 }
                },
                dailyCounts: { ...prev.dailyCounts, chatTotal: prev.dailyCounts.chatTotal + 1 },
                npcRelations: {
                  ...prev.npcRelations,
                  [npcId]: newRelation
                },
                playerStats: newPlayerStats,
                flags: newFlags
              } as const;

              if (penaltyEvents.length > 0) {
                return {
                  ...nextState,
                  currentEvent: penaltyEvents[0],
                  eventQueue: [...prev.eventQueue, ...penaltyEvents.slice(1)]
                };
              }

              return nextState;
            });

            const penaltyText = penalty.messages.length > 0 ? ` ${penalty.messages.join(' ')}` : '';
            return { success: true, message: `对方显然已经有些不耐烦了，好感度降低了。(好感度 -1)${penaltyText}` };
          }

          // Normal chat
          const currentRelation = state.npcRelations[npcId] || 0;
          const roll = Math.random();
          let level: 'high' | 'medium' | 'low' = 'low';
          let relationChange = 1;

          // Probabilities based on intimacy level
          if (currentRelation < 50) {
            if (roll < 0.01) level = 'high';      // 1%
            else if (roll < 0.11) level = 'medium'; // 10%
            else level = 'low';                     // 89%
          } else if (currentRelation <= 100) {
            if (roll < 0.03) level = 'high';      // 3%
            else if (roll < 0.18) level = 'medium'; // 15%
            else level = 'low';                     // 82%
          } else {
            if (roll < 0.05) level = 'high';      // 5%
            else if (roll < 0.25) level = 'medium'; // 20%
            else level = 'low';                     // 75%
          }

          // Determine relation gain based on interaction level
          if (level === 'high') relationChange = 5;
          else if (level === 'medium') relationChange = 2;
          else relationChange = 1;

          // Determine message
          const npc = npcs.find(n => n.id === npcId);
          let message = '';

          const dialogues = npc?.chatDialogues?.[level];

          if (dialogues && dialogues.length > 0) {
            message = dialogues[Math.floor(Math.random() * dialogues.length)];
          } else {
            if (level === 'high') message = '你们相谈甚欢，仿佛有说不完的话题！';
            else if (level === 'medium') message = '你们愉快地聊了一会儿，气氛融洽。';
            else message = '你们聊了一些家常琐事。';
          }

          message += ` (亲密度 +${relationChange})`;

          set(prev => ({
            npcInteractionStates: {
              ...prev.npcInteractionStates,
              [npcId]: { ...npcState, dailyChatCount: npcState.dailyChatCount + 1 }
            },
            dailyCounts: { ...prev.dailyCounts, chatTotal: prev.dailyCounts.chatTotal + 1 },
            npcRelations: {
              ...prev.npcRelations,
              [npcId]: (prev.npcRelations[npcId] || 0) + relationChange
            }
          }));
          return { success: true, message };
        }
        else if (type === 'gift') {
          if (npcState.dailyGiftCount >= 20) {
            return { success: false, message: '对方今天收礼收到手软，委婉地拒绝了你。' };
          }

          // Logic for scroll drop (1% chance if relation > 100)
          const currentRelation = state.npcRelations[npcId] || 0;
          if (currentRelation > 100 && Math.random() < 0.01) {
            // Drop Scroll logic
            // For simplicity, generate a generic scroll if NPC specific ones aren't defined yet
            const newScroll = {
              id: `scroll_${Date.now()}`,
              name: '神秘卷轴',
              description: '记载着一些不为人知的秘密。',
              npcId: npcId,
              obtainedAt: state.day
            };
            set(prev => ({
              collectedScrolls: [...prev.collectedScrolls, newScroll]
            }));
            get().addLog(`【奇遇】你在送礼时意外获得了一个${newScroll.name}！`);
          }

          set(prev => ({
            npcInteractionStates: {
              ...prev.npcInteractionStates,
              [npcId]: { ...npcState, dailyGiftCount: npcState.dailyGiftCount + 1 }
            }
          }));

          return { success: true, message: '' }; // Success, allow normal gift logic to proceed for relation/item removal
        }
        else if (['action', 'loan', 'work'].includes(type)) {
          const currentActionCount = npcState.dailyActionCount || 0;
          if (currentActionCount >= 5) {
            return { success: false, message: '你今天已经打扰对方太多次了，改天再来吧。' };
          }

          let message = '';
          let success = true;

          if (type === 'loan') {
            get().loan(500);
            message = '对方借给你 500 文应急。';
          } else if (type === 'work') {
            if (state.playerStats.health < 20) {
              return { success: false, message: '体力不足，无法帮工。' };
            }
            set(prev => ({
              playerStats: {
                ...prev.playerStats,
                money: prev.playerStats.money + 50,
                health: prev.playerStats.health - 20
              }
            }));
            message = '你帮对方干了一些杂活，获得 50 文报酬。';
          }

          set(prev => ({
            npcInteractionStates: {
              ...prev.npcInteractionStates,
              [npcId]: {
                ...npcState,
                dailyActionCount: currentActionCount + 1
              }
            }
          }));
          return { success, message };
        }

        return { success: false, message: '未知操作' };
      },
      giftFoodToJiYiOu: (itemId) => {
        const state = get();
        const item = items.find(entry => entry.id === itemId);

        if (!item) {
          return { success: false, message: '礼物不存在。' };
        }

        if (!invHas(state.inventory, itemId)) {
          return { success: false, message: '行囊中没有这份礼物。' };
        }

        const giftCategory = getJiYiOuGiftCategory(item);
        if (!giftCategory) {
          return { success: false, message: '这份礼物暂时不适合赠予季一藕。' };
        }

        const interactionResult = get().interactWithNPC('ji_yi_ou', 'gift');
        if (!interactionResult.success) {
          return interactionResult;
        }

        const reward = getJiYiOuGiftReward(giftCategory);
        const loreDrop = rollJiYiOuLoreDrop();

        const rewardItems = reward.effect.itemsAdd ? [...reward.effect.itemsAdd] : undefined;
        const effect: Effect = {
          ...reward.effect,
          itemsAdd: rewardItems,
          itemsRemove: [itemId]
        };

        const loreText = loreDrop ? ` ${loreDrop}` : '';
        get().handleEventOption(
          effect,
          `你把${item.name}递给季一藕，她眼睛一亮，连声道谢。${reward.rewardText}${loreText}`
        );

        return { success: true, message: '' };
      },

      // ─────────────────────────────────────────────────────────
      // 季一藕医馆动物互动 Actions
      // ─────────────────────────────────────────────────────────

      // 门禁检查
      canEnterClinic: () => {
        const state = get();
        return canEnterClinic(state);
      },

      canInteractClinicAnimals: () => {
        const state = get();
        return canInteractAnimals(state);
      },

      canTeachClinicBird: () => {
        const state = get();
        return canTeachBird(state);
      },

      canPracticeClinicDogBark: (hasPatients: boolean) => {
        const state = get();
        return canPracticeDogBark(state, hasPatients);
      },

      getClinicAnimalStatus: () => {
        const state = get();
        return getClinicAnimalSummary(state);
      },

      // 喂小啾
      feedClinicBird: (foodType: BirdFoodType) => {
        const state = get();
        const clinicCheck = canInteractAnimals(state);
        if (!clinicCheck.allowed) {
          return { success: false, message: clinicCheck.reason || '无法与动物互动' };
        }

        const result = feedBird(state, foodType);
        if (result.success && result.effect) {
          get().handleEventOption(result.effect, result.message);

          // 更新状态
          if (result.statePatch) {
            set(prev => ({
              clinicAnimals: {
                ...getDefaultClinicAnimalState(),
                ...(prev.clinicAnimals || {}),
                ...result.statePatch
              }
            }));
          }
        }

        return { success: result.success, message: result.message };
      },

      // 逗鸟
      teaseClinicBird: () => {
        const state = get();
        const clinicCheck = canInteractAnimals(state);
        if (!clinicCheck.allowed) {
          return { success: false, message: clinicCheck.reason || '无法与动物互动' };
        }

        const result = teaseBird(state);
        if (result.success && result.effect) {
          get().handleEventOption(result.effect, result.message);

          // 更新状态
          if (result.statePatch) {
            set(prev => ({
              clinicAnimals: {
                ...getDefaultClinicAnimalState(),
                ...(prev.clinicAnimals || {}),
                ...result.statePatch
              }
            }));
          }

          // 解锁称号
          if (result.unlockedTitle) {
            const titleId = result.unlockedTitle === '咕咕嘎' ? 'title_gugu_ga' : 
                           result.unlockedTitle === '汪汪汪，谁家的小狗' ? 'title_wang_wang_wang' :
                           result.unlockedTitle === '一意孤行' ? 'title_yi_yi_gu_xing' : null;
            if (titleId && !state.achievements.includes(titleId)) {
              set(prev => ({
                achievements: [...prev.achievements, titleId],
                latestUnlockedAchievementId: titleId
              }));
            }
          }
        }

        return { success: result.success, message: result.message };
      },

      // 教小啾说话
      teachClinicBirdPhrase: (phrase: string) => {
        const state = get();

        // 先检查能否进入医馆
        const clinicCheck = canEnterClinic(state);
        if (!clinicCheck.allowed) {
          return { success: false, message: clinicCheck.reason || '无法进入医馆' };
        }

        const animalCheck = canInteractAnimals(state);
        if (!animalCheck.allowed) {
          return { success: false, message: animalCheck.reason || '无法与动物互动' };
        }

        const teachCheck = canTeachBird(state);
        if (!teachCheck.allowed) {
          return { success: false, message: teachCheck.reason || '无法教小啾说话' };
        }

        const result = teachBirdPhrase(state, phrase);
        if (result.success && result.effect) {
          get().handleEventOption(result.effect, result.message);

          // 更新状态
          if (result.statePatch) {
            set(prev => ({
              clinicAnimals: {
                ...getDefaultClinicAnimalState(),
                ...(prev.clinicAnimals || {}),
                ...result.statePatch
              }
            }));
          }

          // 解锁称号
          if (result.unlockedTitle) {
            const titleId = result.unlockedTitle === '咕咕嘎' ? 'title_gugu_ga' :
                           result.unlockedTitle === '一意孤行' ? 'title_yi_yi_gu_xing' : null;
            if (titleId && !state.achievements.includes(titleId)) {
              set(prev => ({
                achievements: [...prev.achievements, titleId],
                latestUnlockedAchievementId: titleId
              }));
            }
          }
        }

        return { success: result.success, message: result.message };
      },

      // 互动小狗（抚摸/喂食）
      interactClinicDog: (actionId: 'pet' | 'feed') => {
        const state = get();
        const clinicCheck = canInteractAnimals(state);
        if (!clinicCheck.allowed) {
          return { success: false, message: clinicCheck.reason || '无法与动物互动' };
        }

        const result = interactDog(state, actionId);
        if (result.success && result.effect) {
          get().handleEventOption(result.effect, result.message);
        }

        return { success: result.success, message: result.message };
      },

      // 学狗叫
      practiceClinicDogBark: (hasPatients: boolean) => {
        const state = get();

        // 先检查能否进入医馆
        const clinicCheck = canEnterClinic(state);
        if (!clinicCheck.allowed) {
          return { success: false, message: clinicCheck.reason || '无法进入医馆' };
        }

        const result = practiceDogBark(state, hasPatients);
        if (result.success && result.effect) {
          get().handleEventOption(result.effect, result.message);

          // 更新状态
          if (result.statePatch) {
            set(prev => ({
              clinicAnimals: {
                ...getDefaultClinicAnimalState(),
                ...(prev.clinicAnimals || {}),
                ...result.statePatch
              }
            }));
          }

          // 解锁称号
          if (result.unlockedTitle) {
            const titleId = 'title_wang_wang_wang';
            if (!state.achievements.includes(titleId)) {
              set(prev => ({
                achievements: [...prev.achievements, titleId],
                latestUnlockedAchievementId: titleId
              }));
            }
          }
        }

        return { success: result.success, message: result.message };
      },

      // 播放小啾语录
      playClinicBirdPhrase: () => {
        const state = get();
        const result = playBirdPhrase(state);
        return { success: result.success, message: result.message };
      },

      // 通用 NPC 赠礼函数
      giftItemToNpc: (npcId, itemId) => {
        const state = get();
        const item = items.find(entry => entry.id === itemId);
        const npc = npcs.find(n => n.id === npcId);

        if (!item) {
          return { success: false, message: '礼物不存在。' };
        }

        if (!npc) {
          return { success: false, message: 'NPC 不存在。' };
        }

        if (!invHas(state.inventory, itemId)) {
          return { success: false, message: '行囊中没有这份礼物。' };
        }

        // 检查是否有赠礼规则
        if (!hasNPCGiftRule(npcId)) {
          return { success: false, message: `暂无 ${npc.name} 的赠礼规则。` };
        }

        // 构建赠礼结果
        const outcome = buildGiftOutcome(npcId, item, npc.name);
        if (!outcome.success || !outcome.result) {
          return { success: false, message: outcome.message };
        }

        // 执行 NPC 互动
        const interactionResult = get().interactWithNPC(npcId, 'gift');
        if (!interactionResult.success) {
          return interactionResult;
        }

        // 应用效果
        const result = outcome.result;
        const rewardItems = result.effect.itemsAdd ? [...result.effect.itemsAdd] : undefined;
        const effect: Effect = {
          ...result.effect,
          itemsAdd: rewardItems,
          itemsRemove: [itemId]
        };

        get().handleEventOption(effect, result.message);

        return { success: true, message: '' };
      },

      incrementGiftFailure: (npcId) => {
        set(state => ({
          giftFailureCounts: {
            ...state.giftFailureCounts,
            [npcId]: (state.giftFailureCounts[npcId] || 0) + 1
          }
        }));
      },

      resetGiftFailure: (npcId) => {
        set(state => {
          const newCounts = { ...state.giftFailureCounts };
          delete newCounts[npcId];
          return { giftFailureCounts: newCounts };
        });
      },

      incrementDailyCount: (type) => {
        set(state => ({
          dailyCounts: {
            ...state.dailyCounts,
            [type]: state.dailyCounts[type] + 1
          }
        }));
      },

      upgradeTalent: (talentId) => {
        const state = get();
        const talent = talents.find(t => t.id === talentId);
        if (!talent) return;

        const currentLevel = state.talents[talentId] || 0;
        if (currentLevel >= talent.maxLevel) return;

        const cost = talent.baseCost * (currentLevel + 1);
        if (state.playerStats.experience < cost) {
          state.addLog('阅历不足，无法领悟此天赋。');
          return;
        }

        set(state => ({
          playerStats: {
            ...state.playerStats,
            experience: state.playerStats.experience - cost
          },
          talents: {
            ...state.talents,
            [talentId]: currentLevel + 1
          }
        }));
        state.addLog(`【天赋】你领悟了“${talent.name}”，等级提升至 ${currentLevel + 1}。`);
      },

      checkAchievements: () => {
        const state = get();
        const newUnlockedIds: string[] = [];
        let totalRewardExp = 0;
        let bonusMoney = 0;
        let bonusReputation = 0;
        let bonusAbility = 0;
        let bonusItems: string[] = [];

        achievements.forEach(ach => {
          if (!state.achievements.includes(ach.id)) {
            if (ach.condition(state)) {
              newUnlockedIds.push(ach.id);
              totalRewardExp += ach.rewardExp;
              
              // 仙鹤草特殊奖励逻辑
              if (ach.id === 'xianhe_grass_5') {
                bonusMoney += 100; bonusReputation += 50; bonusAbility += 30;
                get().addLog(`【获得称号】跃跃欲试：金钱+100，声望+50，能力+30`);
              } else if (ach.id === 'xianhe_grass_10') {
                bonusMoney += 300; bonusReputation += 70; bonusAbility += 50;
                get().addLog(`【获得称号】与神并肩：金钱+300，声望+70，能力+50`);
              } else if (ach.id === 'xianhe_grass_20') {
                bonusMoney += 600; bonusReputation += 100; bonusAbility += 77;
                get().addLog(`【获得称号】与神同行：金钱+600，声望+100，能力+77`);
              } else if (ach.id === 'xianhe_grass_30') {
                bonusMoney += 1200; bonusReputation += 166; bonusAbility += 120;
                get().addLog(`【获得称号】羽化登仙：金钱+1200，声望+166，能力+120`);
              } else if (ach.id === 'one_thousand_and_one_nights') {
                bonusItems.push('story_collection');
                get().addLog(`【获得物品】故事集：一本厚厚的故事集，记录了你讲过的一百零一个故事。`);
              }

              get().addLog(`【成就达成】${ach.name}：获得 ${ach.rewardExp} 阅历！`);
            }
          }
        });

        if (newUnlockedIds.length > 0) {
          set(state => {
            const newInventory = { ...state.inventory };
            bonusItems.forEach(itemId => {
              newInventory[itemId] = (newInventory[itemId] || 0) + 1;
            });

            return {
              achievements: [...state.achievements, ...newUnlockedIds],
              latestUnlockedAchievementId: newUnlockedIds[newUnlockedIds.length - 1], // Show the latest one
              inventory: newInventory,
              playerStats: {
                ...state.playerStats,
                experience: state.playerStats.experience + totalRewardExp,
                money: state.playerStats.money + bonusMoney,
                reputation: state.playerStats.reputation + bonusReputation,
                ability: state.playerStats.ability + bonusAbility
              }
            };
          });
        }
      },

      setPolicy: (policyId) => {
        const state = get();
        const policy = policies.find(p => p.id === policyId);
        if (!policy) return;

        if (state.playerStats.reputation < policy.cost) {
          state.addLog('声望不足，无法推行此政令。');
          return;
        }

        set(state => ({
          activePolicyId: policyId,
          playerStats: {
            ...state.playerStats,
            reputation: state.playerStats.reputation - policy.cost
          }
        }));
        state.addLog(`【政令】你颁布了“${policy.name}”政令。`);
      },

      cancelPolicy: () => {
        set({ activePolicyId: undefined });
        get().addLog('【政令】你废除了当前的政令。');
      },

      divineFortune: () => {
        const state = get();
        if (state.dailyCounts.fortune > 0) return;

        if (state.playerStats.money < 5) {
          get().addLog('囊中羞涩，算命先生摇了摇头。');
          return;
        }

        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money - 5 },
          dailyCounts: { ...state.dailyCounts, fortune: state.dailyCounts.fortune + 1 },
          fortuneLevel: fortune.level,
        }));
        get().addLog(`【算命】花费5文钱，求得一签：${fortune.summary}。签文曰：“${fortune.text}”`);
      },

      nextDay: () => {
        // ── 步骤 1: 先检查 Debuff 触发条件（新增 Debuff）────────
        get().checkDebuffTriggers();

        // ── 步骤 2: 结算 Debuff 日效果（tickDebuffsPerDay 内部同时处理到期）──
        const debuffResult = get().tickDebuffsPerDay();

        set(state => {
          const newOwnedFacilities = { ...state.ownedFacilities };
          const currentHealth = state.playerStats.health;
          const fitnessLevel = state.talents['fitness'] || 0;
          const maxHealth = 100 + fitnessLevel * 10;

          let newHealth = currentHealth;
          let recoveryMessage = '';

          if (currentHealth > maxHealth * 0.5) {
            newHealth = maxHealth;
            recoveryMessage = '经过一晚充足的休息，体力已完全恢复。';
          } else {
            const extraRecovery = Math.min(10, (state.flags['archery_baduanjin_bonus'] || 0));
            newHealth = Math.min(maxHealth, currentHealth + 10 + extraRecovery);
            recoveryMessage = '由于身体状况不佳，昨晚休息得不是很好，体力仅略有恢复。';
          }

          // Apply Policy Effects
          let policyMessage = '';
          let newCountyStats = { ...state.countyStats };
          let newPlayerStats = { ...state.playerStats, health: newHealth };

          if (state.activePolicyId) {
            const policy = policies.find(p => p.id === state.activePolicyId);
            if (policy) {
              const effect = policy.dailyEffect;
              policyMessage = `【政令生效】${policy.name}: `;

              if (effect.economy) {
                newCountyStats.economy += effect.economy;
                newCountyStats.economy = Math.min(100, Math.max(0, newCountyStats.economy));
              }
              if (effect.order) {
                newCountyStats.order += effect.order;
                newCountyStats.order = Math.min(100, Math.max(0, newCountyStats.order));
              }
              if (effect.culture) {
                newCountyStats.culture += effect.culture;
                newCountyStats.culture = Math.min(100, Math.max(0, newCountyStats.culture));
              }
              if (effect.livelihood) {
                newCountyStats.livelihood += effect.livelihood;
                newCountyStats.livelihood = Math.min(100, Math.max(0, newCountyStats.livelihood));
              }

              if (effect.money) newPlayerStats.money += effect.money;
              if (effect.reputation) newPlayerStats.reputation += effect.reputation;

              // Clamp player stats
              newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation);
            }
          }

          // ── 步骤 2 结果注入：Debuff 每日效果 ────────────────────
          newCountyStats.economy = Math.min(100, Math.max(0, newCountyStats.economy + debuffResult.economyDelta));
          newCountyStats.order = Math.min(100, Math.max(0, newCountyStats.order + debuffResult.orderDelta));
          newCountyStats.culture = Math.min(100, Math.max(0, newCountyStats.culture + debuffResult.cultureDelta));
          newCountyStats.livelihood = Math.min(100, Math.max(0, newCountyStats.livelihood + debuffResult.livelihoodDelta));
          newPlayerStats.money += debuffResult.moneyDelta;
          newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation + debuffResult.reputationDelta);

          // Voice loss logic
          const chatTotal = state.dailyCounts.chatTotal;
          let isVoiceLost = false;
          let voiceMessage = '';

          if (chatTotal >= 100) {
            isVoiceLost = true;
            voiceMessage = '因为昨天说话太多，你今天嗓子彻底哑了，无法说话。';
          } else if (state.isVoiceLost) {
            isVoiceLost = false;
            voiceMessage = '经过一天的休息，你的嗓子终于恢复了。';
          }

          // Market Fluctuation
          const newMarketPrices = { ...state.marketPrices };
          const newMarketInventory: Record<string, number> = {};

          // Randomize Market State (80% Normal, 10% Undercut, 10% Cooperative)
          const marketRoll = Math.random();
          let newMarketState: 'normal' | 'undercut' | 'cooperative' = 'normal';
          let marketStateMessage = '';

          if (marketRoll < 0.1) {
            newMarketState = 'undercut';
            marketStateMessage = '【市场】今日有商贩恶意压价，市场动荡不安。';
          } else if (marketRoll < 0.2) {
            newMarketState = 'cooperative';
            marketStateMessage = '【市场】商会推行稳价协议，市场价格平稳。';
          } else {
            newMarketState = 'normal';
          }

          // Clean up expired price locks
          const currentPriceLocks = { ...state.priceLocks };
          const nextDayNum = state.day + 1;
          Object.keys(currentPriceLocks).forEach(key => {
            if (currentPriceLocks[key].endDay < nextDayNum) {
              delete currentPriceLocks[key];
            }
          });

          goods.forEach(good => {
            const fluctuation = (Math.random() * 2 - 1) * good.volatility;
            let newPrice = Math.floor(good.basePrice * (1 + fluctuation));

            // Check for Price Lock
            if (currentPriceLocks[good.id]) {
              const minLockedPrice = Math.floor(good.basePrice * currentPriceLocks[good.id].minPriceMultiplier);
              // Ensure price is at least the locked multiplier
              if (newPrice < minLockedPrice) {
                // Generate a random price between minLockedPrice (1.5x) and Max (2.0x)
                // Formula: min + random * (max - min)
                const maxPrice = Math.floor(good.basePrice * 2.0);
                newPrice = Math.floor(minLockedPrice + Math.random() * (maxPrice - minLockedPrice));
              }
            }

            // Check if good was purchased yesterday (dailyPurchasedGoods)
            // If purchased, limit fluctuation to +/- 20% of YESTERDAY's price
            if (state.dailyPurchasedGoods.includes(good.id)) {
              const oldPrice = state.marketPrices[good.id];
              const minAllowed = Math.floor(oldPrice * 0.8);
              const maxAllowed = Math.ceil(oldPrice * 1.2);
              newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));
            }

            // Special logic for Antique: Min 0, Max 200% (2.0)
            if (good.id === 'antique') {
              newPrice = Math.max(0, Math.min(Math.floor(good.basePrice * 2.0), newPrice));
            } else {
              newPrice = Math.max(Math.floor(good.basePrice * 0.5), Math.min(Math.floor(good.basePrice * 2.0), newPrice));
            }

            newMarketPrices[good.id] = newPrice;
            newMarketInventory[good.id] = Math.floor(Math.random() * 51) + 50; // 50-100
          });

          // Monopoly / Limit Check (Anti-Trust)
          // Facility Income
          let facilityIncome = 0;
          let facilityMessage = '';
          // Resource logic moved to processResourceTick (real-time)
          let resourceMessage = '';
          let nextInventory = { ...state.inventory };

          Object.entries(state.ownedFacilities).forEach(([facilityId, count]) => {
            const facility = facilities.find(f => f.id === facilityId);
            if (facility && count > 0) {
              if (facility.type === 'resource') {
                // Skip daily resource generation for resource facilities (handled in real-time tick)
              } else {
                // Money Income
                facilityIncome += facility.dailyIncome * count;
              }
            }
          });

          if (facilityIncome > 0) {
            // Apply Economy bonus (e.g., 1% per 2 points of economy above 50)
            const economyBonus = Math.max(0, (state.countyStats.economy - 50) / 200);
            const developmentPath = getCountyDevelopmentPath(state.countyDevelopment?.currentPath || 'none');
            const developmentBonus = developmentPath?.facilityIncomeMultiplier || 1;
            // 应用 Debuff 产业收益乘区（debuffResult.facilityIncomeMultiplier 已含路线减伤后的修正）
            const debuffFacilityMult = Math.max(0, debuffResult.facilityIncomeMultiplier);
            facilityIncome = Math.floor(facilityIncome * (1 + economyBonus) * developmentBonus * debuffFacilityMult);
            newPlayerStats.money += facilityIncome;
            facilityMessage = `【产业收益】昨日产业共盈利 ${facilityIncome} 文。`;
          }

          // if (resourceMessage) {
          //    resourceMessage = `【产业产出】${resourceMessage}。`;
          // }

          // Mower Logic
          const hasMower = state.leekFacilities?.['mower'];
          const mowerHarvestedPlots = new Set<number>();
          let mowerHarvestCount = 0;
          let leekQuality100FromMower = false;

          if (hasMower) {
            (state.leekPlots || []).forEach(p => {
              const target = p.growthTarget || 3;
              if (p.varietyId && ((p.ready) || ((p.growthProgress || 0) >= target))) {
                const quality = p.quality || 0;
                const base = (p as any).baseYield || 3;
                const yieldAmount =
                  p.varietyId === LEEK_SKYSCRAPER_VARIETY_ID
                    ? 2000
                    : base + Math.floor(quality / 25);
                mowerHarvestCount += yieldAmount;
                mowerHarvestedPlots.add(p.id);
                if (quality >= 100) leekQuality100FromMower = true;
              }
            });
          }

          // Inventory Spoilage Logic
          const newOwnedGoods = { ...state.ownedGoods };
          if (mowerHarvestCount > 0) {
            newOwnedGoods['leek'] = (newOwnedGoods['leek'] || 0) + mowerHarvestCount;
          }

          let spoilageMessage = '';
          const spoiledItems: string[] = [];

          const coldLevel = getEffectiveLeekColdStorageLevel(state);
          const hasProcessingTable = state.leekFacilities?.['processing_table'];

          goods.forEach(good => {
            const count = newOwnedGoods[good.id] || 0;
            if (count > 0 && good.spoilageRate && good.spoilageRate > 0) {
              let rate = good.spoilageRate;
              if (coldLevel > 0) rate *= leekColdSpoilageMultiplier(coldLevel);
              if (good.id === 'leek_box' && hasProcessingTable) rate = 0.01; // Minimal spoilage

              const exactSpoilage = count * rate;
              let finalSpoilage = Math.floor(exactSpoilage);
              if (Math.random() < (exactSpoilage - finalSpoilage)) {
                finalSpoilage += 1;
              }

              if (finalSpoilage > 0) {
                newOwnedGoods[good.id] = Math.max(0, count - finalSpoilage);
                spoiledItems.push(`${good.name} ${finalSpoilage} ${good.id === 'grain' ? '石' : '个'}`);
              }
            }
          });

          if (spoiledItems.length > 0) {
            spoilageMessage = `【损耗】物资变质：${spoiledItems.join('，')}。`;
          }

          // Debt Interest
          if (newPlayerStats.debt && newPlayerStats.debt > 0) {
            const interest = Math.ceil(newPlayerStats.debt * 0.001); // 0.1% daily
            newPlayerStats.debt += interest;
          }

          // Tax Mechanism: Progressive property tax（降税令：剩余天数内实际税率减半，每日过日递减一天）
          const prevTaxHalvingLeft = state.propertyTaxHalvingDaysLeft ?? 0;
          const taxHalvingActive = prevTaxHalvingLeft > 0;
          let taxMessage = '';
          let taxRate = 0;
          let taxBracketReason = '';
          if (newPlayerStats.money > 6000000) {
            taxRate = 0.5;
            taxBracketReason = '由于家产过盛（超过600万文）';
          } else if (newPlayerStats.money > 3000000) {
            taxRate = 0.3;
            taxBracketReason = '由于家产丰厚（超过300万文）';
          } else if (newPlayerStats.money > 2000000) {
            taxRate = 0.2;
            taxBracketReason = '由于家产殷实（超过200万文）';
          } else if (newPlayerStats.money > 1000000) {
            taxRate = 0.1;
            taxBracketReason = '由于家产丰厚（超过100万文）';
          }
          if (taxRate > 0) {
            const effectiveRate = taxHalvingActive ? taxRate * 0.5 : taxRate;
            const tax = Math.floor(newPlayerStats.money * effectiveRate);
            newPlayerStats.money -= tax;
            const pctLabel = Math.round(effectiveRate * 100);
            const halvingNote = taxHalvingActive ? '（降税令生效）' : '';
            taxMessage = `【税收】${taxBracketReason}，官府强制征收了 ${pctLabel}% 的财产税，扣除 ${tax} 文${halvingNote}。`;
          }
          const nextPropertyTaxHalvingDaysLeft =
            taxHalvingActive ? prevTaxHalvingLeft - 1 : prevTaxHalvingLeft;

          // Weather Generation
          const nextDayVal = state.day + 1;
          const { seasonIndex, dayOfSeason } = getDateInfo(nextDayVal);

          // Maintenance (Season Change)
          let maintenanceMessage = '';
          if (dayOfSeason === 1 && state.day > 1) {
            let cost = 0;
            if (state.leekFacilities?.['drip_irrigation']) cost += 10;
            if (cost > 0) {
              newPlayerStats.money -= cost;
              maintenanceMessage = `【维护】支付设施维护费 ${cost} 文。`;
            }
          }

          const nextWeather = generateWeather(seasonIndex);
          const weatherNames: Record<string, string> = {
            'sunny': '晴',
            'cloudy': '阴',
            'rain_light': '小雨',
            'rain_heavy': '大雨',
            'snow_light': '小雪',
            'snow_heavy': '大雪'
          };

          // Disaster Logic
          let disasterMessage = '';
          let nextDisasterState = { ...state.disasterState };

          if (state.disasterState.active) {
            const newDuration = state.disasterState.duration - 1;
            if (newDuration <= 0) {
              nextDisasterState = { ...nextDisasterState, active: false, type: 'none', duration: 0 };
              disasterMessage = '【灾情】洪水终于退去，百姓们开始重建家园。';
            } else {
              nextDisasterState = { ...nextDisasterState, duration: newDuration };
              disasterMessage = `【灾情】洪水肆虐，由于灾情严重，百姓流离失所（剩余 ${newDuration} 天）。`;
            }
          } else {
            // Try trigger
            // Summer is index 1
            // Once a year (360 days) or longer.
            const lastTrigger = state.disasterState.lastTriggerDay || 0;
            const daysSinceLast = nextDayVal - lastTrigger;

            if (seasonIndex === 1 && daysSinceLast > 300) {
              // 1% chance per day in Summer
              if (Math.random() < 0.01) {
                const duration = Math.floor(Math.random() * 5) + 3; // 3-7 days
                nextDisasterState = {
                  type: 'flood',
                  active: true,
                  duration,
                  lastTriggerDay: nextDayVal
                };
                disasterMessage = '【突发】连日暴雨引发山洪，柳园以南一片汪洋，急需赈灾！';
              }
            }
          }

          // External Threat (Bandits / War)
          let threatMessage = '';
          let warMessage = '';
          let isGameOver = state.isGameOver;
          let raidOccurred = false;
          const avgCounty = (newCountyStats.economy + newCountyStats.order + newCountyStats.culture + newCountyStats.livelihood) / 4;
          const noMaintenancePenalty = state.flags['defense_maintained_daily'] ? 0 : 4;
          const declinePenalty = avgCounty < 50 ? Math.ceil((50 - avgCounty) / 6) : -2;
          const orderPenalty = newCountyStats.order < 35 ? 3 : 0;
          const disasterPenalty = nextDisasterState.active ? 3 : 0;
          const officeDefenseBonus = Math.floor((state.officeState?.level || 1) / 2);

          const nextDefense = Math.max(0, Math.min(100, (state.externalThreat?.defense || 40) - 2 + officeDefenseBonus));
          const nextBanditThreat = Math.max(0, Math.min(100, (state.externalThreat?.banditThreat || 15) + noMaintenancePenalty + declinePenalty + orderPenalty + disasterPenalty));
          const riskBase = nextBanditThreat - Math.floor(nextDefense * 0.6) + (newCountyStats.order < 25 ? 8 : 0);
          const nextWarRisk = Math.max(0, Math.min(100, riskBase));

          let nextExternalThreat = {
            banditThreat: nextBanditThreat,
            defense: nextDefense,
            warRisk: nextWarRisk,
            lastRaidDay: state.externalThreat?.lastRaidDay || 0,
          };

          if (!state.flags['defense_maintained_daily']) {
            threatMessage = '【边防】今日未进行巡防维护，山贼活动加剧。';
          }

          if (nextWarRisk >= 70 && (nextDayVal - nextExternalThreat.lastRaidDay) >= 3 && Math.random() < (nextWarRisk - 60) / 100) {
            const moneyLoss = Math.min(newPlayerStats.money, Math.floor(80 + nextWarRisk * 2));
            const orderLoss = Math.min(newCountyStats.order, 8);
            const livelihoodLoss = Math.min(newCountyStats.livelihood, 6);
            newPlayerStats.money -= moneyLoss;
            newCountyStats.order = Math.max(0, newCountyStats.order - orderLoss);
            newCountyStats.livelihood = Math.max(0, newCountyStats.livelihood - livelihoodLoss);
            nextExternalThreat = {
              ...nextExternalThreat,
              banditThreat: Math.min(100, nextExternalThreat.banditThreat + 6),
              warRisk: Math.min(100, nextExternalThreat.warRisk + 8),
              lastRaidDay: nextDayVal,
            };
            warMessage = `【战火】山贼夜袭县境，损失银两 ${moneyLoss} 文，治安-${orderLoss}、民生-${livelihoodLoss}。`;
            raidOccurred = true;
          }

          if (nextExternalThreat.warRisk >= 95 && newCountyStats.order <= 10 && newCountyStats.economy <= 10) {
            isGameOver = true;
            warMessage = '【战火覆城】县城长期失修、民心离散，最终毁于战火。';
          }

          // ── 自动巡逻每日效果 ────────────────────────────────────────
          let patrolMessage = '';
          const currentOfficeState = state.officeState || { level: 1, isUpgrading: false };
          if ((currentOfficeState.autoPatrolDaysLeft || 0) > 0) {
            const patrolDaysLeft = currentOfficeState.autoPatrolDaysLeft! - 1;
            const orderGain = 3;
            const defenseGain = 2;
            const banditReduction = 3;

            nextExternalThreat = {
              ...nextExternalThreat,
              defense: Math.min(100, nextExternalThreat.defense + defenseGain),
              banditThreat: Math.max(0, nextExternalThreat.banditThreat - banditReduction),
            };
            newCountyStats.order = Math.min(100, newCountyStats.order + orderGain);

            patrolMessage = `【自动巡逻】巡逻小队正在执勤，治安+${orderGain}，山贼威胁-${banditReduction}。`;

            // 更新剩余天数
            set(s => ({
              officeState: {
                ...(s.officeState || { level: 1, isUpgrading: false }),
                autoPatrolDaysLeft: patrolDaysLeft > 0 ? patrolDaysLeft : undefined,
              }
            }));
          }
          // ─────────────────────────────────────────────────────────

          // Reset daily flags
          const newFlags = { ...state.flags };
          Object.keys(newFlags).forEach(key => {
            if (key.endsWith('_daily')) {
              delete newFlags[key];
            }
          });

          // ── 赛鸽日结算 ────────────────────────────────────────
          const pigeonMessages: string[] = [];
          const newPigeons = (state.pigeons || []).map(pigeon => {
            let updated = { ...pigeon };
            // 受伤恢复倒计时
            if (updated.condition === 'injured') {
              const daysLeft = Math.max(0, (updated.injuredDaysLeft ?? 1) - 1);
              if (daysLeft <= 0) {
                updated = { ...updated, condition: 'healthy' as const, injuredDaysLeft: undefined };
                pigeonMessages.push(`【赛鸽】${pigeon.name} 伤势已愈，恢复健康。`);
              } else {
                updated = { ...updated, injuredDaysLeft: daysLeft };
              }
            }
            // 丢失归巢判定（按归巢值概率）
            if (updated.condition === 'lost') {
              const homingRate = updated.stats.homing / 100;
              const weatherMod = getWeatherRaceRiskModifier(nextWeather);
              const returnChance = Math.max(0.1, homingRate - weatherMod.lostBonus);
              if (Math.random() < returnChance) {
                updated = { ...updated, condition: 'healthy' as const };
                pigeonMessages.push(`【赛鸽】${pigeon.name} 历尽艰辛，终于归巢！`);
              } else {
                pigeonMessages.push(`【赛鸽】${pigeon.name} 仍未返巢，继续等待…`);
              }
            }
            // 疲劳自然恢复 -20
            updated = { ...updated, fatigue: Math.max(0, updated.fatigue - 20) };
            // 代谢损伤缓慢恢复
            const md = updated.metabolicDamage ?? 0;
            if (md > 0) {
              const dec = 1 + Math.floor(Math.random() * 2);
              updated = { ...updated, metabolicDamage: Math.max(0, md - dec) };
            }
            // 速燃剂速度 debuff 按日递减
            const sdl = updated.speedDebuffDaysLeft ?? 0;
            if (sdl > 0) {
              const nextS = sdl - 1;
              updated = {
                ...updated,
                speedDebuffDaysLeft: nextS > 0 ? nextS : undefined,
                speedDebuffAmount: nextS > 0 ? updated.speedDebuffAmount : undefined,
              };
            }
            // 强效剂训练 debuff 按日递减
            const tel = updated.trainEfficiencyDebuffDaysLeft ?? 0;
            if (tel > 0) {
              const nextT = tel - 1;
              updated = {
                ...updated,
                trainEfficiencyDebuffDaysLeft: nextT > 0 ? nextT : undefined,
              };
            }
            return updated;
          });
          // ─────────────────────────────────────────────────────

          const logs = [recoveryMessage, ...state.logs];
          pigeonMessages.forEach(m => logs.unshift(m));
          if (policyMessage) logs.unshift(policyMessage);
          if (voiceMessage) logs.unshift(voiceMessage);
          if (facilityMessage) logs.unshift(facilityMessage);
          if (resourceMessage) logs.unshift(resourceMessage);
          if (spoilageMessage) logs.unshift(spoilageMessage);
          if (marketStateMessage) logs.unshift(marketStateMessage);
          if (mowerHarvestCount > 0) logs.unshift(`【自动收割】割草机自动收割了 ${mowerHarvestCount} 捆韭菜。`);
          if (maintenanceMessage) logs.unshift(maintenanceMessage);
          if (taxMessage) logs.unshift(taxMessage);
          if (disasterMessage) logs.unshift(disasterMessage);
          if (threatMessage) logs.unshift(threatMessage);
          if (warMessage) logs.unshift(warMessage);
          if (patrolMessage) logs.unshift(patrolMessage);
          // Debuff 日志（倒序插入，最新在最前）
          debuffResult.logs.slice().reverse().forEach(m => logs.unshift(m));
          // 
          logs.unshift(`【天气】今日天气：${weatherNames[nextWeather]}`);
          logs.unshift('获得 10 点阅历。');

          const prevLg = state.leekGardenStats ?? defaultLeekGardenStats();
          const nextLeekGardenStats: LeekGardenStats = {
            ...prevLg,
            totalHarvestedLeek: prevLg.totalHarvestedLeek + mowerHarvestCount,
            maxQualityAtHarvest: Math.max(prevLg.maxQualityAtHarvest, leekQuality100FromMower ? 100 : 0),
            bestLeekRevenueOneDay: Math.max(prevLg.bestLeekRevenueOneDay, prevLg.leekRevenueToday),
            leekRevenueToday: 0,
          };

          return {
            day: state.day + 1,
            weather: nextWeather,
            disasterState: nextDisasterState,
            externalThreat: nextExternalThreat,
            isGameOver,
            propertyTaxHalvingDaysLeft:
              nextPropertyTaxHalvingDaysLeft > 0 ? nextPropertyTaxHalvingDaysLeft : undefined,
            raidAlert: raidOccurred || undefined,
            marketState: newMarketState,
            marketPrices: newMarketPrices,
            marketInventory: newMarketInventory,
            ownedFacilities: newOwnedFacilities,
            dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0, caveFilled: false, pigeonRace: 0, pigeonBooster: 0, extraDefenseCount: 0 },
            hasInteractedToday: false,
            npcInteractionStates: {}, // Reset daily NPC interaction limits
            // 季一藕医馆动物互动每日重置
            clinicAnimals: {
              ...(state.clinicAnimals || getDefaultClinicAnimalState()),
              birdFeedToday: 0,
              dogBarkToday: 0
            },
            currentEvent: null,
            isVoiceLost: isVoiceLost,
            playerStats: { ...newPlayerStats, experience: (newPlayerStats.experience || 0) + 10 },
            countyStats: newCountyStats,
            inventory: nextInventory,
            logs: logs.slice(0, 500),
            timeSettings: { ...state.timeSettings, dayStartTime: Date.now() }, // Reset timer
            priceLocks: currentPriceLocks,
            fortuneLevel: undefined, // Reset daily fortune
            flags: newFlags, // Apply reset flags
            ownedGoods: newOwnedGoods, // Apply spoilage & harvest
            leekGardenStats: nextLeekGardenStats,
            pigeons: newPigeons, // 赛鸽日结算
            pendingDoping: null,
            pigeonBoosterUnlocked: !!newFlags.pigeon_booster_unlocked || !!state.pigeonBoosterUnlocked,
            leekPlots: (state.leekPlots || []).map(p => {
              // 0. Handle Mower Reset
              if (mowerHarvestedPlots.has(p.id)) {
                const wasSky = p.varietyId === LEEK_SKYSCRAPER_VARIETY_ID;
                return {
                  ...p,
                  varietyId: undefined,
                  growthProgress: 0,
                  watered: false,
                  fertilized: false,
                  pest: 0,
                  quality: 0,
                  ready: false,
                  fertility: wasSky ? 0 : Math.max(0, (p.fertility || 100) - 5)
                };
              }

              // 1. Recover fertility if idle
              if (!p.varietyId) {
                return { ...p, fertility: Math.min(100, (p.fertility || 0) + 5) };
              }

              // 2. Growth logic
              const hasSprinkler = state.leekFacilities?.['sprinkler'] || state.leekFacilities?.['drip_irrigation'];
              const hasLamp = state.leekFacilities?.['pest_lamp'];
              const hasBreedingShed = state.leekFacilities?.['breeding_shed'];

              // Auto water
              let watered = p.watered;
              if (hasSprinkler) {
                watered = true; // Auto water
              }

              let gp = (p.growthProgress || 0) + 1 + (p.fertilized ? 1 : 0);
              const target = p.growthTarget || 3;
              const heavySnowPenalty = nextWeather === 'snow_heavy' ? ((p as any).toughness && (p as any).toughness >= 75 ? 0 : -1) : 0;
              gp = Math.max(0, gp + heavySnowPenalty);

              // Pest
              let pestChance = 0.3;
              if (hasLamp) pestChance = 0.05;
              const tough = (p as any).toughness || 0;
              pestChance = Math.max(0, Math.min(1, pestChance * (1 - tough / 200)));
              const pestRise = Math.random() < pestChance ? 5 : 0;

              const wateredBonus = watered ? 1 : 0;
              const breedingBonus = hasBreedingShed ? 1 : 0;
              const quality = Math.max(0, Math.min(100, (p.quality || 0) + wateredBonus + breedingBonus - (pestRise > 0 ? 1 : 0)));
              const pest = Math.min(100, (p.pest || 0) + pestRise);
              const ready = gp >= target;

              // Consume fertility daily
              const newFertility = Math.max(0, (p.fertility || 100) - 2);

              return {
                ...p,
                growthProgress: gp,
                watered: false, // Reset watered status for next day manual (sprinkler applies next night)
                fertilized: false,
                pest,
                quality,
                ready,
                fertility: newFertility
              };
            }),
            // Generate Orders with relationship-driven priority and hedge on undercut days
            leekOrders: (() => {
              const highRelationsCount = Object.values(state.npcRelations).filter(r => r > 50).length;
              const baseChance = 0.5;
              const relationBonus = Math.min(0.4, highRelationsCount * 0.1); // up to +40%
              const hedgeBonus = newMarketState === 'undercut' ? 0.2 : 0; // more likely when market is undercut
              const orderChance = Math.min(0.95, baseChance + relationBonus + hedgeBonus);

              const willGenerate = Math.random() < orderChance;
              const existing = state.leekOrders || [];
              if (!willGenerate) return existing;

              const relationFactor = Math.min(5, highRelationsCount);
              const baseQty = Math.floor(Math.random() * 5) + 3; // 3-7
              const quantity = Math.max(1, baseQty - Math.floor(relationFactor / 2)); // reduce requirement up to -2
              const minQuality = 60 - relationFactor * 2; // slightly lower threshold with trust
              const priceMultiplier = 1.5 + relationFactor * 0.05; // up to +0.25
              const expiresIn = relationFactor >= 3 ? 2 : 1; // priority/longer window

              const newOrder = {
                id: `order_${Date.now()}`,
                description: '合作社收购优质鲜韭',
                minQuality: Math.max(0, minQuality),
                quantity,
                priceMultiplier,
                expiresIn
              };

              const list = [newOrder, ...existing].slice(0, 3);
              if (newMarketState === 'undercut') {
                // Log hedge info when undercut day and order exists
                get().addLog('【订单】合作社稳价对冲压价，订单价格不受市场压价影响。');
              }
              return list;
            })()
          };
        });
        get().addLog(`第 ${get().day} 天`);
        if (get().isGameOver) return;
        get().checkAchievements();
        get().checkTaskCompletion();

        // ── 步骤 4（战火余波）：夜袭后附加安置压力 & 概率商会恐慌 ──
        const currentStateAfter = get();
        if (currentStateAfter.raidAlert) {
          // 安置压力（必触发）
          get().addDebuff('settlement_pressure', '山贼夜袭');
          // 商会恐慌（概率触发）
          const existingMerchantPanic = (currentStateAfter.activeDebuffs || []).find(d => d.configId === 'merchant_panic');
          const panicProb = existingMerchantPanic ? 0.95 : 0.7;
          if (Math.random() < panicProb) {
            get().addDebuff('merchant_panic', '山贼夜袭');
          }
        }

        get().triggerEvent();
      },

      processResourceTick: () => {
        const state = get();
        if (state.timeSettings.isPaused) return;

        let newInventory = { ...state.inventory };
        let hasChanges = false;

        Object.entries(state.ownedFacilities).forEach(([facilityId, count]) => {
          const facility = facilities.find(f => f.id === facilityId);
          if (facility && count > 0 && facility.type === 'resource' && facility.resourceType && facility.resourceAmount) {
            // Production per tick (every 2s)
            const amount = facility.resourceAmount * count;
            newInventory = invAdd(newInventory, facility.resourceType!, amount);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          set({ inventory: newInventory });
        }
      },

      // ── 赛鸽系统动作 ──────────────────────────────────────────
      buyPigeon: (name) => {
        const state = get();
        const PRICE = 150;
        if (state.playerStats.money < PRICE) {
          get().addLog(`【赛鸽】购鸽失败：钱财不足（需 ${PRICE} 文）。`);
          return;
        }
        const pigeonName = name || `信鸽·${String(state.pigeons.length + 1).padStart(2, '0')}`;
        const newPigeon: Pigeon = {
          id: `pigeon_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: pigeonName,
          level: 1,
          stats: {
            speed:     Math.floor(20 + Math.random() * 25), // 20-44
            endurance: Math.floor(20 + Math.random() * 25),
            homing:    Math.floor(20 + Math.random() * 25),
            courage:   Math.floor(20 + Math.random() * 25),
          },
          fatigue: 0,
          condition: 'healthy',
          winCount: 0,
          raceCount: 0,
        };
        set(s => ({
          playerStats: { ...s.playerStats, money: s.playerStats.money - PRICE },
          pigeons: [...s.pigeons, newPigeon],
        }));
        get().addLog(`【赛鸽】以 ${PRICE} 文购得信鸽"${pigeonName}"（速度${newPigeon.stats.speed}/耐力${newPigeon.stats.endurance}/归巢${newPigeon.stats.homing}/胆气${newPigeon.stats.courage}）。`);
        setTimeout(() => get().checkAchievements(), 0);
      },

      renamePigeon: (id, name) => {
        set(s => ({
          pigeons: s.pigeons.map(p => p.id === id ? { ...p, name } : p),
        }));
        get().addLog(`【赛鸽】信鸽更名为"${name}"。`);
      },

      trainPigeon: (id, mode) => {
        const state = get();
        const pigeon = (state.pigeons || []).find(p => p.id === id);
        if (!pigeon) { get().addLog('【赛鸽】训练失败：未找到指定信鸽。'); return; }
        if (pigeon.condition === 'injured') { get().addLog(`【赛鸽】${pigeon.name} 正在养伤，无法训练。`); return; }
        if (pigeon.condition === 'lost')    { get().addLog(`【赛鸽】${pigeon.name} 尚未归巢，无法训练。`); return; }

        // 消耗：体力 / 金钱
        const costTable = { speed: { health: 4, money: 8 }, endurance: { health: 5, money: 10 }, homing: { health: 3, money: 6 } };
        const cost = costTable[mode];
        if (state.playerStats.health < cost.health) { get().addLog('【赛鸽】体力不足，无法训练。'); return; }
        if (state.playerStats.money < cost.money)   { get().addLog('【赛鸽】钱财不足，无法支付训练费用。'); return; }

        // 属性提升（强效剂后遗症：训练收益 -30%）
        const debuffDays = pigeon.trainEfficiencyDebuffDaysLeft ?? 0;
        const gainRaw = 1 + Math.floor(Math.random() * 2); // 1-2
        const gain = debuffDays > 0 ? Math.max(1, Math.round(gainRaw * 0.7)) : gainRaw;
        const fatigueAdd = mode === 'speed' ? 12 : mode === 'endurance' ? 10 : 8;
        const newFatigue = Math.min(100, pigeon.fatigue + fatigueAdd);

        // 副作用：疲劳 > 70 时有小概率受伤
        let newCondition: import('@/types/game').PigeonCondition = pigeon.condition;
        let injuredDaysLeft: number | undefined = pigeon.injuredDaysLeft;
        let injuryMsg = '';
        if (newFatigue > 70 && Math.random() < 0.12) {
          newCondition = 'injured';
          injuredDaysLeft = 1 + Math.floor(Math.random() * 2); // 1-2 天
          injuryMsg = `过度训练导致 ${pigeon.name} 受伤，需要 ${injuredDaysLeft} 天恢复！`;
        }

        const statKey = mode === 'speed' ? 'speed' : mode === 'endurance' ? 'endurance' : 'homing';
        const newStats = { ...pigeon.stats, [statKey]: clampStat(pigeon.stats[statKey] + gain) };

        set(s => ({
          playerStats: {
            ...s.playerStats,
            health: s.playerStats.health - cost.health,
            money:  s.playerStats.money  - cost.money,
          },
          pigeons: s.pigeons.map(p => p.id === id
            ? { ...p, stats: newStats, fatigue: newFatigue, condition: newCondition, injuredDaysLeft }
            : p
          ),
        }));

        const modeNames = { speed: '速度', endurance: '耐力', homing: '归巢' };
        const debuffNote = debuffDays > 0 ? '（代谢紊乱，训练收效降低）' : '';
        get().addLog(`【赛鸽】${pigeon.name} 完成${modeNames[mode]}训练，${modeNames[mode]}+${gain}（当前 ${newStats[statKey]}），疲劳度 ${newFatigue}。${injuryMsg}${debuffNote}`);
        setTimeout(() => get().checkAchievements(), 0);
      },

      usePigeonBooster: (pigeonId, tier) => {
        const state = get();
        if (!isPigeonBoosterUnlocked(state)) {
          get().addLog('【赛鸽·灰市】你尚未结识药商门路（需累计参赛并偶遇信使）。');
          return;
        }
        if (state.pigeonBoosterLockUntilDay != null && state.day <= state.pigeonBoosterLockUntilDay) {
          get().addLog('【赛鸽·灰市】药商近日避风头，暂无货源。');
          return;
        }
        if ((state.dailyCounts.pigeonBooster || 0) >= 1) {
          get().addLog('【赛鸽·灰市】今日已用过补剂，不可再服。');
          return;
        }
        if ((state.dailyCounts.pigeonRace || 0) >= 1) {
          get().addLog('【赛鸽·灰市】今日已赛过，补剂仅可在赛前使用。');
          return;
        }
        const cfg = PIGEON_DOPING_TIERS[tier];
        if (state.playerStats.money < cfg.cost) {
          get().addLog(`【赛鸽·灰市】铜钱不足（需 ${cfg.cost} 文）。`);
          return;
        }
        const pigeon = (state.pigeons || []).find(p => p.id === pigeonId);
        if (!pigeon) {
          get().addLog('【赛鸽·灰市】未找到信鸽。');
          return;
        }
        if (pigeon.condition === 'injured' || pigeon.condition === 'lost') {
          get().addLog(`【赛鸽·灰市】${pigeon.name} 状态不佳，不宜用药。`);
          return;
        }
        if (pigeon.raceBannedUntilDay != null && state.day <= pigeon.raceBannedUntilDay) {
          get().addLog(`【赛鸽·灰市】${pigeon.name} 仍在禁赛期。`);
          return;
        }

        const nextStreak =
          state.lastPlayerDopingDay > 0 && state.day === state.lastPlayerDopingDay + 1
            ? state.dopingStreak + 1
            : 1;

        set(s => ({
          playerStats: { ...s.playerStats, money: s.playerStats.money - cfg.cost },
          pendingDoping: { pigeonId, tier },
          dailyCounts: { ...s.dailyCounts, pigeonBooster: (s.dailyCounts.pigeonBooster || 0) + 1 },
          dopingStreak: nextStreak,
          lastPlayerDopingDay: state.day,
        }));
        get().addLog(
          `【赛鸽·灰市】为「${pigeon.name}」购入${cfg.label}（-${cfg.cost} 文）。` +
            `赛后可能代谢紊乱，且存在抽检风险（档位基础 ${Math.round(cfg.baseCatch * 100)}%` +
            `${isBadWeatherForDopingInspection(state.weather) ? '，恶劣天气+3%' : ''}` +
            `${nextStreak > 1 ? `，连续用药+${Math.min((nextStreak - 1) * 5, 20)}%` : ''}）。`
        );
      },

      enterPigeonRace: (id, raceType) => {
        const state = get();
        const rng = Math.random;
        if ((state.dailyCounts.pigeonRace || 0) >= 1) {
          get().addLog('【赛鸽】今日已参赛一次，明日再战。');
          return;
        }
        const pigeon = (state.pigeons || []).find(p => p.id === id);
        if (!pigeon) { get().addLog('【赛鸽】未找到指定信鸽。'); return; }
        if (pigeon.condition === 'injured') { get().addLog(`【赛鸽】${pigeon.name} 正在养伤，无法参赛。`); return; }
        if (pigeon.condition === 'lost')    { get().addLog(`【赛鸽】${pigeon.name} 尚未归巢，无法参赛。`); return; }
        if (pigeon.raceBannedUntilDay != null && state.day <= pigeon.raceBannedUntilDay) {
          get().addLog(`【赛鸽】${pigeon.name} 仍在禁赛期，无法参赛。`);
          return;
        }

        const pending = state.pendingDoping;
        if (pending && pending.pigeonId !== id) {
          get().addLog('【赛鸽】今日灰市补剂已绑定另一只信鸽，请选用那只参赛，或明日再议。');
          return;
        }

        const entryFee = raceType === 'sprint' ? 20 : 35;
        if (state.playerStats.money < entryFee) {
          get().addLog(`【赛鸽】报名费不足（需 ${entryFee} 文）。`);
          return;
        }
        if (state.playerStats.health < 5) {
          get().addLog('【赛鸽】体力过低，无法亲自护送参赛。');
          return;
        }

        const boosterTier = pending?.pigeonId === id ? pending.tier : undefined;
        const dopingCfg = boosterTier ? PIGEON_DOPING_TIERS[boosterTier] : undefined;

        const score = calcPigeonRaceScore(pigeon, raceType, state.weather, { boosterTier, rng });
        let rank = rollRaceRank(score, rng, boosterTier === 3);
        let reward = rank <= 3 ? calcRaceReward(raceType, rank) : { money: 0, reputation: 0 };

        // 灰市抽检（仅用药场次）
        let dopingCaught = false;
        let inspectionParts: string[] = [];
        let catchFine = 0;
        let catchRep = 0;
        let newBanUntil: number | undefined;
        let nextCaughtDays = [...(state.pigeonDopingCaughtDays || [])].filter(d => state.day - d < 7);
        let boosterLockUntil: number | undefined = state.pigeonBoosterLockUntilDay;
        let dopingHeavyInjuryDays: number | undefined;

        if (boosterTier && dopingCfg) {
          let catchP = dopingCfg.baseCatch;
          if (isBadWeatherForDopingInspection(state.weather)) {
            catchP += 0.03;
            inspectionParts.push('恶劣天气+3%');
          }
          const streakExtra = Math.min(Math.max(0, state.dopingStreak - 1) * 0.05, 0.2);
          if (streakExtra > 0) inspectionParts.push(`连续用药+${Math.round(streakExtra * 100)}%`);
          catchP += streakExtra;
          catchP = Math.max(0, Math.min(0.92, catchP));
          dopingCaught = rng() < catchP;
          inspectionParts.push(`终判抽检率 ${Math.round(catchP * 100)}%`);

          if (dopingCaught) {
            const catchesIn7d = nextCaughtDays.length;
            const mult = catchesIn7d >= 2 ? 2 : catchesIn7d >= 1 ? 1.5 : 1;
            nextCaughtDays.push(state.day);
            const sevRoll = rng();
            if (sevRoll < 0.45) {
              catchFine = Math.round((80 + Math.floor(rng() * 121)) * mult);
              catchRep = -Math.round((5 + Math.floor(rng() * 8)) * mult);
              inspectionParts.push(`轻度：罚${catchFine}文`);
            } else if (sevRoll < 0.8) {
              const banDays = 2 + Math.floor(rng() * 3);
              newBanUntil = state.day + banDays;
              catchRep = -Math.round((10 + Math.floor(rng() * 11)) * mult);
              inspectionParts.push(`中度：禁赛${banDays}天`);
            } else {
              catchFine = Math.round((40 + Math.floor(rng() * 61)) * mult);
              catchRep = -Math.round((20 + Math.floor(rng() * 21)) * mult);
              dopingHeavyInjuryDays = 3 + Math.floor(rng() * 3);
              inspectionParts.push(`重度：罚${catchFine}文、强制休养${dopingHeavyInjuryDays}天`);
            }
            if (catchesIn7d >= 2) {
              boosterLockUntil = state.day + 5;
              inspectionParts.push('累犯：药商锁定数日');
            }
            reward = { money: 0, reputation: 0 };
          }
        }

        const riskMod = getWeatherRaceRiskModifier(state.weather);
        let newCondition: import('@/types/game').PigeonCondition = pigeon.condition;
        let injuredDaysLeft: number | undefined = pigeon.injuredDaysLeft;
        let riskMsg = '';
        const lostRoll = rng();
        const injRoll = rng();
        if (!dopingCaught && lostRoll < riskMod.lostBonus) {
          newCondition = 'lost';
          riskMsg = `${pigeon.name} 在归途迷失，下落不明！`;
        } else if (
          !dopingCaught &&
          injRoll <
          riskMod.injuryBonus + (boosterTier === 3 ? 0.2 : 0)
        ) {
          newCondition = 'injured';
          injuredDaysLeft = 1 + Math.floor(rng() * 2);
          riskMsg = `${pigeon.name} 比赛中受伤，需要 ${injuredDaysLeft} 天恢复。`;
        }
        if (dopingCaught && dopingHeavyInjuryDays != null) {
          newCondition = 'injured';
          injuredDaysLeft = dopingHeavyInjuryDays;
          riskMsg = `${pigeon.name} 赛后抽检风波中身心俱疲，需休养 ${dopingHeavyInjuryDays} 天。`;
        }

        const fatigueRace = 20;
        const fatigueDoping = dopingCfg?.postFatigue ?? 0;
        const metabolicDamage = Math.min(100, (pigeon.metabolicDamage ?? 0) + (dopingCfg?.metabolicAdd ?? 0));

        let speedDebuffDaysLeft = pigeon.speedDebuffDaysLeft;
        let speedDebuffAmount = pigeon.speedDebuffAmount;
        let trainEfficiencyDebuffDaysLeft = pigeon.trainEfficiencyDebuffDaysLeft;
        let raceBannedUntilDay = pigeon.raceBannedUntilDay;

        let nextPigeonStats = { ...pigeon.stats };
        if (boosterTier === 1) {
          speedDebuffDaysLeft = 1;
          speedDebuffAmount = 2;
        } else if (boosterTier === 2) {
          trainEfficiencyDebuffDaysLeft = 2;
        } else if (boosterTier === 3 && !dopingCaught) {
          const statKeys = ['speed', 'endurance', 'homing', 'courage'] as const;
          const pick = statKeys[Math.floor(rng() * statKeys.length)];
          const drop = 1 + Math.floor(rng() * 3);
          nextPigeonStats = { ...nextPigeonStats, [pick]: clampStat(nextPigeonStats[pick] - drop) };
        }

        if (newBanUntil != null) raceBannedUntilDay = newBanUntil;

        let nextClean = state.pigeonCleanWinStreak ?? 0;
        if (boosterTier) nextClean = 0;
        else if (rank === 1) nextClean += 1;
        else nextClean = 0;

        const weatherNames: Record<string, string> = {
          sunny: '晴', cloudy: '阴', rain_light: '小雨',
          rain_heavy: '大雨', snow_light: '小雪', snow_heavy: '大雪'
        };
        const raceNames = { sprint: '短程飞行赛', endurance: '长程耐力赛' };
        let rankText = rank <= 3 ? `第 ${rank} 名` : `第 ${rank} 名（未获奖）`;
        if (dopingCaught) rankText = '成绩取消（抽检异常）';

        const dopingNote = boosterTier
          ? dopingCaught
            ? `【灰市】赛后抽检异常：${inspectionParts.join('，')}。`
            : `【灰市】未检出异常（${inspectionParts.join('，')}）。鸽子状态亢奋，呼吸偏促。`
          : '';
        const sequelaeNote =
          boosterTier && !dopingCaught
            ? metabolicDamage >= 40
              ? ' 鸽子出现持续性代谢紊乱迹象，宜减少用药、多加休养。'
              : ''
            : '';

        const record: PigeonRaceRecord = {
          day: state.day,
          pigeonId: id,
          raceType,
          rank: dopingCaught ? 0 : rank,
          score: Math.round(score),
          rewardMoney: reward.money,
          rewardReputation: reward.reputation,
          weather: state.weather,
          note: [riskMsg, dopingNote].filter(Boolean).join(' ') || undefined,
          dopingTier: boosterTier,
          dopingCaught,
          dopingInspectionNote: boosterTier ? inspectionParts.join('；') : undefined,
        };

        const finalMoney =
          state.playerStats.money -
          entryFee +
          reward.money -
          catchFine;
        const finalRep = Math.max(0, state.playerStats.reputation + reward.reputation + catchRep);

        set(s => ({
          playerStats: {
            ...s.playerStats,
            money: finalMoney,
            reputation: finalRep,
            health: s.playerStats.health - 5,
          },
          pigeons: s.pigeons.map(p => {
            if (p.id !== id) return p;
            return {
              ...p,
              stats: nextPigeonStats,
              condition: newCondition,
              injuredDaysLeft,
              fatigue: Math.min(100, p.fatigue + fatigueRace + fatigueDoping),
              metabolicDamage,
              winCount: !dopingCaught && rank === 1 ? p.winCount + 1 : p.winCount,
              raceCount: p.raceCount + 1,
              speedDebuffDaysLeft,
              speedDebuffAmount,
              trainEfficiencyDebuffDaysLeft,
              raceBannedUntilDay,
            };
          }),
          pigeonRaceHistory: [record, ...(s.pigeonRaceHistory || [])].slice(0, 500),
          dailyCounts: { ...s.dailyCounts, pigeonRace: (s.dailyCounts.pigeonRace || 0) + 1 },
          pendingDoping: null,
          pigeonDopingCaughtDays: nextCaughtDays,
          pigeonBoosterLockUntilDay: boosterLockUntil,
          pigeonCleanWinStreak: nextClean,
        }));

        const rewardText = dopingCaught
          ? '成绩取消，无奖金'
          : reward.money > 0
            ? `获得 ${reward.money} 文、${reward.reputation} 声望`
            : '无奖励';
        get().addLog(
          `【赛鸽·${raceNames[raceType]}】${pigeon.name} 在${weatherNames[state.weather]}天气中出赛，` +
            `得分 ${Math.round(score)}，${rankText}。${rewardText}。${riskMsg}${dopingNote ? ' ' + dopingNote : ''}${sequelaeNote}`
        );
        if (catchFine > 0 || catchRep < 0) {
          get().addLog(
            `【赛鸽·灰市】处罚：${catchFine > 0 ? `罚${catchFine}文 ` : ''}${catchRep < 0 ? `声望${catchRep}` : ''}`
          );
        }
        setTimeout(() => get().checkAchievements(), 0);
      },

      selectPigeon: (id) => {
        set({ selectedPigeonId: id });
      },

      releasePigeon: (id, mode) => {
        const state = get();
        const pigeon = (state.pigeons || []).find(p => p.id === id);
        if (!pigeon) {
          get().addLog('【赛鸽】处置失败：未找到指定信鸽。');
          return;
        }
        if (pigeon.condition === 'lost') {
          get().addLog(`【赛鸽】${pigeon.name} 尚未归巢，无法在鸽舍中处置。`);
          return;
        }

        const SELL_PRICE = 100;
        const nextPigeons = state.pigeons.filter(p => p.id !== id);
        const nextSelected =
          state.selectedPigeonId === id ? (nextPigeons[0]?.id ?? undefined) : state.selectedPigeonId;

        if (mode === 'soup') {
          set(s => ({
            pigeons: nextPigeons,
            selectedPigeonId: nextSelected,
            inventory: invAdd(s.inventory, 'pigeon_soup', 1),
          }));
          get().addLog(`【赛鸽】你将「${pigeon.name}」炖成汤，获得美味的鸽子汤一份。`);
        } else if (mode === 'sell') {
          set(s => ({
            pigeons: nextPigeons,
            selectedPigeonId: nextSelected,
            playerStats: { ...s.playerStats, money: s.playerStats.money + SELL_PRICE },
          }));
          get().addLog(`【赛鸽】「${pigeon.name}」已作价 ${SELL_PRICE} 文售出。`);
        } else {
          set({ pigeons: nextPigeons, selectedPigeonId: nextSelected });
          get().addLog(`【赛鸽】你将「${pigeon.name}」放归蓝天，分文不取。`);
        }
        setTimeout(() => get().checkAchievements(), 0);
      },
      // ─────────────────────────────────────────────────────────

      handleEventOption: (effect, message, addDebuffIds) => {
        const state = get();
        let statChanges: string[] = [];

        // Calculate all changes first
        let moneyChange = 0;
        let reputationChange = 0;
        let abilityChange = 0;
        let healthChange = 0;
        let experienceChange = 0;
        let accuracyChange = 0;

        let economyChange = 0;
        let orderChange = 0;
        let cultureChange = 0;
        let livelihoodChange = 0;
        const relationPenaltyMessages: string[] = [];
        const relationPenaltyFlags: string[] = [];
        const relationPenaltyEvents: GameEvent[] = [];
        const redemptionStage2Events: GameEvent[] = [];

        if (effect) {
          // 1. Accumulate changes from nested objects (treating them as deltas)
          if (effect.playerStats) {
            if (effect.playerStats.money) moneyChange += effect.playerStats.money;
            if (effect.playerStats.reputation) reputationChange += effect.playerStats.reputation;
            if (effect.playerStats.ability) abilityChange += effect.playerStats.ability;
            if (effect.playerStats.health) healthChange += effect.playerStats.health;
            if (effect.playerStats.experience) experienceChange += effect.playerStats.experience;
            if (effect.playerStats.accuracy) accuracyChange += effect.playerStats.accuracy;
          }

          if (effect.countyStats) {
            if (effect.countyStats.economy) economyChange += effect.countyStats.economy;
            if (effect.countyStats.order) orderChange += effect.countyStats.order;
            if (effect.countyStats.culture) cultureChange += effect.countyStats.culture;
            if (effect.countyStats.livelihood) livelihoodChange += effect.countyStats.livelihood;
          }

          // 2. Accumulate changes from flat properties
          if (effect.money) moneyChange += effect.money;
          if (effect.reputation) reputationChange += effect.reputation;
          if (effect.ability) abilityChange += effect.ability;
          if (effect.health) healthChange += effect.health;
          if (effect.experience) experienceChange += effect.experience;
          if (effect.accuracy) accuracyChange += effect.accuracy;

          if (effect.economy) economyChange += effect.economy;
          if (effect.order) orderChange += effect.order;
          if (effect.culture) cultureChange += effect.culture;
          if (effect.livelihood) livelihoodChange += effect.livelihood;

          const developmentPath = getCountyDevelopmentPath(state.countyDevelopment?.currentPath || 'none');
          if (developmentPath) {
            moneyChange = applyDevelopmentMultiplier(moneyChange, developmentPath.moneyGainMultiplier, 1);
            reputationChange = applyDevelopmentMultiplier(reputationChange, developmentPath.reputationGainMultiplier, 1);
            economyChange = applyDevelopmentMultiplier(
              economyChange,
              developmentPath.countyGainMultiplier.economy || 1,
              developmentPath.countyLossMultiplier.economy || 1
            );
            orderChange = applyDevelopmentMultiplier(
              orderChange,
              developmentPath.countyGainMultiplier.order || 1,
              developmentPath.countyLossMultiplier.order || 1
            );
            cultureChange = applyDevelopmentMultiplier(
              cultureChange,
              developmentPath.countyGainMultiplier.culture || 1,
              developmentPath.countyLossMultiplier.culture || 1
            );
            livelihoodChange = applyDevelopmentMultiplier(
              livelihoodChange,
              developmentPath.countyGainMultiplier.livelihood || 1,
              developmentPath.countyLossMultiplier.livelihood || 1
            );
          }

          // 3. Apply Talent Modifiers to positive gains
          if (moneyChange > 0) {
            const level = state.talents['mercantile'] || 0;
            moneyChange = Math.floor(moneyChange * (1 + level * 0.1));
          }
          if (reputationChange > 0) {
            const level = state.talents['eloquence'] || 0;
            reputationChange = Math.floor(reputationChange * (1 + level * 0.1));
          }
          if (abilityChange > 0) {
            const level = state.talents['wisdom'] || 0;
            abilityChange = Math.floor(abilityChange * (1 + level * 0.1));
          }

          if (effect.relationChange) {
            Object.entries(effect.relationChange).forEach(([id, val]) => {
              const previousRelation = state.npcRelations[id] || 0;
              const newRelation = previousRelation + val;
              const penalty = resolveRelationPenalties(state, id, previousRelation, newRelation);
              moneyChange += penalty.moneyChange;
              reputationChange += penalty.reputationChange;
              abilityChange += penalty.abilityChange;
              healthChange += penalty.healthChange;
              experienceChange += penalty.experienceChange;
              relationPenaltyMessages.push(...penalty.messages);
              relationPenaltyFlags.push(...penalty.flags);
              if (penalty.events && penalty.events.length > 0) {
                relationPenaltyEvents.push(...penalty.events);
              }
            });
          }

          if (effect.flagsIncrement) {
            effect.flagsIncrement.forEach(key => {
              if (key.startsWith('redemption_stage2_') && !state.flags[key]) {
                const npcId = key.replace('redemption_stage2_', '');
                redemptionStage2Events.push(buildRedemptionEvent(npcId, 2));
              }
            });
          }

          // 4. Generate Log Strings
          const formatChange = (name: string, value: number) => {
            return `${name}${value > 0 ? '+' : ''}${value}`;
          };

          if (healthChange !== 0) statChanges.push(formatChange('体力', healthChange));
          if (moneyChange !== 0) statChanges.push(formatChange('银两', moneyChange));
          if (reputationChange !== 0) statChanges.push(formatChange('声望', reputationChange));
          if (abilityChange !== 0) statChanges.push(formatChange('能力', abilityChange));
          if (experienceChange !== 0) statChanges.push(formatChange('阅历', experienceChange));
          if (accuracyChange !== 0) statChanges.push(formatChange('准头', accuracyChange));

          if (economyChange !== 0) statChanges.push(formatChange('经济', economyChange));
          if (orderChange !== 0) statChanges.push(formatChange('治安', orderChange));
          if (cultureChange !== 0) statChanges.push(formatChange('文化', cultureChange));
          if (livelihoodChange !== 0) statChanges.push(formatChange('民生', livelihoodChange));

          if (effect.itemsAdd && effect.itemsAdd.length > 0) {
            const itemNames = effect.itemsAdd.map(id => items.find(i => i.id === id)?.name || id);
            statChanges.push(`获得 ${itemNames.join('、')}`);
          }

          // 显示概率获得物品的提示（有机会获得）
          if (effect.probabilisticItemsAdd && effect.probabilisticItemsAdd.length > 0) {
            const probItemNames = effect.probabilisticItemsAdd.map(p => {
              const itemName = items.find(i => i.id === p.itemId)?.name || p.itemId;
              return `${itemName}(${Math.round(p.probability * 100)}%)`;
            });
            // statChanges.push(`有机会获得 ${probItemNames.join('、')}`);
          }

          // 显示消耗所有物品并根据数量计算概率的提示
          if (effect.consumeAllAndProbabilisticReward) {
            const { consumeItemId, probabilityPerItem, minProbability, maxProbability, rewardItemId } = effect.consumeAllAndProbabilisticReward;
            const consumeItemName = items.find(i => i.id === consumeItemId)?.name || consumeItemId;
            const rewardItemName = items.find(i => i.id === rewardItemId)?.name || rewardItemId;
            // statChanges.push(`消耗${consumeItemName}计算概率，有机会获得 ${rewardItemName}(${Math.round(minProbability * 100)}%-${Math.round(maxProbability * 100)}%)`);
          }

          if (effect.relationChange) {
            Object.entries(effect.relationChange).forEach(([id, val]) => {
              const npc = npcs.find(n => n.id === id);
              const name = npc ? npc.name : id;
              statChanges.push(`${name}好感${val > 0 ? '+' : ''}${val}`);
            });
          }
        }

        let fullMessage = message || '';
        if (statChanges.length > 0) {
          fullMessage += (fullMessage ? ' ' : '') + statChanges.join('，');
        }
        if (relationPenaltyMessages.length > 0) {
          fullMessage += (fullMessage ? ' ' : '') + relationPenaltyMessages.join(' ');
        }

        if (fullMessage) get().addLog(fullMessage);

        // 用于收集消耗物品的日志
        const consumeResultLogs: string[] = [];

        if (effect) {
          set(state => {
            const newPlayerStats = { ...state.playerStats };
            newPlayerStats.money = (newPlayerStats.money || 0) + moneyChange;
            newPlayerStats.reputation = (newPlayerStats.reputation || 0) + reputationChange;
            newPlayerStats.ability = (newPlayerStats.ability || 0) + abilityChange;
            newPlayerStats.health = (newPlayerStats.health || 0) + healthChange;
            newPlayerStats.experience = (newPlayerStats.experience || 0) + experienceChange;
            newPlayerStats.accuracy = (newPlayerStats.accuracy || 0) + accuracyChange;

            const newCountyStats = { ...state.countyStats };
            newCountyStats.economy = (newCountyStats.economy || 0) + economyChange;
            newCountyStats.order = (newCountyStats.order || 0) + orderChange;
            newCountyStats.culture = (newCountyStats.culture || 0) + cultureChange;
            newCountyStats.livelihood = (newCountyStats.livelihood || 0) + livelihoodChange;

            // Clamp stats
            const fitnessLevel = state.talents['fitness'] || 0;
            const maxHealth = 100 + fitnessLevel * 10;

            newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation);
            newPlayerStats.ability = Math.min(120, Math.max(0, newPlayerStats.ability));
            newPlayerStats.health = Math.min(maxHealth, Math.max(0, newPlayerStats.health));

            newCountyStats.economy = Math.min(100, Math.max(0, newCountyStats.economy));
            newCountyStats.order = Math.min(100, Math.max(0, newCountyStats.order));
            newCountyStats.culture = Math.min(100, Math.max(0, newCountyStats.culture));
            newCountyStats.livelihood = Math.min(100, Math.max(0, newCountyStats.livelihood));

            // 处理百分比扣除
            if (effect.percentDeduct) {
              for (const pd of effect.percentDeduct) {
                if (pd.type === 'money') {
                  const deductAmount = Math.floor((newPlayerStats.money || 0) * pd.percent);
                  newPlayerStats.money = (newPlayerStats.money || 0) - deductAmount;
                  statChanges.push(`银两-${Math.round(pd.percent * 100)}%`);
                } else if (pd.type === 'health') {
                  const deductAmount = Math.floor((newPlayerStats.health || 0) * pd.percent);
                  newPlayerStats.health = (newPlayerStats.health || 0) - deductAmount;
                  statChanges.push(`体力-${Math.round(pd.percent * 100)}%`);
                }
              }
            }

            let newInventory = { ...state.inventory };
            if (effect.itemsAdd) {
              for (const id of effect.itemsAdd) {
                newInventory = invAdd(newInventory, id);
              }
            }
            if (effect.itemsRemove) {
              for (const itemId of effect.itemsRemove) {
                newInventory = invRemoveOne(newInventory, itemId);
              }
            }
            // 处理概率获得物品
            if (effect.probabilisticItemsAdd) {
              for (const probItem of effect.probabilisticItemsAdd) {
                if (Math.random() < probItem.probability) {
                  const count = probItem.count || 1;
                  for (let i = 0; i < count; i++) {
                    newInventory = invAdd(newInventory, probItem.itemId);
                  }
                  const itemName = items.find(i => i.id === probItem.itemId)?.name || probItem.itemId;
                  consumeResultLogs.push(`获得 ${itemName}！`);
                }
              }
            }
            // 处理消耗所有物品并根据数量计算概率获得奖励
            if (effect.consumeAllAndProbabilisticReward) {
              const { consumeItemId, probabilityPerItem, minProbability, maxProbability, rewardItemId, rewardItemCount } = effect.consumeAllAndProbabilisticReward;
              const consumeCount = newInventory[consumeItemId] || 0;
              const consumeItemName = items.find(i => i.id === consumeItemId)?.name || consumeItemId;
              if (consumeCount > 0) {
                // 消耗所有该物品
                for (let i = 0; i < consumeCount; i++) {
                  newInventory = invRemoveOne(newInventory, consumeItemId);
                }
                let consumeResultLog = `消耗${consumeCount}个${consumeItemName}，`;
                // 计算概率：每个羽毛增加指定概率，封顶maxProbability
                const probability = Math.min(maxProbability, minProbability + consumeCount * probabilityPerItem);
                if (Math.random() < probability) {
                  const count = rewardItemCount || 1;
                  for (let i = 0; i < count; i++) {
                    newInventory = invAdd(newInventory, rewardItemId);
                  }
                  const rewardItemName = items.find(i => i.id === rewardItemId)?.name || rewardItemId;
                  consumeResultLog += `成功获得 ${rewardItemName}！`;
                } else {
                  consumeResultLog += '很遗憾，未能获得奖励。';
                }
                consumeResultLogs.push(consumeResultLog);
              }
            }

            const newNpcRelations = { ...state.npcRelations };
            if (effect.relationChange) {
              Object.entries(effect.relationChange).forEach(([id, val]) => {
                newNpcRelations[id] = (newNpcRelations[id] || 0) + val;
              });
            }

            const newFlags = { ...state.flags, ...effect.flagsSet };

            // Handle special flags
            let isMoGuRenaming = state.isMoGuRenaming;
            if (newFlags['mo_gu_rename_triggered']) {
              isMoGuRenaming = true;
              delete newFlags['mo_gu_rename_triggered'];
            }

            if (effect.flagsIncrement) {
              effect.flagsIncrement.forEach(key => {
                newFlags[key] = (newFlags[key] || 0) + 1;
              });
            }

            if (relationPenaltyFlags.length > 0) {
              relationPenaltyFlags.forEach(key => {
                newFlags[key] = 1;
              });
            }

            const queuedEvents = [...relationPenaltyEvents, ...redemptionStage2Events];
            const nextEventQueue = queuedEvents.length > 0 ? [...state.eventQueue, ...queuedEvents] : state.eventQueue;

            return {
              playerStats: newPlayerStats,
              countyStats: newCountyStats,
              inventory: newInventory,
              npcRelations: newNpcRelations,
              flags: newFlags,
              eventQueue: nextEventQueue,
              currentEvent: null,
              isMoGuRenaming: isMoGuRenaming,
              pigeonBoosterUnlocked: !!newFlags.pigeon_booster_unlocked || !!state.pigeonBoosterUnlocked,
            };
          });
          // Check task completion after state update
          get().checkTaskCompletion();
          get().checkAchievements();

          // 处理事件选项附加的 Debuff
          if (addDebuffIds && addDebuffIds.length > 0) {
            addDebuffIds.forEach(debuffId => {
              get().addDebuff(debuffId, '事件选项触发');
            });
          }

          // 输出消耗物品并可能获得奖励的日志
          consumeResultLogs.forEach(log => get().addLog(log));

          // Check for next event in queue
          const currentState = get();
          if (currentState.eventQueue && currentState.eventQueue.length > 0) {
            const [nextEvent, ...remaining] = currentState.eventQueue;
            set({ currentEvent: nextEvent, eventQueue: remaining });
          } else {
            set({ currentEvent: null });
          }
        } else {
          // Check for next event even if no effect (just message confirmation)
          const currentState = get();
          if (currentState.eventQueue && currentState.eventQueue.length > 0) {
            const [nextEvent, ...remaining] = currentState.eventQueue;
            set({ currentEvent: nextEvent, eventQueue: remaining });
          } else {
            set({ currentEvent: null });
          }
        }
      },

      addLog: (message) => set(state => ({ logs: [message, ...state.logs].slice(0, 500) })),

      triggerEvent: () => {
        const state = get();

        const checkBasicCondition = (e: GameEvent) => checkEventTriggerCondition(e, state).passed;

        // 优化：先按概率分类，减少遍历次数
        const guaranteedEvents: GameEvent[] = [];
        const randomCandidates: GameEvent[] = [];
        
        // 遍历一次同时分类
        for (const e of randomEvents) {
          if (!checkBasicCondition(e)) continue;
          const prob = e.triggerCondition?.probability;
          if (prob === 1 || prob === undefined) {
            guaranteedEvents.push(e);
          } else {
            randomCandidates.push(e);
          }
        }
        
        // NPC 事件也加入候选
        for (const e of npcEvents) {
          if (!checkBasicCondition(e)) continue;
          const prob = e.triggerCondition?.probability;
          if (prob === 1 || prob === undefined) {
            guaranteedEvents.push(e);
          } else {
            randomCandidates.push(e);
          }
        }

        const candidates = [...guaranteedEvents, ...randomCandidates];

        // 1. 获取必定触发的事件
        let finalEvents = [...guaranteedEvents];

        // 2. 全局 30% 触发概率，尝试从随机候选中筛选
        if (Math.random() <= 0.3) {
          const possibleRandomEvents = randomCandidates.filter(e => {
            const prob = e.triggerCondition?.probability;
            if (prob === undefined) return true;
            return Math.random() < prob;
          });

          if (possibleRandomEvents.length > 0) {
            // 随机选一个随机事件加入队列
            const randomEvent = possibleRandomEvents[Math.floor(Math.random() * possibleRandomEvents.length)];
            finalEvents.push(randomEvent);
          }
        }

        if (finalEvents.length > 0) {
          const [first, ...rest] = finalEvents;
          set({ currentEvent: first, eventQueue: rest });
        } else {
          set({ currentEvent: null, eventQueue: [] });
        }
      },

      triggerSpecificEvent: (eventId: string) => {
        const state = get();
        // Look in all event collections
        const event = [...npcEvents, ...randomEvents].find(e => e.id === eventId);
        if (!event) return;

        const check = checkEventTriggerCondition(event, state);
        if (!check.passed) {
          get().addLog(`【事件未解锁】${event.title}${check.reason ? `：${check.reason}` : ''}`);
          return;
        }

        set({ currentEvent: event });
      },

      dismissEvent: () => {
        set({ currentEvent: null, eventQueue: [] });
      },

      resetGame: () => {
        set({
          role: null,
          day: 1,
          logs: [],
          currentEvent: null,
          isGameOver: false,
          currentTaskId: undefined,
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0, caveFilled: false, pigeonRace: 0, pigeonBooster: 0, extraDefenseCount: 0 },
          hasInteractedToday: false,
          equippedApparel: {},
          equippedAccessories: [],
          officeState: { level: 1, isUpgrading: false },
          countyDevelopment: { currentPath: 'none', lastSwitchedDay: 1 },
          externalThreat: { banditThreat: 15, defense: 40, warRisk: 5, lastRaidDay: 0 },
          pigeons: [],
          pigeonRaceHistory: [],
          selectedPigeonId: undefined,
          pigeonBoosterUnlocked: false,
          pendingDoping: null,
          dopingStreak: 0,
          lastPlayerDopingDay: 0,
          pigeonDopingCaughtDays: [],
          pigeonBoosterLockUntilDay: undefined,
          pigeonCleanWinStreak: 0,
          propertyTaxHalvingDaysLeft: undefined,
        });
      },

      updateStats: (updates) => {
        set(state => ({
          ...state,
          ...updates,
          playerStats: { ...state.playerStats, ...(updates.playerStats || {}) },
          countyStats: { ...state.countyStats, ...(updates.countyStats || {}) },
        }));
        get().addLog('【系统】开发者模式修改了游戏数据');
      },

      exportSave: () => {
        const state = get();
        const saveData = get().exportSaveString();

        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `wuning_save_${state.role}_day${state.day}_${new Date().toISOString().slice(0, 10)}.json`;
        get().addLog('【系统】已生成下载链接，请手动点击下载。');
        return { url, filename };
      },

      saveToFile: async () => {
        try {
          const state = get();
          const saveData = get().exportSaveString();
          const filename = `wuning_save_${state.role}_day${state.day}_${new Date().toISOString().slice(0, 10)}.json`;
          const anyWindow = window as any;
          if (typeof anyWindow.showSaveFilePicker === 'function') {
            const handle = await anyWindow.showSaveFilePicker({
              suggestedName: filename,
              types: [
                {
                  description: 'JSON 文件',
                  accept: { 'application/json': ['.json'] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(new Blob([saveData], { type: 'application/json' }));
            await writable.close();
            get().addLog('【系统】存档已保存到本地文件。');
            return true;
          } else {
            const { url } = get().exportSave();
            get().addLog('【系统】当前浏览器不支持保存对话框，已生成下载链接。');
            URL.revokeObjectURL(url);
            return true;
          }
        } catch (e) {
          console.error('Save to file failed:', e);
          get().addLog('【系统】保存失败，请稍后再试。');
          return false;
        }
      },

      shareSave: async () => {
        try {
          const state = get();
          const saveData = get().exportSaveString();
          const filename = `wuning_save_${state.role}_day${state.day}_${new Date().toISOString().slice(0, 10)}.json`;
          const file = new File([saveData], filename, { type: 'application/json' });
          const anyNavigator = navigator as any;
          if (typeof anyNavigator.share === 'function' && typeof anyNavigator.canShare === 'function' && anyNavigator.canShare({ files: [file] })) {
            await anyNavigator.share({
              files: [file],
              title: '无宁县志存档',
              text: '分享存档文件',
            });
            get().addLog('【系统】已调用系统分享。');
            return true;
          } else if (typeof anyNavigator.share === 'function') {
            await anyNavigator.share({
              title: '无宁县志存档',
              text: saveData,
            });
            get().addLog('【系统】已分享存档文本。');
            return true;
          } else {
            get().addLog('【系统】当前浏览器不支持分享。');
            return false;
          }
        } catch (e) {
          console.error('Share failed:', e);
          get().addLog('【系统】分享失败，请稍后再试。');
          return false;
        }
      },
      exportSaveString: () => {
        const state = get();
        const saveData = {
          role: state.role,
          day: state.day,
          weather: state.weather,
          marketState: state.marketState,
          playerStats: state.playerStats,
          countyStats: state.countyStats,
          dailyCounts: state.dailyCounts,
          inventory: state.inventory,
          equippedApparel: state.equippedApparel,
          equippedAccessories: state.equippedAccessories,
          flags: state.flags,
          npcRelations: state.npcRelations,
          logs: state.logs,
          currentEvent: state.currentEvent,
          eventQueue: state.eventQueue,
          isGameOver: state.isGameOver,
          currentTaskId: state.currentTaskId,
          completedTaskIds: state.completedTaskIds,
          giftFailureCounts: state.giftFailureCounts,
          npcInteractionStates: state.npcInteractionStates,
          isVoiceLost: state.isVoiceLost,
          collectedScrolls: state.collectedScrolls,
          activePolicyId: state.activePolicyId,
          talents: state.talents,
          achievements: state.achievements,
          playerProfile: state.playerProfile,
          timeSettings: state.timeSettings,
          hasInteractedToday: state.hasInteractedToday,
          soundEnabled: state.soundEnabled,
          volume: state.volume,
          vibrationEnabled: state.vibrationEnabled,
          showBackgroundImage: state.showBackgroundImage,
          glassEffectEnabled: state.glassEffectEnabled,
          officeState: state.officeState,
          countyDevelopment: state.countyDevelopment,
          externalThreat: state.externalThreat,
          disasterState: state.disasterState,
          isExploring: state.isExploring,
          exploreResult: state.exploreResult,
          marketPrices: state.marketPrices,
          marketInventory: state.marketInventory,
          ownedGoods: state.ownedGoods,
          ownedFacilities: state.ownedFacilities,
          priceLocks: state.priceLocks,
          dailyPurchasedGoods: state.dailyPurchasedGoods,
          fortuneLevel: state.fortuneLevel,
          latestUnlockedAchievementId: state.latestUnlockedAchievementId,
          leekPlots: state.leekPlots,
          leekFacilities: state.leekFacilities,
          leekOrders: state.leekOrders,
          leekColdStorageLevel: state.leekColdStorageLevel,
          leekGardenStats: state.leekGardenStats,
          propertyTaxHalvingDaysLeft: state.propertyTaxHalvingDaysLeft,
          timestamp: Date.now(),
          version: '1.0.0'
        };
        return JSON.stringify(saveData, null, 2);
      },

      importSave: (dataStr: string) => {
        try {
          const data = JSON.parse(dataStr);

          // Basic validation
          if (!data.role || !data.playerStats || !data.day) {
            get().addLog('【系统】存档文件格式错误，无法导入。');
            return false;
          }

          const allowedKeys = [
            'role',
            'day',
            'weather',
            'marketState',
            'playerStats',
            'countyStats',
            'dailyCounts',
            'inventory',
            'equippedApparel',
            'equippedAccessories',
            'flags',
            'npcRelations',
            'logs',
            'currentEvent',
            'eventQueue',
            'isGameOver',
            'currentTaskId',
            'completedTaskIds',
            'giftFailureCounts',
            'npcInteractionStates',
            'isVoiceLost',
            'collectedScrolls',
            'activePolicyId',
            'talents',
            'achievements',
            'playerProfile',
            'timeSettings',
            'hasInteractedToday',
            'soundEnabled',
            'volume',
            'vibrationEnabled',
            'showBackgroundImage',
            'glassEffectEnabled',
            'officeState',
            'countyDevelopment',
            'externalThreat',
            'disasterState',
            'isExploring',
            'exploreResult',
            'marketPrices',
            'marketInventory',
            'ownedGoods',
            'ownedFacilities',
            'priceLocks',
            'dailyPurchasedGoods',
            'fortuneLevel',
            'latestUnlockedAchievementId',
            'leekPlots',
            'leekFacilities',
            'leekOrders',
            'leekColdStorageLevel',
            'leekGardenStats',
            'propertyTaxHalvingDaysLeft',
          ] as const;

          const nextState: Partial<GameStore> = {};
          for (const key of allowedKeys) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              (nextState as any)[key] = data[key];
            }
          }
          // 迁移导入存档中可能的旧格式 inventory
          if ((nextState as any).inventory !== undefined) {
            const { result } = migrateInventoryToRecord((nextState as any).inventory);
            (nextState as any).inventory = result;
          }
          if ((nextState as any).leekPlots !== undefined) {
            (nextState as any).leekPlots = ensureLeekSkyscraperPlot((nextState as any).leekPlots);
          }

          set(state => ({
            ...state,
            ...nextState,
            officeState:
              (nextState as any).officeState ||
              state.officeState ||
              ({ level: 1, isUpgrading: false } as any),
            countyDevelopment: (nextState as any).countyDevelopment || state.countyDevelopment || { currentPath: 'none', lastSwitchedDay: 1 },
            externalThreat: (nextState as any).externalThreat || state.externalThreat || { banditThreat: 15, defense: 40, warRisk: 5, lastRaidDay: 0 },
            disasterState: (nextState as any).disasterState || state.disasterState,
            timeSettings: (nextState as any).timeSettings || state.timeSettings,
          }));

          get().addLog('【系统】存档导入成功！进度已加载。');
          return true;
        } catch (e) {
          console.error('Import failed:', e);
          get().addLog('【系统】存档导入失败，文件可能已损坏。');
          return false;
        }
      },

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setVolume: (volume) => set({ volume }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      setShowBackgroundImage: (show) => set({ showBackgroundImage: show }),
      setGlassEffectEnabled: (enabled) => set({ glassEffectEnabled: enabled }),

      // Office Upgrades Implementation
      startUpgradeOffice: () => {
        const state = get();
        // Ensure officeState exists for legacy saves
        const officeState = state.officeState || { level: 1, isUpgrading: false };
        const { playerStats, inventory } = state;

        if (officeState.isUpgrading) {
          get().addLog('官邸正在修缮中，请耐心等待。');
          return;
        }

        const currentLevel = officeState.level;
        const nextConfig = officeUpgrades.find(u => u.level === currentLevel + 1);

        if (!nextConfig) {
          get().addLog('官邸已达到最高等级。');
          return;
        }

        const cost = nextConfig.cost;

        // Check Money
        if (playerStats.money < cost.money) {
          get().addLog(`资金不足，需要 ${cost.money} 文。`);
          return;
        }

        // Helper to count items in inventory record
        const countItem = (itemId: string) => inventory[itemId] || 0;

        // Check Wood (in inventory)
        const woodCount = countItem('wood');
        if (woodCount < cost.wood) {
          get().addLog(`木材不足，需要 ${cost.wood} 根。`);
          return;
        }

        // Check Stone (in inventory)
        const stoneCount = countItem('stone');
        if (stoneCount < cost.stone) {
          get().addLog(`石料不足，需要 ${cost.stone} 块。`);
          return;
        }

        // Check Construction Order (L11+) - Assumed item id 'construction_order'
        if (cost.constructionOrder && cost.constructionOrder > 0) {
          const orderCount = countItem('construction_order');
          if (orderCount < cost.constructionOrder) {
            get().addLog(`建材令不足，需要 ${cost.constructionOrder} 个。`);
            return;
          }
        }

        // Check Rare Stone (L16+) - Assumed item id 'rare_stone'
        if (cost.rareStone && cost.rareStone > 0) {
          const rareStoneCount = countItem('rare_stone');
          if (rareStoneCount < cost.rareStone) {
            get().addLog(`稀有石料不足，需要 ${cost.rareStone} 块。`);
            return;
          }
        }

        // Deduct Resources
        let newInventory = { ...inventory };
        if (cost.wood > 0) newInventory = invRemoveN(newInventory, 'wood', cost.wood);
        if (cost.stone > 0) newInventory = invRemoveN(newInventory, 'stone', cost.stone);
        if (cost.constructionOrder && cost.constructionOrder > 0) newInventory = invRemoveN(newInventory, 'construction_order', cost.constructionOrder);
        if (cost.rareStone && cost.rareStone > 0) newInventory = invRemoveN(newInventory, 'rare_stone', cost.rareStone);

        const now = Date.now();
        const durationMs = nextConfig.durationSeconds * 1000;

        set({
          playerStats: { ...playerStats, money: playerStats.money - cost.money },
          inventory: newInventory,
          officeState: {
            ...officeState,
            isUpgrading: true,
            upgradeStartTime: now,
            upgradeEndTime: now + durationMs
          }
        });

        get().addLog(`【官邸】开始修缮官邸至等级 ${nextConfig.level}，预计耗时 ${Math.ceil(nextConfig.durationSeconds / 60)} 分钟。`);
      },

      speedUpUpgrade: (type, value) => {
        const state = get();
        // Ensure officeState exists for legacy saves
        const officeState = state.officeState || { level: 1, isUpgrading: false };

        if (!officeState.isUpgrading || !officeState.upgradeEndTime) return;

        let reduceMs = 0;
        if (type === 'free') {
          // Free speedup logic (e.g. last 15 mins)
          // Value is usually ignored or 0 here if we just finish it
          // But let's say 'value' is ms to reduce
          reduceMs = value;
        } else if (type === 'item') {
          // Item speedup
          reduceMs = value;
        } else if (type === 'ad') {
          // Not supported in free version, but kept in interface just in case
          return;
        }

        const newEndTime = officeState.upgradeEndTime - reduceMs;

        // If finished
        if (newEndTime <= Date.now()) {
          get().completeUpgrade();
        } else {
          set({
            officeState: {
              ...officeState,
              upgradeEndTime: newEndTime
            }
          });
          get().addLog(`【加速】官邸修缮进度加快了。`);
        }
      },

      completeUpgrade: () => {
        const state = get();
        // Ensure officeState exists for legacy saves
        const officeState = state.officeState || { level: 1, isUpgrading: false };

        if (!officeState.isUpgrading) return;

        const nextLevel = officeState.level + 1;
        const config = officeUpgrades.find(u => u.level === nextLevel);

        set({
          officeState: {
            level: nextLevel,
            isUpgrading: false,
            upgradeStartTime: undefined,
            upgradeEndTime: undefined
          },
          // Award experience for upgrade?
          playerStats: {
            ...state.playerStats,
            experience: (state.playerStats.experience || 0) + nextLevel * 50
          }
        });

        let logMsg = `【官邸】修缮完成！官邸等级提升至 ${nextLevel}。`;
        if (config && config.benefits.unlocks) {
          logMsg += ` 解锁功能：${config.benefits.unlocks.join('、')}。`;
        }
        get().addLog(logMsg);
      },

      checkUpgradeStatus: () => {
        const state = get();
        const { officeState } = state;

        if (officeState && officeState.isUpgrading && officeState.upgradeEndTime) {
          if (Date.now() >= officeState.upgradeEndTime) {
            get().completeUpgrade();
          }
        }
      },

      cancelUpgradeOffice: () => {
        const state = get();
        const { officeState } = state;
        if (!officeState || !officeState.isUpgrading) return;

        const nextLevel = officeState.level + 1;
        const config = officeUpgrades.find(u => u.level === nextLevel);

        if (config) {
          const cost = config.cost;
          const refundMoney = cost.money;
          // Refund resources to inventory
          let newInventory = { ...state.inventory };
          if (cost.wood > 0) newInventory = invAdd(newInventory, 'wood', cost.wood);
          if (cost.stone > 0) newInventory = invAdd(newInventory, 'stone', cost.stone);
          if (cost.constructionOrder && cost.constructionOrder > 0) newInventory = invAdd(newInventory, 'construction_order', cost.constructionOrder);
          if (cost.rareStone && cost.rareStone > 0) newInventory = invAdd(newInventory, 'rare_stone', cost.rareStone);

          set({
            playerStats: { ...state.playerStats, money: state.playerStats.money + refundMoney },
            inventory: newInventory,
            officeState: {
              ...officeState,
              isUpgrading: false,
              upgradeStartTime: undefined,
              upgradeEndTime: undefined
            }
          });
          get().addLog('【官邸】已取消修缮，投入资源已全部返还。');
        } else {
          set({
            officeState: {
              ...officeState,
              isUpgrading: false,
              upgradeStartTime: undefined,
              upgradeEndTime: undefined
            }
          });
          get().addLog('【官邸】修缮已取消。');
        }
      },

      setCountyDevelopmentPath: (pathId) => {
        const state = get();
        if (pathId === state.countyDevelopment.currentPath) {
          get().addLog('【治县路线】当前已处于该发展路线。');
          return;
        }

        const targetPath = countyDevelopmentPaths.find(path => path.id === pathId);
        if (!targetPath) {
          get().addLog('【治县路线】无效的发展路线。');
          return;
        }

        const officeLevel = state.officeState?.level || 1;
        if (officeLevel < targetPath.unlockLevel) {
          get().addLog(`【治县路线】官邸达到 LV.${targetPath.unlockLevel} 后可启用${targetPath.name}。`);
          return;
        }

        const switchCost = state.countyDevelopment.currentPath === 'none' ? 0 : 500;
        if (switchCost > 0 && state.playerStats.money < switchCost) {
          get().addLog(`【治县路线】切换路线需要 ${switchCost} 文。`);
          return;
        }

        set(prev => ({
          countyDevelopment: {
            currentPath: pathId,
            lastSwitchedDay: prev.day,
          },
          playerStats: {
            ...prev.playerStats,
            money: prev.playerStats.money - switchCost,
          }
        }));

        get().addLog(`【治县路线】已调整为「${targetPath.name}」。${switchCost > 0 ? ` 消耗${switchCost}文。` : ''}`);
      },

      maintainCountyDefense: () => {
        const state = get();
        const extraDefenseCount = state.dailyCounts.extraDefenseCount || 0;
        const isFreeDone = !!state.flags['defense_maintained_daily'];

        // 决定使用免费还是付费
        let useFree = false;
        let useExtra = false;

        if (!isFreeDone) {
          useFree = true;
        } else if (extraDefenseCount < 2) {
          useExtra = true;
        } else {
          get().addLog('【边防】今日巡防次数已用完（免费1次+付费2次）。');
          return;
        }

        const cost = useFree ? 30 : 100;
        if (state.playerStats.money < cost) {
          get().addLog(`【边防】巡防维护需要 ${cost} 文。`);
          return;
        }

        const current = state.externalThreat || { banditThreat: 15, defense: 40, warRisk: 5, lastRaidDay: 0 };
        const defenseGain = 8;
        const threatReduction = 6;

        set(prev => {
          const newFlags = { ...prev.flags };
          const newDailyCounts = { ...prev.dailyCounts };

          if (useFree) {
            newFlags.defense_maintained_daily = true;
          }
          if (useExtra) {
            newDailyCounts.extraDefenseCount = (prev.dailyCounts.extraDefenseCount || 0) + 1;
          }

          return {
            playerStats: {
              ...prev.playerStats,
              money: prev.playerStats.money - cost,
            },
            externalThreat: {
              ...current,
              defense: Math.min(100, current.defense + defenseGain),
              banditThreat: Math.max(0, current.banditThreat - threatReduction),
              warRisk: Math.max(0, current.warRisk - threatReduction),
            },
            flags: newFlags,
            dailyCounts: newDailyCounts,
          };
        });

        const typeText = useFree ? '免费' : '付费';
        get().addLog(`【边防】你组织了巡防队与乡勇（${typeText}），边防戒备得到加强。`);
      },

      // 自动巡逻系统
      buyAutoPatrol: () => {
        const state = get();
        const officeState = state.officeState || { level: 1, isUpgrading: false };

        // 检查官邸等级
        if (officeState.level < 5) {
          return { success: false, message: '自动巡逻小队需要官邸达到LV.5才能雇佣。' };
        }

        // 检查是否已有进行中的巡逻
        if ((officeState.autoPatrolDaysLeft || 0) > 0) {
          return { success: false, message: `当前已有自动巡逻小队进行中，剩余 ${officeState.autoPatrolDaysLeft} 天。` };
        }

        const cost = 10000;
        if (state.playerStats.money < cost) {
          return { success: false, message: `雇佣自动巡逻小队需要 ${cost} 文，资金不足。` };
        }

        // 扣除费用并激活巡逻
        set({
          playerStats: {
            ...state.playerStats,
            money: state.playerStats.money - cost,
          },
          officeState: {
            ...officeState,
            autoPatrolDaysLeft: 20,
          },
        });

        get().addLog(`【自动巡逻】你雇佣了一支自动巡逻小队，花费 ${cost} 文，将自动巡逻 20 天。`);
        return { success: true, message: `自动巡逻小队已出发，将在未来20天内自动维护治安。` };
      },

      dismissRaidAlert: () => {
        set({ raidAlert: undefined });
      },

      // ── Debuff 系统 API ────────────────────────────────────────

      addDebuff: (id: string, source?: string) => {
        const state = get();
        const config = getDebuffConfig(id);
        if (!config) return;

        const existing = (state.activeDebuffs || []).find(d => d.configId === id);
        const currentDay = state.day;
        const messages: string[] = [];

        if (existing) {
          if (config.stackRule === 'none') {
            // 已有且不叠层，忽略
            return;
          } else if (config.stackRule === 'refresh') {
            // 刷新持续时间
            set(s => ({
              activeDebuffs: (s.activeDebuffs || []).map(d =>
                d.configId === id
                  ? { ...d, remainingDays: config.duration, triggeredDay: currentDay }
                  : d
              ),
            }));
            messages.push(`【Debuff触发】${config.name} 持续时间已刷新（来源：${source || '未知'}）。`);
          } else if (config.stackRule === 'stack' && existing.stacks < (config.maxStacks || 2)) {
            // 叠加
            set(s => ({
              activeDebuffs: (s.activeDebuffs || []).map(d =>
                d.configId === id
                  ? { ...d, stacks: d.stacks + 1, triggeredDay: currentDay, remainingDays: config.duration, immediateApplied: false }
                  : d
              ),
            }));
            messages.push(`【Debuff触发】${config.name} 叠加至 ${existing.stacks + 1} 层（来源：${source || '未知'}）。`);
          }
        } else {
          // 新增
          const newDebuff: ActiveDebuff = {
            configId: id,
            triggeredDay: currentDay,
            remainingDays: config.duration,
            stacks: 1,
            immediateApplied: false,
            source,
          };
          set(s => ({
            activeDebuffs: [...(s.activeDebuffs || []), newDebuff],
          }));
          messages.push(`【Debuff触发】${config.name} 已附加！（${config.description.substring(0, 30)}…）来源：${source || '未知'}。`);
        }

        messages.forEach(m => get().addLog(m));
      },

      removeDebuff: (id: string, reason?: string) => {
        const state = get();
        const config = getDebuffConfig(id);
        const existing = (state.activeDebuffs || []).find(d => d.configId === id);
        if (!existing) return;

        set(s => ({
          activeDebuffs: (s.activeDebuffs || []).filter(d => d.configId !== id),
        }));
        get().addLog(`【Debuff解除】${config?.name || id} 已解除。${reason ? `（${reason}）` : ''}`);
      },

      tickDebuffsPerDay: () => {
        const state = get();
        const activeDebuffs = state.activeDebuffs || [];
        const logs: string[] = [];
        let economyDelta = 0;
        let orderDelta = 0;
        let cultureDelta = 0;
        let livelihoodDelta = 0;
        let moneyDelta = 0;
        let reputationDelta = 0;
        let facilityIncomeMultiplier = 1.0;
        let cultureGainMultiplier = 1.0;

        const nextDebuffs: ActiveDebuff[] = [];

        // 路线缓冲系数
        const path = state.countyDevelopment?.currentPath || 'none';
        const debuffMitigationMap: Record<string, number> = {
          stability: 0.8,  // 民生/治安类 Debuff 负面系数 -20%
          balanced: 0.9,   // 全属性小幅降低 -10%
          trade: 1.0,
          culture: 1.0,
          none: 1.0,
        };
        const globalMitigation = debuffMitigationMap[path] || 1.0;

        for (const debuff of activeDebuffs) {
          const config = getDebuffConfig(debuff.configId);
          if (!config) continue;

          const stacks = debuff.stacks || 1;

          // 1. 应用即时效果（仅首次）
          let updatedDebuff = { ...debuff };
          if (!debuff.immediateApplied) {
            const e = config.effects;
            let immEconomy = (e.immediateEconomy || 0) * stacks;
            let immOrder = (e.immediateOrder || 0) * stacks;
            let immCulture = (e.immediateCulture || 0) * stacks;
            let immLivelihood = (e.immediateLivelihood || 0) * stacks;
            let immMoney = (e.immediateMoney || 0) * stacks;
            let immReputation = (e.immediateReputation || 0) * stacks;

            // 路线减伤（仅对负面即时效果）
            if (path === 'stability') {
              if (immLivelihood < 0) immLivelihood = Math.ceil(immLivelihood * 0.8);
              if (immOrder < 0) immOrder = Math.ceil(immOrder * 0.8);
            } else if (path === 'balanced') {
              if (immEconomy < 0) immEconomy = Math.ceil(immEconomy * 0.9);
              if (immOrder < 0) immOrder = Math.ceil(immOrder * 0.9);
              if (immCulture < 0) immCulture = Math.ceil(immCulture * 0.9);
              if (immLivelihood < 0) immLivelihood = Math.ceil(immLivelihood * 0.9);
            }

            economyDelta += immEconomy;
            orderDelta += immOrder;
            cultureDelta += immCulture;
            livelihoodDelta += immLivelihood;
            moneyDelta += immMoney;
            reputationDelta += immReputation;
            updatedDebuff = { ...updatedDebuff, immediateApplied: true };

            if (immEconomy || immOrder || immCulture || immLivelihood || immMoney || immReputation) {
              logs.push(
                `【Debuff生效】${config.name}（即时）：` +
                [
                  immEconomy ? `经济${immEconomy > 0 ? '+' : ''}${immEconomy}` : '',
                  immOrder ? `治安${immOrder > 0 ? '+' : ''}${immOrder}` : '',
                  immCulture ? `文化${immCulture > 0 ? '+' : ''}${immCulture}` : '',
                  immLivelihood ? `民生${immLivelihood > 0 ? '+' : ''}${immLivelihood}` : '',
                  immMoney ? `金钱${immMoney > 0 ? '+' : ''}${immMoney}文` : '',
                  immReputation ? `声望${immReputation > 0 ? '+' : ''}${immReputation}` : '',
                ].filter(Boolean).join('、') + '。'
              );
            }
          }

          // 2. 每日持续效果
          {
            const e = config.effects;
            let dailyEco = (e.economy || 0) * stacks;
            let dailyOrd = (e.order || 0) * stacks;
            let dailyCul = (e.culture || 0) * stacks;
            let dailyLiv = (e.livelihood || 0) * stacks;
            let dailyMon = (e.money || 0) * stacks;
            let dailyRep = (e.reputation || 0) * stacks;

            // 路线减伤（仅对负面每日效果）
            if (path === 'stability') {
              if (dailyLiv < 0) dailyLiv = Math.ceil(dailyLiv * 0.8);
              if (dailyOrd < 0) dailyOrd = Math.ceil(dailyOrd * 0.8);
            } else if (path === 'balanced') {
              if (dailyEco < 0) dailyEco = Math.ceil(dailyEco * globalMitigation);
              if (dailyOrd < 0) dailyOrd = Math.ceil(dailyOrd * globalMitigation);
              if (dailyCul < 0) dailyCul = Math.ceil(dailyCul * globalMitigation);
              if (dailyLiv < 0) dailyLiv = Math.ceil(dailyLiv * globalMitigation);
            }

            economyDelta += dailyEco;
            orderDelta += dailyOrd;
            cultureDelta += dailyCul;
            livelihoodDelta += dailyLiv;
            moneyDelta += dailyMon;
            reputationDelta += dailyRep;

            // 百分比修正（乘区叠加）
            if (e.facilityIncomeMultiplier) {
              facilityIncomeMultiplier += e.facilityIncomeMultiplier * stacks;
            }
            if (e.cultureGainMultiplier) {
              cultureGainMultiplier += e.cultureGainMultiplier * stacks;
            }

            const parts = [
              dailyEco ? `经济${dailyEco > 0 ? '+' : ''}${dailyEco}` : '',
              dailyOrd ? `治安${dailyOrd > 0 ? '+' : ''}${dailyOrd}` : '',
              dailyCul ? `文化${dailyCul > 0 ? '+' : ''}${dailyCul}` : '',
              dailyLiv ? `民生${dailyLiv > 0 ? '+' : ''}${dailyLiv}` : '',
              dailyMon ? `金钱${dailyMon > 0 ? '+' : ''}${dailyMon}文/天` : '',
              dailyRep ? `声望${dailyRep > 0 ? '+' : ''}${dailyRep}` : '',
            ].filter(Boolean);
            if (parts.length > 0) {
              logs.push(
                `【Debuff生效】${config.name}` +
                (stacks > 1 ? `（×${stacks}层）` : '') +
                `：${parts.join('、')}` +
                (updatedDebuff.remainingDays > 0 ? `，剩余${updatedDebuff.remainingDays - 1}天` : '') +
                `。解除方式：${config.clearMethods[0]?.label || '无'}`
              );
            }
          }

          // 3. 检查是否到期
          if (updatedDebuff.remainingDays === -1) {
            // 无限持续，保留
            nextDebuffs.push(updatedDebuff);
          } else if (updatedDebuff.remainingDays <= 1) {
            // 到期
            logs.push(`【Debuff解除】${config.name} 已自然到期解除。`);
            // 不推入 nextDebuffs
          } else {
            nextDebuffs.push({ ...updatedDebuff, remainingDays: updatedDebuff.remainingDays - 1 });
          }
        }

        // 4. 检查无限持续类 Debuff 的自动解除条件
        const currentState = get();
        const finalDebuffs = nextDebuffs.filter(debuff => {
          const config = getDebuffConfig(debuff.configId);
          if (!config || debuff.remainingDays !== -1) return true;
          for (const method of config.clearMethods) {
            if (method.autoCondition && method.autoCondition(currentState)) {
              logs.push(`【Debuff解除】${config.name} 已满足自动解除条件（${method.label}）。`);
              return false;
            }
          }
          return true;
        });

        set({ activeDebuffs: finalDebuffs });

        return { logs, economyDelta, orderDelta, cultureDelta, livelihoodDelta, moneyDelta, reputationDelta, facilityIncomeMultiplier, cultureGainMultiplier };
      },

      checkDebuffTriggers: () => {
        const state = get();
        const currentDay = state.day;

        // 防止同日重复检查
        if ((state.lastDebuffCheckDay || 0) >= currentDay) return;
        set({ lastDebuffCheckDay: currentDay });

        console.log(`[Debuff] 第 ${currentDay} 天触发检查 — order=${state.countyStats.order}, economy=${state.countyStats.economy}, culture=${state.countyStats.culture}, livelihood=${state.countyStats.livelihood}`);

        for (const config of debuffConfigs) {
          const existing = (state.activeDebuffs || []).find(d => d.configId === config.id);

          // 已有且不允许叠层/刷新的，跳过
          if (existing && config.stackRule === 'none') {
            console.log(`[Debuff] ${config.id} 已激活且 stackRule=none，跳过`);
            continue;
          }
          if (existing && config.stackRule === 'stack' && existing.stacks >= (config.maxStacks || 2)) continue;

          // 触发检查
          let shouldTrigger = false;
          let debugReason = '';

          if (config.trigger.type === 'consecutive' || config.trigger.type === 'event') {
            // consecutive / event 类型只靠 custom 判断
            if (config.trigger.custom) {
              shouldTrigger = config.trigger.custom(state);
              debugReason = `consecutive/event custom=${shouldTrigger}`;
            }
          } else if (config.trigger.custom) {
            // threshold / probability 类型也可附带 custom 作为最终判定
            shouldTrigger = config.trigger.custom(state);
            debugReason = `custom=${shouldTrigger}`;
          } else if (config.trigger.type === 'threshold' && config.trigger.field && config.trigger.value !== undefined) {
            // 简单路径解析（支持 countyStats.order 等）
            const parts = config.trigger.field.split('.');
            let val: unknown = state as unknown as Record<string, unknown>;
            for (const p of parts) {
              val = (val as Record<string, unknown>)[p];
            }
            const numVal = typeof val === 'number' ? val : 0;
            if (config.trigger.direction === 'below') {
              shouldTrigger = numVal < config.trigger.value;
            } else {
              shouldTrigger = numVal > config.trigger.value;
            }
            debugReason = `threshold ${config.trigger.field}=${numVal} ${config.trigger.direction} ${config.trigger.value} → ${shouldTrigger}`;
          } else if (config.trigger.type === 'probability' && config.trigger.probability !== undefined) {
            shouldTrigger = Math.random() < config.trigger.probability;
            debugReason = `probability=${shouldTrigger}`;
          }

          console.log(`[Debuff] ${config.id} 检查: ${debugReason || '无条件'} → shouldTrigger=${shouldTrigger}`);

          if (shouldTrigger) {
            get().addDebuff(config.id, '条件自动触发');
          }
        }
      },

      tryClearDebuff: (id: string, methodId: string) => {
        const state = get();
        const config = getDebuffConfig(id);
        const existing = (state.activeDebuffs || []).find(d => d.configId === id);

        if (!config || !existing) {
          return { success: false, message: '该 Debuff 当前未激活。' };
        }

        const method = config.clearMethods.find(m => m.id === methodId);
        if (!method) {
          return { success: false, message: '解除方式不存在。' };
        }

        // 检查资源是否足够
        if (method.moneyCost && state.playerStats.money < method.moneyCost) {
          return { success: false, message: `银两不足，需要 ${method.moneyCost} 文。` };
        }
        if (method.reputationCost && state.playerStats.reputation < method.reputationCost) {
          return { success: false, message: `声望不足，需要 ${method.reputationCost} 点。` };
        }
        if (method.healthCost && state.playerStats.health < method.healthCost) {
          return { success: false, message: `体力不足，需要 ${method.healthCost} 点。` };
        }
        if (method.autoCondition && !method.autoCondition(state)) {
          return { success: false, message: '自动解除条件尚未满足。' };
        }
        if (method.requiredFlag && !state.flags[method.requiredFlag]) {
          return { success: false, message: '行为条件尚未满足。' };
        }

        // 扣除资源
        const updates: Partial<GameState> = {};
        const newStats = { ...state.playerStats };
        if (method.moneyCost) newStats.money -= method.moneyCost;
        if (method.reputationCost) newStats.reputation -= method.reputationCost;
        if (method.healthCost) newStats.health -= method.healthCost;
        if (method.moneyCost || method.reputationCost || method.healthCost) {
          updates.playerStats = newStats;
        }

        set(updates);
        get().removeDebuff(id, `主动解除：${method.label}`);

        return { success: true, message: `${config.name} 已解除！（${method.label}）` };
      },

    }),
    {
      name: 'textgame-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // 旧存档兼容：缺失字段回填默认值
      merge: (persistedState: unknown, currentState) => {
        const persisted = (persistedState || {}) as Partial<typeof currentState>;
        // 迁移旧格式 inventory（string[] -> Record<string, number>）
        const { result: migratedInventory, migrated } = migrateInventoryToRecord((persisted as any).inventory);
        if (migrated) {
          // 标记需要迁移，同时记录迁移的物品总条数供进度展示
          const oldArr = (persisted as any).inventory as string[];
          (window as any).__inventoryMigrated = {
            totalItems: oldArr.length,
            uniqueItems: Object.keys(migratedInventory).length,
          };
        }
        const mergedDaily = {
          ...currentState.dailyCounts,
          ...(persisted.dailyCounts || {}),
        };
        mergedDaily.pigeonBooster = mergedDaily.pigeonBooster ?? 0;

        return {
          ...currentState,
          ...persisted,
          inventory: migratedInventory,
          activeDebuffs: persisted.activeDebuffs ?? [],
          lastDebuffCheckDay: persisted.lastDebuffCheckDay ?? 0,
          dismissedActivities: persisted.dismissedActivities ?? {},
          dailyCounts: mergedDaily,
          pendingDoping: (persisted as Partial<GameState>).pendingDoping ?? null,
          pigeonBoosterUnlocked:
            !!(persisted as Partial<GameState>).pigeonBoosterUnlocked ||
            !!(persisted as Partial<GameState>).flags?.pigeon_booster_unlocked,
          dopingStreak: (persisted as Partial<GameState>).dopingStreak ?? 0,
          lastPlayerDopingDay: (persisted as Partial<GameState>).lastPlayerDopingDay ?? 0,
          pigeonDopingCaughtDays: (persisted as Partial<GameState>).pigeonDopingCaughtDays ?? [],
          pigeonBoosterLockUntilDay: (persisted as Partial<GameState>).pigeonBoosterLockUntilDay,
          pigeonCleanWinStreak: (persisted as Partial<GameState>).pigeonCleanWinStreak ?? 0,
          propertyTaxHalvingDaysLeft: (persisted as Partial<GameState>).propertyTaxHalvingDaysLeft,
          leekColdStorageLevel: (persisted as Partial<GameState>).leekColdStorageLevel ?? 0,
          leekGardenStats: (persisted as Partial<GameState>).leekGardenStats ?? defaultLeekGardenStats(),
          leekPlots: ensureLeekSkyscraperPlot(
            (persisted as Partial<GameState>).leekPlots ?? currentState.leekPlots
          ),
        };
      },
      partialize: (state) => ({
        role: state.role,
        day: state.day,
        weather: state.weather,
        timeSettings: state.timeSettings,
        playerProfile: state.playerProfile,
        playerStats: state.playerStats,
        countyStats: state.countyStats,
        dailyCounts: state.dailyCounts,
        inventory: state.inventory,
        equippedApparel: state.equippedApparel,
        equippedAccessories: state.equippedAccessories,
        flags: state.flags,
        npcRelations: state.npcRelations,
        logs: state.logs,
        currentEvent: state.currentEvent,
        eventQueue: state.eventQueue,
        isGameOver: state.isGameOver,
        currentTaskId: state.currentTaskId,
        completedTaskIds: state.completedTaskIds,
        giftFailureCounts: state.giftFailureCounts,
        npcInteractionStates: state.npcInteractionStates,
        isVoiceLost: state.isVoiceLost,
        collectedScrolls: state.collectedScrolls,
        activePolicyId: state.activePolicyId,
        talents: state.talents,
        achievements: state.achievements,
        marketState: state.marketState,
        marketPrices: state.marketPrices,
        marketInventory: state.marketInventory,
        ownedGoods: state.ownedGoods,
        ownedFacilities: state.ownedFacilities,
        priceLocks: state.priceLocks,
        dailyPurchasedGoods: state.dailyPurchasedGoods,
        fortuneLevel: state.fortuneLevel,
        hasInteractedToday: state.hasInteractedToday,
        latestUnlockedAchievementId: state.latestUnlockedAchievementId,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        vibrationEnabled: state.vibrationEnabled,
        showBackgroundImage: state.showBackgroundImage,
        glassEffectEnabled: state.glassEffectEnabled,
        leekPlots: state.leekPlots,
        leekFacilities: state.leekFacilities,
        leekOrders: state.leekOrders,
        leekColdStorageLevel: state.leekColdStorageLevel,
        leekGardenStats: state.leekGardenStats,
        disasterState: state.disasterState,
        isExploring: state.isExploring,
        exploreResult: state.exploreResult,
        officeState: state.officeState,
        countyDevelopment: state.countyDevelopment,
        externalThreat: state.externalThreat,
        pigeons: state.pigeons,
        pigeonRaceHistory: state.pigeonRaceHistory,
        selectedPigeonId: state.selectedPigeonId,
        pigeonBoosterUnlocked: state.pigeonBoosterUnlocked,
        pendingDoping: state.pendingDoping,
        dopingStreak: state.dopingStreak,
        lastPlayerDopingDay: state.lastPlayerDopingDay,
        pigeonDopingCaughtDays: state.pigeonDopingCaughtDays,
        pigeonBoosterLockUntilDay: state.pigeonBoosterLockUntilDay,
        pigeonCleanWinStreak: state.pigeonCleanWinStreak,
        propertyTaxHalvingDaysLeft: state.propertyTaxHalvingDaysLeft,
        // Debuff 系统持久化
        activeDebuffs: state.activeDebuffs,
        lastDebuffCheckDay: state.lastDebuffCheckDay,
        // 活动弹窗持久化
        dismissedActivities: state.dismissedActivities,
      }), // Save everything except actions
    }
  )
);
