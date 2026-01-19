export type RoleType = 'magistrate' | 'merchant' | 'hero';

export interface PlayerStats {
  money: number;
  reputation: number;
  ability: number;
  health: number;
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
}

export interface GameState {
  role: RoleType | null;
  day: number;
  playerStats: PlayerStats;
  countyStats: CountyStats;
  dailyCounts: DailyActionCounts;
  inventory: string[];
  flags: Record<string, boolean>;
  npcRelations: Record<string, number>;
  logs: string[];
  currentTaskId?: string; // Track current main task
  completedTaskIds: string[]; // Track completed tasks
  giftFailureCounts: Record<string, number>; // Track consecutive gift failures per NPC
}

export interface Effect {
  playerStats?: Partial<PlayerStats>;
  countyStats?: Partial<CountyStats>;
  // Flat player stats
  money?: number;
  reputation?: number;
  ability?: number;
  health?: number;
  // Flat county stats
  economy?: number;
  order?: number;
  culture?: number;
  livelihood?: number;
  
  itemsAdd?: string[];
  itemsRemove?: string[];
  flagsSet?: Record<string, boolean>;
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
  type: 'daily' | 'opportunity' | 'challenge' | 'npc';
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
  description: string;
  background: string;
  avatar?: string;
}
