import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, RoleType, GameEvent, Effect, PlayerProfile, WeatherType, ApparelSlot } from '@/types/game';
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
import { items } from '@/data/items';
import { treasurePrices } from '@/data/treasures';
import { charities } from '@/data/charities';

// Weather System Helper
const SEASON_LENGTH = 90;
const SEASONS = ['春', '夏', '秋', '冬'] as const;

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
  isGameOver: boolean;
  marketState: 'normal' | 'undercut' | 'cooperative' | 'boom' | 'crash';

  startGame: (roleId: RoleType) => void;
  nextDay: () => void;
  handleEventOption: (effect?: Effect, message?: string) => void;
  addLog: (message: string) => void;
  triggerEvent: () => void;
  triggerSpecificEvent: (eventId: string) => void;
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
  checkVoiceStatus: () => boolean;
  
  // Profile Methods
  setPlayerProfile: (profile: Partial<PlayerProfile>) => void;

  // Time Methods
  updateTimeSettings: (settings: Partial<import('@/types/game').TimeSettings>) => void;
  resetDayTimer: () => void;
  togglePause: (paused: boolean) => void;

  // Developer Mode Methods
  updateStats: (updates: Partial<GameState>) => void;

  // Achievement Actions
  dismissAchievementPopup: () => void;
  
  // Explore Actions
  performExplore: () => void;

  // Save/Load Methods
  exportSave: () => void;
  exportSaveString: () => string; // New method for clipboard export
  importSave: (data: string) => boolean;

  // Sound Settings
  soundEnabled: boolean;
  volume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;

  // Haptic Settings
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;

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
  equipAccessory: (itemId: string) => void;
  unequipAccessory: (itemId: string) => void;

  // Gold Sinks
  buyTreasure: (treasureId: string) => void;
  performCharity: (charityId: string) => void;
  
  // Disaster Relief
  donateDisasterRelief: (type: 'grain' | 'cloth', amount: number) => void;
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
      timeSettings: {
        dayDurationSeconds: 300, // 5 minutes default
        isTimeFlowEnabled: true,
        dayStartTime: Date.now(),
        isPaused: false,
      },
      playerProfile: { name: '无名', avatar: '' },
      playerStats: { money: 0, reputation: 0, ability: 0, health: 100, experience: 0, debt: 0 },
      countyStats: { economy: 50, order: 50, culture: 50, livelihood: 50 },
      dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0 },
      npcInteractionStates: {},
      isVoiceLost: false,
      collectedScrolls: [],
      inventory: [],
      equippedApparel: {},
      equippedAccessories: [],
      flags: {},
      npcRelations: {},
      logs: [],
      currentEvent: null,
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
      ],
      leekFacilities: {},
      leekOrders: [],
      disasterState: { type: 'none', active: false, duration: 0, lastTriggerDay: 0 },

      markInteraction: () => {
        const state = get();
        if (!state.hasInteractedToday) {
            set({ hasInteractedToday: true });
        }
      },

      dismissAchievementPopup: () => set({ latestUnlockedAchievementId: undefined }),

      performExplore: () => {
        set({ isExploring: true, exploreResult: null });
        
        const state = get();
        let failChance = 0.15;
        
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
           // For now, just random item from pool, or specifically Lovesickness Tablet
           itemId = 'lovesickness_tablet';
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
            if (!state.inventory.includes('cursed_sword')) {
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
        
        set(state => ({
          playerStats: { ...state.playerStats, money: state.playerStats.money + earnings },
          ownedGoods: {
            ...state.ownedGoods,
            [goodId]: currentQty - quantity
          }
        }));
        get().addLog(`【市集】出售 ${quantity} 个${goods.find(g => g.id === goodId)?.name}，获得 ${earnings} 文。`);
      },

      buyFacility: (facilityId) => {
        const state = get();
        const facility = facilities.find(f => f.id === facilityId);
        if (!facility) return;
        
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
        let finalCost = cost ?? (leekFacilities.find(f => f.id === id)?.cost ?? 0);
        if (state.playerStats.money < finalCost) {
            state.addLog('资金不足。');
            return;
        }
        if (state.leekFacilities?.[id]) {
            state.addLog('你已经拥有此设施。');
            return;
        }
        set(s => ({
            playerStats: { ...s.playerStats, money: s.playerStats.money - finalCost },
            leekFacilities: { ...s.leekFacilities, [id]: true }
        }));
        get().addLog('【韭菜园】成功添置设施。');
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
        
        // Fertility penalty
        const currentFertility = plot.fertility || 100;
        let baseYield = Math.max(1, (plot as any).baseYield || plot.growthTarget || 3);
        if (currentFertility < 30) {
            baseYield = Math.max(1, Math.floor(baseYield * 0.5));
            get().addLog('【韭菜园】土地贫瘠，收成大减。');
        }

        const qualityBonus = Math.floor((plot.quality || 0) / 10);
        const pestPenalty = Math.floor((plot.pest || 0) / 20);
        const qty = Math.max(1, baseYield + qualityBonus - pestPenalty);
        
        set(s => ({
          ownedGoods: { ...s.ownedGoods, leek: (s.ownedGoods['leek'] || 0) + qty },
          leekPlots: (s.leekPlots || []).map(p => p.id === plotId ? { id: plotId, pest: 0, ready: false, fertility: Math.max(0, currentFertility - 10) } : p),
        }));
        get().addLog(`【韭菜园】收获鲜韭 ${qty} 把。`);
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
        
        set(s => ({
            ownedGoods: { ...s.ownedGoods, leek: currentQty - order.quantity },
            playerStats: { ...s.playerStats, money: s.playerStats.money + totalReward },
            leekOrders: (s.leekOrders || []).filter(o => o.id !== orderId)
        }));
        get().addLog(`【订单】交付订单，获得 ${totalReward} 文。`);
      },

      buyItem: (itemId, cost) => {
        const state = get();
        if (state.playerStats.money < cost) {
            get().addLog('资金不足。');
            return;
        }
        set(state => ({
            playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
            inventory: [...state.inventory, itemId]
        }));
        const itemName = items.find(i => i.id === itemId)?.name || '物品';
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

          if (state.inventory.includes(treasureId)) {
               get().addLog('你已经拥有此珍宝了。');
               return;
          }

          const treasure = items.find(i => i.id === treasureId);
          if (!treasure) return;

          set(state => ({
              playerStats: { ...state.playerStats, money: state.playerStats.money - cost },
              inventory: [...state.inventory, treasureId]
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
        const itemIndex = state.inventory.indexOf(itemId);
        if (itemIndex === -1) return;

        const item = items.find(i => i.id === itemId);
        if (item && item.effect) {
             get().handleEventOption(item.effect, `使用了 ${item.name}`);
        } else {
             get().addLog(`使用了 ${item?.name || '物品'}，但是什么也没发生。`);
        }

        const newInventory = [...state.inventory];
        newInventory.splice(itemIndex, 1);
        set({ inventory: newInventory });
      },

      equipApparel: (slot, itemId) => {
        const state = get();
        const item = items.find(i => i.id === itemId);
        if (!item || item.type !== 'apparel' || item.slot !== slot) {
          get().addLog('此物不可用于该衣装部位。');
          return;
        }
        if (!state.inventory.includes(itemId)) {
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

      equipAccessory: (itemId) => {
        const state = get();
        const item = items.find(i => i.id === itemId);
        if (!item || item.type !== 'accessory') {
          get().addLog('此物不可作为首饰佩戴。');
          return;
        }
        if (!state.inventory.includes(itemId)) {
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
          playerProfile: { ...(state.playerProfile || {}), ...profile }
        }));
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
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0 },
          npcInteractionStates: {},
          isVoiceLost: false,
          collectedScrolls: [],
          activePolicyId: undefined,
          inventory: [],
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
                 // Annoyance mechanic
                 set(prev => ({
                    npcInteractionStates: {
                        ...prev.npcInteractionStates,
                        [npcId]: { ...npcState, dailyChatCount: npcState.dailyChatCount + 1 }
                    },
                    dailyCounts: { ...prev.dailyCounts, chatTotal: prev.dailyCounts.chatTotal + 1 },
                    npcRelations: {
                        ...prev.npcRelations,
                        [npcId]: (prev.npcRelations[npcId] || 0) - 1
                    }
                 }));
                 return { success: true, message: '对方显然已经有些不耐烦了，好感度降低了。(好感度 -1)' };
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
            else if (level === 'medium') relationChange = 3;
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

        achievements.forEach(ach => {
          if (!state.achievements.includes(ach.id)) {
            if (ach.condition(state)) {
              newUnlockedIds.push(ach.id);
              totalRewardExp += ach.rewardExp;
              get().addLog(`【成就达成】${ach.name}：获得 ${ach.rewardExp} 阅历！`);
            }
          }
        });

        if (newUnlockedIds.length > 0) {
          set(state => ({
            achievements: [...state.achievements, ...newUnlockedIds],
            latestUnlockedAchievementId: newUnlockedIds[newUnlockedIds.length - 1], // Show the latest one
            playerStats: {
              ...state.playerStats,
              experience: state.playerStats.experience + totalRewardExp
            }
          }));
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
        set(state => {
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

          // Facility Income
          let facilityIncome = 0;
          let facilityMessage = '';
          Object.entries(state.ownedFacilities).forEach(([facilityId, count]) => {
             const facility = facilities.find(f => f.id === facilityId);
             if (facility && count > 0) {
                 facilityIncome += facility.dailyIncome * count;
             }
          });
          
          if (facilityIncome > 0) {
              // Apply Economy bonus (e.g., 1% per 2 points of economy above 50)
              const economyBonus = Math.max(0, (state.countyStats.economy - 50) / 200);
              facilityIncome = Math.floor(facilityIncome * (1 + economyBonus));
              newPlayerStats.money += facilityIncome;
              facilityMessage = `【产业收益】昨日产业共盈利 ${facilityIncome} 文。`;
          }

          // Mower Logic
          const hasMower = state.leekFacilities?.['mower'];
          const mowerHarvestedPlots = new Set<number>();
          let mowerHarvestCount = 0;
          
          if (hasMower) {
             (state.leekPlots || []).forEach(p => {
                 const target = p.growthTarget || 3;
                 if (p.varietyId && ((p.ready) || ((p.growthProgress || 0) >= target))) {
                     const quality = p.quality || 0;
                     const base = (p as any).baseYield || 3;
                     const yieldAmount = base + Math.floor(quality / 25);
                     mowerHarvestCount += yieldAmount;
                     mowerHarvestedPlots.add(p.id);
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
          
          const hasColdStorage = state.leekFacilities?.['cold_storage'];
          const hasProcessingTable = state.leekFacilities?.['processing_table'];

          goods.forEach(good => {
             const count = newOwnedGoods[good.id] || 0;
             if (count > 0 && good.spoilageRate && good.spoilageRate > 0) {
                 let rate = good.spoilageRate;
                 if (hasColdStorage) rate *= 0.5;
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

          // Tax Mechanism: 10% tax if money > 1,000,000
          let taxMessage = '';
          if (newPlayerStats.money > 1000000) {
              const tax = Math.floor(newPlayerStats.money * 0.1);
              newPlayerStats.money -= tax;
              taxMessage = `【税收】由于家产丰厚（超过100万文），官府强制征收了 10% 的财产税，扣除 ${tax} 文。`;
          }

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

          // Reset daily flags
          const newFlags = { ...state.flags };
          Object.keys(newFlags).forEach(key => {
            if (key.endsWith('_daily')) {
              delete newFlags[key];
            }
          });

          const logs = [recoveryMessage, ...state.logs];
          if (policyMessage) logs.unshift(policyMessage);
          if (voiceMessage) logs.unshift(voiceMessage);
          if (facilityMessage) logs.unshift(facilityMessage);
          if (spoilageMessage) logs.unshift(spoilageMessage);
          if (marketStateMessage) logs.unshift(marketStateMessage);
          if (mowerHarvestCount > 0) logs.unshift(`【自动收割】割草机自动收割了 ${mowerHarvestCount} 捆韭菜。`);
          if (maintenanceMessage) logs.unshift(maintenanceMessage);
          if (taxMessage) logs.unshift(taxMessage);
          if (disasterMessage) logs.unshift(disasterMessage);
          
          logs.unshift(`【天气】今日天气：${weatherNames[nextWeather]}`);
          logs.unshift('获得 10 点阅历。');

          return { 
            day: state.day + 1,
            weather: nextWeather,
            disasterState: nextDisasterState,
            marketState: newMarketState,
            marketPrices: newMarketPrices,
            marketInventory: newMarketInventory,
            dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0 },
            hasInteractedToday: false,
            npcInteractionStates: {}, // Reset daily NPC interaction limits
            currentEvent: null,
            isVoiceLost: isVoiceLost,
            playerStats: { ...newPlayerStats, experience: (newPlayerStats.experience || 0) + 10 },
            countyStats: newCountyStats,
            logs: logs.slice(0, 50),
            timeSettings: { ...state.timeSettings, dayStartTime: Date.now() }, // Reset timer
            priceLocks: currentPriceLocks,
            fortuneLevel: undefined, // Reset daily fortune
            flags: newFlags, // Apply reset flags
            ownedGoods: newOwnedGoods, // Apply spoilage & harvest
            leekPlots: (state.leekPlots || []).map(p => {
              // 0. Handle Mower Reset
              if (mowerHarvestedPlots.has(p.id)) {
                  return {
                      ...p,
                      varietyId: undefined,
                      growthProgress: 0,
                      watered: false,
                      fertilized: false,
                      pest: 0,
                      quality: 0,
                      ready: false,
                      fertility: Math.max(0, (p.fertility || 100) - 5)
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
        get().checkAchievements();
        get().checkTaskCompletion();
        get().triggerEvent();
      },

      handleEventOption: (effect, message) => {
        const state = get();
        let statChanges: string[] = [];

        // Calculate all changes first
        let moneyChange = 0;
        let reputationChange = 0;
        let abilityChange = 0;
        let healthChange = 0;
        let experienceChange = 0;
        
        let economyChange = 0;
        let orderChange = 0;
        let cultureChange = 0;
        let livelihoodChange = 0;

        if (effect) {
            // 1. Accumulate changes from nested objects (treating them as deltas)
            if (effect.playerStats) {
                if (effect.playerStats.money) moneyChange += effect.playerStats.money;
                if (effect.playerStats.reputation) reputationChange += effect.playerStats.reputation;
                if (effect.playerStats.ability) abilityChange += effect.playerStats.ability;
                if (effect.playerStats.health) healthChange += effect.playerStats.health;
                if (effect.playerStats.experience) experienceChange += effect.playerStats.experience;
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
            
            if (effect.economy) economyChange += effect.economy;
            if (effect.order) orderChange += effect.order;
            if (effect.culture) cultureChange += effect.culture;
            if (effect.livelihood) livelihoodChange += effect.livelihood;

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
            
            // 4. Generate Log Strings
            const formatChange = (name: string, value: number) => {
                return `${name}${value > 0 ? '+' : ''}${value}`;
            };

            if (healthChange !== 0) statChanges.push(formatChange('体力', healthChange));
            if (moneyChange !== 0) statChanges.push(formatChange('银两', moneyChange));
            if (reputationChange !== 0) statChanges.push(formatChange('声望', reputationChange));
            if (abilityChange !== 0) statChanges.push(formatChange('能力', abilityChange));
            if (experienceChange !== 0) statChanges.push(formatChange('阅历', experienceChange));
            
            if (economyChange !== 0) statChanges.push(formatChange('经济', economyChange));
            if (orderChange !== 0) statChanges.push(formatChange('治安', orderChange));
            if (cultureChange !== 0) statChanges.push(formatChange('文化', cultureChange));
            if (livelihoodChange !== 0) statChanges.push(formatChange('民生', livelihoodChange));
            
            if (effect.itemsAdd && effect.itemsAdd.length > 0) {
                const itemNames = effect.itemsAdd.map(id => items.find(i => i.id === id)?.name || id);
                statChanges.push(`获得 ${itemNames.join('、')}`);
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

        if (fullMessage) get().addLog(fullMessage);

        if (effect) {
          set(state => {
            const newPlayerStats = { ...state.playerStats };
            newPlayerStats.money = (newPlayerStats.money || 0) + moneyChange;
            newPlayerStats.reputation = (newPlayerStats.reputation || 0) + reputationChange;
            newPlayerStats.ability = (newPlayerStats.ability || 0) + abilityChange;
            newPlayerStats.health = (newPlayerStats.health || 0) + healthChange;
            newPlayerStats.experience = (newPlayerStats.experience || 0) + experienceChange;

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

            let newInventory = [...state.inventory];
            if (effect.itemsAdd) {
               newInventory = [...newInventory, ...effect.itemsAdd];
            }
            if (effect.itemsRemove) {
               for (const itemId of effect.itemsRemove) {
                   const index = newInventory.indexOf(itemId);
                   if (index !== -1) {
                       newInventory.splice(index, 1);
                   }
               }
            }

            const newNpcRelations = { ...state.npcRelations };
            if (effect.relationChange) {
               Object.entries(effect.relationChange).forEach(([id, val]) => {
                 newNpcRelations[id] = (newNpcRelations[id] || 0) + val;
               });
            }

            const newFlags = { ...state.flags, ...effect.flagsSet };

            if (effect.flagsIncrement) {
                effect.flagsIncrement.forEach(key => {
                    newFlags[key] = (newFlags[key] || 0) + 1;
                });
            }

            return {
               playerStats: newPlayerStats,
               countyStats: newCountyStats,
               inventory: newInventory,
               npcRelations: newNpcRelations,
               flags: newFlags,
               currentEvent: null,
            };
          });
          // Check task completion after state update
          get().checkTaskCompletion();
          get().checkAchievements();
        } else {
            set({ currentEvent: null });
        }
      },
      
      addLog: (message) => set(state => ({ logs: [message, ...state.logs].slice(0, 50) })),

      triggerEvent: () => {
         // Global 30% chance to trigger any event at the end of the day
         if (Math.random() > 0.3) {
             set({ currentEvent: null });
             return;
         }

         const state = get();
         
         const checkCondition = (e: GameEvent) => {
            const cond = e.triggerCondition;
            if (!cond) return true;
            
            if (cond.requiredRole && state.role !== cond.requiredRole) return false;
            if (cond.minReputation && state.playerStats.reputation < cond.minReputation) return false;
            if (cond.minMoney && state.playerStats.money < cond.minMoney) return false;
            if (cond.minAbility && state.playerStats.ability < cond.minAbility) return false;
            if (cond.minDay && state.day < cond.minDay) return false;
            if (cond.custom && !cond.custom(state)) return false;
            
            if (cond.probability !== undefined) {
               return Math.random() < cond.probability;
            }
            return true;
         };

         // 1. NPC events first (priority)
         const possibleNpcEvents = npcEvents.filter(checkCondition);

         // 2. Random events
         const possibleRandomEvents = randomEvents.filter(checkCondition);

         const allEvents = [...possibleNpcEvents, ...possibleRandomEvents];
         
         if (allEvents.length > 0) {
           // Pick one random
           const event = allEvents[Math.floor(Math.random() * allEvents.length)];
           set({ currentEvent: event });
         }
      },

      triggerSpecificEvent: (eventId: string) => {
          // Look in all event collections
          const event = [...npcEvents, ...randomEvents].find(e => e.id === eventId);
          if (event) {
              set({ currentEvent: event });
          }
      },

      resetGame: () => {
        set({
          role: null,
          day: 1,
          logs: [],
          currentEvent: null,
          isGameOver: false,
          currentTaskId: undefined,
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0, explore: 0 },
          hasInteractedToday: false,
          equippedApparel: {},
          equippedAccessories: [],
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
        const a = document.createElement('a');
        a.href = url;
        a.download = `wuning_save_${state.role}_day${state.day}_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        get().addLog('【系统】存档导出成功！');
      },

      exportSaveString: () => {
        const state = get();
        const saveData = {
          role: state.role,
          day: state.day,
          weather: state.weather,
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

          set(state => ({
            ...state,
            ...data,
            // Ensure nested objects are merged/overwritten correctly if needed, 
            // but since we export the full object structure, direct spread should work 
            // for the top-level keys we care about.
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
     }),
     {
       name: 'textgame-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
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
        marketPrices: state.marketPrices,
        marketInventory: state.marketInventory,
        ownedGoods: state.ownedGoods,
        ownedFacilities: state.ownedFacilities,
        fortuneLevel: state.fortuneLevel,
        hasInteractedToday: state.hasInteractedToday,
        latestUnlockedAchievementId: state.latestUnlockedAchievementId,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        vibrationEnabled: state.vibrationEnabled,
        leekPlots: state.leekPlots,
        leekFacilities: state.leekFacilities,
        leekOrders: state.leekOrders,
      }), // Save everything except actions
    }
  )
);
