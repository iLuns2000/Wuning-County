import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, RoleType, GameEvent, Effect } from '@/types/game';
import { roles } from '@/data/roles';
import { randomEvents, npcEvents } from '@/data/events';
import { tasks } from '@/data/tasks';

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
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      role: null,
      day: 1,
      playerStats: { money: 0, reputation: 0, ability: 0, health: 100 },
      countyStats: { economy: 50, order: 50, culture: 50, livelihood: 50 },
      dailyCounts: { work: 0, rest: 0 },
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
          dailyCounts: { work: 0, rest: 0 },
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

          return { 
            day: state.day + 1,
            dailyCounts: { work: 0, rest: 0 },
            playerStats: {
              ...state.playerStats,
              health: newHealth
            },
            logs: [recoveryMessage, ...state.logs].slice(0, 50)
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
      }), // Save everything except actions
    }
  )
);
