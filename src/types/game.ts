export type RoleType = 'magistrate' | 'merchant' | 'hero';

export type WeatherType = 'sunny' | 'cloudy' | 'rain_light' | 'rain_heavy' | 'snow_light' | 'snow_heavy';

export interface PlayerStats {
  money: number;
  reputation: number;
  ability: number;
  health: number;
  experience: number;
  debt: number; // New field for bank loans
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  effectType: 'money_gain' | 'reputation_gain' | 'max_health' | 'ability_gain' | 'action_cost';
  effectValue: number; // value per level
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rewardExp: number;
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
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  cost: number;
  dailyIncome: number;
  incomeDescription: string;
  condition?: (stats: CountyStats) => boolean;
}

export interface CountyStats {
  economy: number;
  order: number;
  culture: number;
  livelihood: number;
}

export interface DailyActionCounts {
  work: number;
  rest: number;
  chatTotal: number; // Total chats today across all NPCs
  fortune: number; // Daily fortune telling count
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
}

export interface TimeSettings {
  dayDurationSeconds: number; // Duration of a day in seconds
  isTimeFlowEnabled: boolean; // Whether natural time flow is active
  dayStartTime: number; // Timestamp when the current day started (or was resumed)
  isPaused: boolean; // Whether the timer is currently paused (e.g. during events)
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
  collectedScrolls: Scroll[];
  activePolicyId?: string; // Currently active policy
  inventory: string[];
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
  ownedGoods: Record<string, number>; // goodId -> quantity
  ownedFacilities: Record<string, number>; // facilityId -> quantity
  
  // Daily Fortune
  fortuneLevel?: 'great_blessing' | 'blessing' | 'normal' | 'bad_luck' | 'terrible_luck';

  // Leek Garden
  leekPlots?: LeekPlot[];
  leekFacilities?: Record<string, boolean>; // id -> owned
  leekOrders?: LeekOrder[];
  dailyBargainGroupBuyCount: number; // Daily limit for bargain and group buy interactions
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
  // Flat county stats
  economy?: number;
  order?: number;
  culture?: number;
  livelihood?: number;
  
  itemsAdd?: string[];
  itemsRemove?: string[];
  flagsSet?: Record<string, any>;
  flagsIncrement?: string[];
  relationChange?: Record<string, number>;
}

export interface EventOption {
  label: string;
  effect?: Effect;
  message: string;
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
  avatar?: string;
  chatDialogues?: {
    high?: string[];
    medium?: string[];
    low?: string[];
  };
  interactionEventIds?: string[]; // IDs of events that can be triggered manually via interaction
  canBargain?: boolean; // Whether this NPC supports bargaining and group buying
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
