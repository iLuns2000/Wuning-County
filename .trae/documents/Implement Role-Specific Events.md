I will implement role-specific events to make each role's gameplay more unique.

## 1. Update Data Structure
- Modify `GameEvent` type in `src/types/game.ts` to support a `requiredRole` field in `triggerCondition`.

## 2. Update Game Logic
- Update `triggerEvent` in `src/store/gameStore.ts` to filter events based on the current player's role. If an event has a `requiredRole`, it will only trigger if it matches the player's role.

## 3. Add New Events
I will add the following role-exclusive events to `src/data/events.ts`:

### 💰 Merchant Exclusive: "New Branch Opening" (开设分店)
- **Description**: You spot a prime location for a new shop.
- **Choices**:
  - **Invest**: Cost money, but significantly boosts County Economy and future income.
  - **Pass**: Save capital.

### 🏛️ Magistrate Exclusive: "Urban Planning" (县城规划)
- **Description**: The county needs a development direction for the next quarter.
- **Choices**:
  - **Focus on Commerce**: Boost Economy.
  - **Focus on Security**: Boost Order.
  - **Focus on Livelihood**: Boost Livelihood.

### ⚔️ Hero Exclusive: "Jianghu Bounty" (江湖悬赏令)
- **Description**: A wanted criminal has been spotted nearby.
- **Choices**:
  - **Hunt them down**: High risk (Health), high reward (Money & Reputation).
  - **Ignore**: Avoid trouble.
