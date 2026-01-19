import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, RoleType, GameEvent, Effect, PlayerProfile } from '@/types/game';
import { roles } from '@/data/roles';
import { randomEvents, npcEvents } from '@/data/events';
import { tasks } from '@/data/tasks';
import { policies } from '@/data/policies';
import { fortunes } from '@/data/fortunes';
import { talents } from '@/data/talents';
import { achievements } from '@/data/achievements';

interface GameStore extends GameState {
  currentEvent: GameEvent | null;
  isGameOver: boolean;

  startGame: (roleId: RoleType) => void;
  nextDay: () => void;
  handleEventOption: (effect?: Effect, message?: string) => void;
  addLog: (message: string) => void;
  triggerEvent: () => void;
  resetGame: () => void;
  checkTaskCompletion: () => void;
  handleTaskAction: () => void;
  incrementGiftFailure: (npcId: string) => void;
  resetGiftFailure: (npcId: string) => void;
  incrementDailyCount: (type: 'work' | 'rest') => void;
  setPolicy: (policyId: string) => void;
  cancelPolicy: () => void;
  divineFortune: () => void;
  
  // Talent & Achievement Methods
  upgradeTalent: (talentId: string) => void;
  checkAchievements: () => void;
  
  // NPC Interaction Methods
  interactWithNPC: (npcId: string, type: 'gift' | 'chat') => { success: boolean; message: string };
  checkVoiceStatus: () => boolean;
  
  // Profile Methods
  setPlayerProfile: (profile: Partial<PlayerProfile>) => void;

  // Time Methods
  updateTimeSettings: (settings: Partial<import('@/types/game').TimeSettings>) => void;
  resetDayTimer: () => void;
  togglePause: (paused: boolean) => void;

  // Developer Mode Methods
  updateStats: (updates: Partial<GameState>) => void;

  // Save/Load Methods
  exportSave: () => void;
  importSave: (data: string) => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      role: null,
      day: 1,
      timeSettings: {
        dayDurationSeconds: 300, // 5 minutes default
        isTimeFlowEnabled: true,
        dayStartTime: Date.now(),
        isPaused: false,
      },
      playerProfile: { name: '无名', avatar: '' },
      playerStats: { money: 0, reputation: 0, ability: 0, health: 100, experience: 0 },
      countyStats: { economy: 50, order: 50, culture: 50, livelihood: 50 },
      dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0 },
      npcInteractionStates: {},
      isVoiceLost: false,
      collectedScrolls: [],
      inventory: [],
      flags: {},
      npcRelations: {},
      logs: [],
      currentEvent: null,
      isGameOver: false,
      currentTaskId: undefined,
      completedTaskIds: [],
      giftFailureCounts: {},
      talents: {},
      achievements: [],

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
          playerProfile: { name: roleConfig.name, avatar: '' },
          playerStats: { ...roleConfig.initialStats, experience: 0 },
          countyStats: { ...roleConfig.initialCountyStats },
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0 },
          npcInteractionStates: {},
          isVoiceLost: false,
          collectedScrolls: [],
          activePolicyId: undefined,
          inventory: [],
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
        const npcState = state.npcInteractionStates[npcId] || { dailyGiftCount: 0, dailyChatCount: 0 };
        
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
                 return { success: true, message: '对方显然已经有些不耐烦了，好感度降低了。' };
            }

            // Normal chat
            set(prev => ({
                npcInteractionStates: {
                    ...prev.npcInteractionStates,
                    [npcId]: { ...npcState, dailyChatCount: npcState.dailyChatCount + 1 }
                },
                dailyCounts: { ...prev.dailyCounts, chatTotal: prev.dailyCounts.chatTotal + 1 },
                // Chat logic for relation gain handled in UI/Logic component usually, 
                // but here we just update limits. 
                // Assuming +2 relation for normal chat is handled by caller or we add it here?
                // The original implementation likely handled it. 
                // We'll update relation here to centralize.
                npcRelations: {
                    ...prev.npcRelations,
                    [npcId]: (prev.npcRelations[npcId] || 0) + 2
                }
            }));
            return { success: true, message: '你们愉快地聊了一会儿。' };
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
            newHealth = Math.min(maxHealth, currentHealth + 10);
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
                newPlayerStats.reputation = Math.min(1000, Math.max(0, newPlayerStats.reputation));
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

          const logs = [recoveryMessage, ...state.logs];
          if (policyMessage) logs.unshift(policyMessage);
          if (voiceMessage) logs.unshift(voiceMessage);
          
          logs.unshift('获得 10 点阅历。');

          return { 
            day: state.day + 1,
            dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0 },
            npcInteractionStates: {}, // Reset daily NPC interaction limits
            currentEvent: null,
            isVoiceLost: isVoiceLost,
            playerStats: { ...newPlayerStats, experience: (newPlayerStats.experience || 0) + 10 },
            countyStats: newCountyStats,
            logs: logs.slice(0, 50),
            timeSettings: { ...state.timeSettings, dayStartTime: Date.now() } // Reset timer
          };
        });
        get().addLog(`第 ${get().day} 天`);
        get().checkAchievements();
        get().checkTaskCompletion();
        get().triggerEvent();
      },

      handleEventOption: (effect, message) => {
        if (message) get().addLog(message);

        if (effect) {
          set(state => {
            const newPlayerStats = { ...state.playerStats, ...effect.playerStats };
            
            // Apply Talent Modifiers
            if (effect.money) {
               if (effect.money > 0) {
                   const level = state.talents['mercantile'] || 0;
                   newPlayerStats.money += Math.floor(effect.money * (1 + level * 0.1));
               } else {
                   newPlayerStats.money += effect.money;
               }
            }
            if (effect.reputation) {
               if (effect.reputation > 0) {
                   const level = state.talents['eloquence'] || 0;
                   newPlayerStats.reputation += Math.floor(effect.reputation * (1 + level * 0.1));
               } else {
                   newPlayerStats.reputation += effect.reputation;
               }
            }
            if (effect.ability) {
               if (effect.ability > 0) {
                   const level = state.talents['wisdom'] || 0;
                   newPlayerStats.ability += Math.floor(effect.ability * (1 + level * 0.1));
               } else {
                   newPlayerStats.ability += effect.ability;
               }
            }
            if (effect.health) newPlayerStats.health += effect.health;

            const newCountyStats = { ...state.countyStats, ...effect.countyStats };
            if (effect.economy) newCountyStats.economy += effect.economy;
            if (effect.order) newCountyStats.order += effect.order;
            if (effect.culture) newCountyStats.culture += effect.culture;
            if (effect.livelihood) newCountyStats.livelihood += effect.livelihood;

            // Clamp stats
            const fitnessLevel = state.talents['fitness'] || 0;
            const maxHealth = 100 + fitnessLevel * 10;

            newPlayerStats.reputation = Math.min(1000, Math.max(0, newPlayerStats.reputation));
            newPlayerStats.ability = Math.min(100, Math.max(0, newPlayerStats.ability));
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
               newInventory = newInventory.filter(i => !effect.itemsRemove?.includes(i));
            }

            const newNpcRelations = { ...state.npcRelations };
            if (effect.relationChange) {
               Object.entries(effect.relationChange).forEach(([id, val]) => {
                 newNpcRelations[id] = (newNpcRelations[id] || 0) + val;
               });
            }

            const newFlags = { ...state.flags, ...effect.flagsSet };

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

      resetGame: () => {
        set({
          role: null,
          day: 1,
          logs: [],
          currentEvent: null,
          isGameOver: false,
          currentTaskId: undefined,
          dailyCounts: { work: 0, rest: 0, chatTotal: 0, fortune: 0 },
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
        const saveData = {
          role: state.role,
          day: state.day,
          playerStats: state.playerStats,
          countyStats: state.countyStats,
          dailyCounts: state.dailyCounts,
          inventory: state.inventory,
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
          timestamp: Date.now(),
          version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
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
      }
    }),
    {
      name: 'textgame-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        role: state.role,
        day: state.day,
        playerStats: state.playerStats,
        countyStats: state.countyStats,
        dailyCounts: state.dailyCounts,
        inventory: state.inventory,
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
      }), // Save everything except actions
    }
  )
);
