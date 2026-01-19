import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, RoleType, GameEvent, Effect } from '@/types/game';
import { roles } from '@/data/roles';
import { randomEvents, npcEvents } from '@/data/events';
import { tasks } from '@/data/tasks';
import { policies } from '@/data/policies';

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
  
  // NPC Interaction Methods
  interactWithNPC: (npcId: string, type: 'gift' | 'chat') => { success: boolean; message: string };
  checkVoiceStatus: () => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      role: null,
      day: 1,
      playerStats: { money: 0, reputation: 0, ability: 0, health: 100 },
      countyStats: { economy: 50, order: 50, culture: 50, livelihood: 50 },
      dailyCounts: { work: 0, rest: 0, chatTotal: 0 },
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

      startGame: (roleId) => {
        const roleConfig = roles.find(r => r.id === roleId);
        if (!roleConfig) return;

        const firstTask = tasks.find(t => t.role === roleId && t.id.endsWith('_1'));

        set({
          role: roleId,
          day: 1,
          playerStats: { ...roleConfig.initialStats },
          countyStats: { ...roleConfig.initialCountyStats },
          dailyCounts: { work: 0, rest: 0, chatTotal: 0 },
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

      nextDay: () => {
        set(state => {
          const currentHealth = state.playerStats.health;
          let newHealth = currentHealth;
          let recoveryMessage = '';

          if (currentHealth > 50) {
            newHealth = 100;
            recoveryMessage = '经过一晚充足的休息，体力已完全恢复。';
          } else {
            newHealth = Math.min(100, currentHealth + 10);
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

          return { 
            day: state.day + 1,
            dailyCounts: { work: 0, rest: 0, chatTotal: 0 },
            npcInteractionStates: {}, // Reset daily NPC interaction limits
            isVoiceLost: isVoiceLost,
            playerStats: newPlayerStats,
            countyStats: newCountyStats,
            logs: logs.slice(0, 50)
          };
        });
        get().addLog(`第 ${get().day} 天`);
        get().checkTaskCompletion();
        get().triggerEvent();
      },

      handleEventOption: (effect, message) => {
        if (message) get().addLog(message);

        if (effect) {
          set(state => {
            const newPlayerStats = { ...state.playerStats, ...effect.playerStats };
            if (effect.money) newPlayerStats.money += effect.money;
            if (effect.reputation) newPlayerStats.reputation += effect.reputation;
            if (effect.ability) newPlayerStats.ability += effect.ability;
            if (effect.health) newPlayerStats.health += effect.health;

            const newCountyStats = { ...state.countyStats, ...effect.countyStats };
            if (effect.economy) newCountyStats.economy += effect.economy;
            if (effect.order) newCountyStats.order += effect.order;
            if (effect.culture) newCountyStats.culture += effect.culture;
            if (effect.livelihood) newCountyStats.livelihood += effect.livelihood;

            // Clamp stats
            newPlayerStats.reputation = Math.min(1000, Math.max(0, newPlayerStats.reputation));
            newPlayerStats.ability = Math.min(100, Math.max(0, newPlayerStats.ability));
            newPlayerStats.health = Math.min(100, Math.max(0, newPlayerStats.health));

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
          dailyCounts: { work: 0, rest: 0 },
        });
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
      }), // Save everything except actions
    }
  )
);
