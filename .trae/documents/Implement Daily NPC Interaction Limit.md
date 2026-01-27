I will implement the daily interaction limit for NPCs (max 5 times per day for non-gift/chat interactions) by modifying the game state and interaction logic.

### 1. Update Data Types
- Modify `NPCInteractionState` in `src/types/game.ts` to include `dailyActionCount`.

### 2. Update Game Store Logic
- Update `interactWithNPC` in `src/store/gameStore.ts` to:
  - Initialize `dailyActionCount` when creating new NPC states.
  - Support a new interaction type `'action'` (for generic interactions like events).
  - Check if `dailyActionCount >= 5` for this new type.
  - Increment `dailyActionCount` on success.

### 3. Update NPC List UI
- Modify `src/pages/NPCList.tsx` to use the updated `interactWithNPC` function when triggering specific NPC events.
- Ensure the event is only triggered if the interaction check succeeds.

This ensures all "other" interactions are counted and limited to 5 per day per NPC, consistent with the existing gift/chat limits.