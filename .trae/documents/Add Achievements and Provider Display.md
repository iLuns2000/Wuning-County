I will implement the new achievements and the provider display feature as follows:

1.  **Update Type Definitions (`src/types/game.ts`)**:
    *   Add an optional `provider?: string` field to the `Achievement` interface.

2.  **Update Achievement Data (`src/data/achievements.ts`)**:
    *   Add all the requested achievements to the `achievements` array.
    *   Define unique English IDs for each achievement (e.g., `cat_steal_fail`, `wuyan_praise`).
    *   Implement the `condition` logic for each achievement using `state.flags` and `state.npcRelations`. I will use specific flag keys (e.g., `cat_steal_fail_count`, `wuyan_praise_count`) which will serve as the contract for future event implementations.
    *   For achievements requiring a specific number of interactions (e.g., "{0} times"), I will set reasonable default values (e.g., 5, 10, 20) as placeholders in the code.

3.  **Update UI (`src/components/AchievementModal.tsx`)**:
    *   Modify the achievement list item rendering to display the "提供人: [Provider Name]" field when available.

**Note on Completion Logic:**
The achievement conditions will rely on specific flags in `state.flags` (e.g., `guanshan_hit_continuous`). Since the actual game events (like "hitting the target" or "stealing from the cat") might not exist or update these flags yet, the achievements will be technically "addable" but won't trigger until the corresponding game events are implemented to update these flags. I will use clear flag names so they can be easily integrated later.