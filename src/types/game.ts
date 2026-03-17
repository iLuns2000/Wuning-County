export type RoleType = 'magistrate' | 'merchant' | 'hero';
export type WeatherType = 'sunny' | 'cloudy' | 'rain_light' | 'rain_heavy' | 'snow_light' | 'snow_heavy';

// 重新导出 GiftCategory 类型（定义在 npcGiftInteractionRules.ts 中）
export type { GiftCategory } from '@/data/npcGiftInteractionRules';

export interface PlayerStats {
  money: number;
  reputation: number;
  ability: number;
  health: number;
  experience: number;
  accuracy: number; // 准头属性，用于射箭等远程活动
  debt: number; // New field for bank loans
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legend';
  effectType: 'money_gain' | 'reputation_gain' | 'max_health' | 'ability_gain' | 'action_cost';
  effectValue: number; // value per level
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rewardExp: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legend';
  isHidden?: boolean; // If true, description is hidden until unlocked
  provider?: string; // The person who provided this achievement idea
}

export interface Good {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  volatility: number;
  spoilageRate?: number; // 0-1, percentage of stock lost per day
}

export type ItemType = 'consumable' | 'material' | 'quest' | 'misc' | 'treasure' | 'apparel' | 'accessory';

export type ApparelSlot = 'hair' | 'top' | 'bottom' | 'outer' | 'shoes';

export type AccessorySlot = 'ear' | 'neck' | 'hand' | 'waist' | 'head';

export type StyleTag = '清雅' | '华贵' | '英气' | '俏皮' | '典雅';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effect?: Effect;
  price?: number;
  slot?: ApparelSlot | AccessorySlot;
  style?: StyleTag;
  color?: string;
  textColor?: string;
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legend';
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  cost: number;
  dailyIncome: number;
  incomeDescription: string;
  condition?: (stats: CountyStats) => boolean;
  maxCount?: number;
  type?: 'normal' | 'resource';
  resourceType?: 'wood' | 'stone';
  resourceAmount?: number;
  maxLevel?: number;
}

export interface CountyStats {
  economy: number;
  order: number;
  culture: number;
  livelihood: number;
}

export type CountyDevelopmentPathId = 'none' | 'trade' | 'stability' | 'culture' | 'balanced';

export interface CountyDevelopmentState {
  currentPath: CountyDevelopmentPathId;
  lastSwitchedDay: number;
}


export interface ExternalThreatState {
  banditThreat: number; // 0-100
  defense: number; // 0-100
  warRisk: number; // 0-100
  lastRaidDay: number;
}

// ── 赛鸽系统 ──────────────────────────────────────────────
export type PigeonCondition = 'healthy' | 'tired' | 'injured' | 'lost';

export type PigeonRaceType = 'sprint' | 'endurance';

export interface PigeonStats {
  speed: number;      // 1-100
  endurance: number;  // 1-100
  homing: number;     // 1-100
  courage: number;    // 1-100
}

export interface Pigeon {
  id: string;
  name: string;
  level: number;
  stats: PigeonStats;
  fatigue: number;           // 0-100
  condition: PigeonCondition;
  injuredDaysLeft?: number;  // days until recovery from 'injured'
  winCount: number;
  raceCount: number;
}

export interface PigeonRaceRecord {
  day: number;
  pigeonId: string;
  raceType: PigeonRaceType;
  rank: number;
  score: number;
  rewardMoney: number;
  rewardReputation: number;
  weather: WeatherType;
  note?: string;
}
// ─────────────────────────────────────────────────────────

export interface DailyActionCounts {
  work: number;
  rest: number;
  chatTotal: number; // Total chats today across all NPCs
  fortune: number; // Daily fortune telling count
  explore: number; // Daily exploration count
  caveFilled: boolean; // Whether the cave has been filled today
  pigeonRace: number; // 赛鸽比赛次数（每日上限 1）
  extraDefenseCount: number; // 额外巡防维护次数（每日上限2次，每次100文）
}

export interface NPCInteractionState {
  dailyGiftCount: number;
  dailyChatCount: number;
  dailyActionCount: number;
}

export interface Scroll {
  id: string;
  name: string;
  description: string;
  npcId?: string; // If specific to an NPC
  obtainedAt: number; // Day obtained
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  dailyEffect: Effect; // Effect applied every day
  cost: number; // Reputation cost to enact
}

export interface PlayerProfile {
  name: string;
  avatar: string; // Base64 string
  nameChangeUsed?: boolean;
}

export interface TimeSettings {
  dayDurationSeconds: number; // Duration of a day in seconds
  isTimeFlowEnabled: boolean; // Whether natural time flow is active
  dayStartTime: number; // Timestamp when the current day started (or was resumed)
  isPaused: boolean; // Whether the timer is currently paused (e.g. during events)
  mobileToastSeconds: number;
}

export interface GameState {
  role: RoleType | null;
  day: number;
  weather: WeatherType; // Current weather
  timeSettings: TimeSettings; // New field for time management
  playerProfile: PlayerProfile;
  playerStats: PlayerStats;
  countyStats: CountyStats;
  dailyCounts: DailyActionCounts;
  npcInteractionStates: Record<string, NPCInteractionState>; // Track daily interactions per NPC
  isVoiceLost: boolean; // Cannot chat if true
  isMoGuRenaming: boolean; // Whether the user is currently renaming at Mo Gu
  collectedScrolls: Scroll[];
  activePolicyId?: string; // Currently active policy
  inventory: Record<string, number>; // 物品ID -> 数量（压缩格式）
  equippedApparel: Partial<Record<ApparelSlot, string>>;
  equippedAccessories: string[];
  flags: Record<string, any>;
  npcRelations: Record<string, number>;
  logs: string[];
  currentTaskId?: string; // Track current main task
  completedTaskIds: string[]; // Track completed tasks
  giftFailureCounts: Record<string, number>; // Track consecutive gift failures per NPC
  talents: Record<string, number>; // id -> level
  achievements: string[]; // ids of unlocked achievements
  
  // UI State for Achievements
  latestUnlockedAchievementId?: string; 
  
  // Market & Economy
  marketPrices: Record<string, number>; // goodId -> currentPrice
  marketInventory: Record<string, number>; // goodId -> dailyStock
  ownedGoods: Record<string, number>; // goodId -> quantity
  ownedFacilities: Record<string, number>; // facilityId -> quantity
  
  // Daily Fortune
  fortuneLevel?: 'great_blessing' | 'blessing' | 'normal' | 'bad_luck' | 'terrible_luck';

  // Leek Garden
  leekPlots?: LeekPlot[];
  leekFacilities?: Record<string, boolean>; // id -> owned
  leekOrders?: LeekOrder[];

  // Disaster State
  disasterState: DisasterState;

  // Office State
  officeState: OfficeState;
  countyDevelopment: CountyDevelopmentState;
  externalThreat: ExternalThreatState;

  // 赛鸽系统
  pigeons: Pigeon[];
  pigeonRaceHistory: PigeonRaceRecord[];
  selectedPigeonId?: string;

  // 战火警报
  raidAlert?: boolean; // 当日发生山贼夜袭时为 true，展示警报动画后清除

  // 季一藕医馆动物互动系统
  clinicAnimals?: ClinicAnimalState;

  // Debuff 系统
  activeDebuffs: ActiveDebuff[];
  lastDebuffCheckDay: number;
}

export interface DisasterState {
  type: 'none' | 'flood';
  active: boolean;
  duration: number; // Days remaining
  lastTriggerDay: number; // To prevent frequent triggers
}

export interface OfficeState {
  level: number;
  upgradeStartTime?: number; // timestamp
  upgradeEndTime?: number; // timestamp
  isUpgrading: boolean;
  // 自动巡逻系统
  autoPatrolDaysLeft?: number; // 剩余自动巡逻天数
}

export interface LeekOrder {
  id: string;
  description: string;
  minQuality: number;
  quantity: number;
  priceMultiplier: number; // 1.2x, 1.5x etc.
  expiresIn: number; // days
}

export interface Effect {
  playerStats?: Partial<PlayerStats>;
  countyStats?: Partial<CountyStats>;
  // Flat player stats
  money?: number;
  reputation?: number;
  ability?: number;
  health?: number;
  experience?: number;
  accuracy?: number;
  // Flat county stats
  economy?: number;
  order?: number;
  culture?: number;
  livelihood?: number;
  
  itemsAdd?: string[];
  itemsRemove?: string[];
  /** 概率获得物品，格式：[{ itemId: 'item_id', probability: 0.3, count?: 1 }] */
  probabilisticItemsAdd?: Array<{ itemId: string; probability: number; count?: number }>;
  /** 百分比减少资源，格式：[{ type: 'health'|'money', percent: 0.5 }] */
  percentDeduct?: Array<{ type: 'health' | 'money'; percent: number }>;
  /** 消耗所有指定物品并根据数量计算概率获得物品，格式：{ consumeItemId: '羽毛id', probabilityPerItem: 0.1, minProbability: 0.01, maxProbability: 0.1, rewardItemId: '奖励物品id', rewardItemCount?: 1 } */
  consumeAllAndProbabilisticReward?: { consumeItemId: string; probabilityPerItem: number; minProbability: number; maxProbability: number; rewardItemId: string; rewardItemCount?: number };
  flagsSet?: Record<string, any>;
  flagsIncrement?: string[];
  relationChange?: Record<string, number>;
}

export interface EventOption {
  label: string;
  effect?: Effect;
  message: string;
  description?: string;
  /** 选择此选项后附加的 Debuff id 列表 */
  addDebuffIds?: string[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'opportunity' | 'challenge' | 'npc' | 'random';
  stylePreference?: {
    preferred: StyleTag[];
  };
  triggerCondition?: {
    minReputation?: number;
    minMoney?: number;
    minAbility?: number;
    minDay?: number;
    probability?: number; // 0-1
    requiredRole?: RoleType;
    season?: string;
    /** 需要的物品ID和数量 */
    requiredItems?: Record<string, number>;
    custom?: (state: GameState) => boolean;
  };
  options: EventOption[];
}

export interface RoleConfig {
  id: RoleType;
  name: string;
  description: string;
  initialStats: PlayerStats;
  initialCountyStats: CountyStats;
  specialAbility: {
    name: string;
    description: string;
    costText: string;
  };
  passiveEffect: {
    name: string;
    description: string;
  };
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  identityCode?: string; // NPC Identity Number
  description: string;
  background: string;
  danqing?: string; // Danqing portrait description or image URL
  dailyLife?: string; // Daily life description (县居日常)
  hiddenTreasure?: string; // Hidden treasure description (藏珍匣)
  avatar?: string;
  chatDialogues?: {
    high?: string[];
    medium?: string[];
    low?: string[];
  };
  interactionEventIds?: string[]; // IDs of events that can be triggered manually via interaction
}

export interface Task {
  id: string;
  role: RoleType;
  title: string;
  description: string;
  goalDescription: string;
  checkCompletion: (state: GameState) => boolean;
  reward: Effect;
  rewardText: string;
  nextTaskId?: string;
  specialAction?: {
    label: string;
    description: string;
    costText: string;
    handler: (state: GameState) => { success: boolean; message: string; effect?: Effect };
  };
}

export interface LeekVariety {
  id: string;
  name: string;
  growthTicks: number;
  baseYield: number;
  baseQuality: number;
}

export interface LeekPlot {
  id: number;
  varietyId?: string;
  growthProgress?: number;
  growthTarget?: number;
  watered?: boolean;
  fertilized?: boolean;
  pest?: number;
  quality?: number;
  ready?: boolean;
  fertility?: number; // 0-100
}

// ── 季一藕医馆动物互动系统 ────────────────────────────────

export interface ClinicAnimalState {
  /** 今日喂小啾次数 */
  birdFeedToday: number;
  /** 小啾好感（喂食累计） */
  birdFavor: number;
  /** 逗鸟/教学累计（用于"咕咕嘎"） */
  birdTeaseOrTeachCount: number;
  /** 每句学习进度: phrase -> count (需要 ≥10 次才学会) */
  birdLearnProgress: Record<string, number>;
  /** 已学会语录（FIFO，上限 20） */
  birdLearnedPhrases: string[];
  /** 教脏话被抓次数 */
  swearTeachCaughtCount: number;
  /** 历史学狗叫总次数 */
  dogBarkPracticeTotal: number;
  /** 今日学狗叫次数（称号后上限 2） */
  dogBarkToday: number;
  /** 动物互动封禁到哪一天 */
  animalInteractionBannedUntilDay: number;
  /** 医馆禁入到哪一天（"一意孤行"） */
  clinicEntryBannedUntilDay: number;
}

// ── Debuff 系统 ──────────────────────────────────────────

/** Debuff 触发方式 */
export type DebuffTriggerType =
  | 'threshold'      // 阈值触发（某属性低于/高于某值）
  | 'event'          // 事件选项触发
  | 'raid'           // 战火/夜袭触发
  | 'consecutive'    // 连续天数行为触发
  | 'probability';   // 概率触发

/** 单条 Debuff 的触发条件描述 */
export interface DebuffTrigger {
  type: DebuffTriggerType;
  /** 阈值触发：检查的字段（支持 countyStats.* / externalThreat.warRisk 等点路径） */
  field?: string;
  /** 阈值方向：'below' 表示低于，'above' 表示高于 */
  direction?: 'below' | 'above';
  value?: number;
  /** 连续天数触发：需要满足条件的最少天数 */
  consecutiveDays?: number;
  /** 概率触发：0~1 */
  probability?: number;
  /** 自定义触发检查（运行时注入） */
  custom?: (state: GameState) => boolean;
}

/** Debuff 对属性的每日效果 */
export interface DebuffEffect {
  /** 县城属性每日增量（负数为扣减） */
  economy?: number;
  order?: number;
  culture?: number;
  livelihood?: number;
  /** 玩家资源每日增量 */
  money?: number;
  reputation?: number;
  /** 即时一次性效果（触发时立即生效） */
  immediateEconomy?: number;
  immediateOrder?: number;
  immediateCulture?: number;
  immediateLivelihood?: number;
  immediateMoney?: number;
  immediateReputation?: number;
  /** 百分比修正（乘区，-0.2 表示减少 20%） */
  facilityIncomeMultiplier?: number;    // 对产业收益的乘区（-0.15 = -15%）
  cultureGainMultiplier?: number;       // 对文化正收益的乘区
}

/** 叠层规则 */
export type DebuffStackRule = 'none' | 'refresh' | 'stack';
// none: 已有则忽略新触发
// refresh: 刷新持续时间
// stack: 叠加（最多 maxStacks 层）

/** Debuff 解除方式 */
export interface DebuffClearMethod {
  /** 解除方式标识 */
  id: string;
  /** 展示描述 */
  label: string;
  /** 花钱数量（正数） */
  moneyCost?: number;
  /** 花声望数量（正数） */
  reputationCost?: number;
  /** 是否需要健康/体力消耗 */
  healthCost?: number;
  /** 是否通过满足某属性阈值自动解除 */
  autoCondition?: (state: GameState) => boolean;
  /** 通过特定行为/flag 解除 */
  requiredFlag?: string;
}

/** Debuff 配置项（静态配置表） */
export interface DebuffConfig {
  id: string;
  name: string;
  description: string;
  /** 严重程度：minor / moderate / severe */
  severity: 'minor' | 'moderate' | 'severe';
  trigger: DebuffTrigger;
  /** 持续天数（-1 = 直到满足解除条件） */
  duration: number;
  effects: DebuffEffect;
  clearMethods: DebuffClearMethod[];
  stackRule: DebuffStackRule;
  maxStacks?: number;
}

/** 运行中的 Debuff 实例（存入 GameState） */
export interface ActiveDebuff {
  /** 对应 DebuffConfig.id */
  configId: string;
  /** 触发于第几天 */
  triggeredDay: number;
  /** 剩余天数（-1 = 无限直到手动解除） */
  remainingDays: number;
  /** 当前叠层数（从 1 开始） */
  stacks: number;
  /** 是否已应用即时效果 */
  immediateApplied: boolean;
  /** 触发来源描述（用于日志） */
  source?: string;
}
