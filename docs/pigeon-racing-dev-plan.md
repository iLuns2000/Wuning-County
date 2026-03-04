# 赛鸽比赛功能开发任务清单（按文件拆分到函数级）

> 目标：在不破坏现有“按天推进 + 资源经营 + 天气事件”框架下，为《无宁县志》新增“赛鸽比赛”玩法。

---

## 一、迭代范围与里程碑

### M1（可玩 MVP，建议 2~3 天）
- [ ] 可进入赛鸽界面（独立弹窗或游乐街子页）
- [ ] 可查看鸽子列表与基础属性
- [ ] 可进行基础训练（3种）
- [ ] 可报名每日一次比赛并结算奖励
- [ ] 次日结算疲劳/受伤恢复
- [ ] 日志有清晰反馈（报名、结果、异常）

### M2（系统联动，建议 2~4 天）
- [ ] 天气对比赛风险修正
- [ ] NPC 关系影响奖励或情报
- [ ] 成就与随机事件接入
- [ ] 经济平衡调优（防止碾压工作/贸易）

### M3（长期养成，建议 4~7 天）
- [ ] 血统与繁育
- [ ] 赛事分级与赛季排行
- [ ] 鸽舍扩建/道具系统

---

## 二、按文件拆分（函数级）

## 1) `src/types/game.ts`

### 新增类型
- [ ] `export type PigeonCondition = 'healthy' | 'tired' | 'injured' | 'lost';`
- [ ] `export type PigeonRaceType = 'sprint' | 'endurance';`
- [ ] `export interface PigeonStats { speed: number; endurance: number; homing: number; courage: number; }`
- [ ] `export interface Pigeon { id: string; name: string; level: number; stats: PigeonStats; fatigue: number; condition: PigeonCondition; injuredDaysLeft?: number; winCount: number; raceCount: number; }
- [ ] `export interface PigeonRaceRecord { day: number; pigeonId: string; raceType: PigeonRaceType; rank: number; score: number; rewardMoney: number; rewardReputation: number; weather: WeatherType; note?: string; }

### 扩展已有状态
- [ ] 在 `DailyActionCounts` 新增 `pigeonRace: number`
- [ ] 在 `GameState` 新增：
  - [ ] `pigeons: Pigeon[]`
  - [ ] `pigeonRaceHistory: PigeonRaceRecord[]`
  - [ ] `selectedPigeonId?: string`

---

## 2) `src/store/gameStore.ts`

## 2.1 Store 接口扩展（GameStore interface）
- [ ] 新增动作声明：
  - [ ] `buyPigeon: (name?: string) => void`
  - [ ] `renamePigeon: (id: string, name: string) => void`
  - [ ] `trainPigeon: (id: string, mode: 'speed' | 'endurance' | 'homing') => void`
  - [ ] `enterPigeonRace: (id: string, raceType: 'sprint' | 'endurance') => void`
  - [ ] `selectPigeon: (id?: string) => void`

## 2.2 初始状态
- [ ] 在初始化 state 中增加：
  - [ ] `pigeons: []`
  - [ ] `pigeonRaceHistory: []`
  - [ ] `selectedPigeonId: undefined`
- [ ] `dailyCounts` 初始化与重置处补 `pigeonRace: 0`

## 2.3 纯函数（建议放在文件上部工具区）
- [ ] `const clampStat = (v: number) => Math.max(1, Math.min(100, v));`
- [ ] `const getWeatherRaceRiskModifier = (weather: WeatherType) => ({ lostBonus: number, injuryBonus: number, speedPenalty: number });`
- [ ] `const calcPigeonRaceScore = (pigeon: Pigeon, raceType: PigeonRaceType, weather: WeatherType, rng = Math.random) => number`
- [ ] `const rollRaceRank = (score: number, rng = Math.random) => number`（可先用阈值映射）
- [ ] `const calcRaceReward = (raceType: PigeonRaceType, rank: number) => { money: number; reputation: number }`

## 2.4 动作函数实现
- [ ] `buyPigeon`
  - [ ] 校验金钱（建议价格 120~180）
  - [ ] 生成初始属性（区间随机）
  - [ ] 扣钱 + 写日志

- [ ] `renamePigeon`
  - [ ] 找到目标鸽子并更新名称
  - [ ] 写日志

- [ ] `trainPigeon`
  - [ ] 校验鸽子状态（受伤/丢失不可训练）
  - [ ] 校验玩家体力与金钱
  - [ ] 按模式修改属性：
    - [ ] speed: speed +1~2, fatigue +12
    - [ ] endurance: endurance +1~2, fatigue +10
    - [ ] homing: homing +1~2, fatigue +8
  - [ ] 随机小概率副作用（疲劳过高时受伤）
  - [ ] 写日志

- [ ] `enterPigeonRace`
  - [ ] 校验 `dailyCounts.pigeonRace < 1`
  - [ ] 校验报名费、体力、鸽子状态
  - [ ] 计算分数与名次
  - [ ] 发放奖励、增加战绩
  - [ ] 更新 `dailyCounts.pigeonRace += 1`
  - [ ] 记录 `pigeonRaceHistory`
  - [ ] 写日志（含天气、名次、奖励）

- [ ] `selectPigeon`
  - [ ] 简单设置 `selectedPigeonId`

## 2.5 nextDay 结算接入
在 `nextDay()` 内增加赛鸽日结逻辑：
- [ ] 疲劳自然恢复（建议 -20，最低 0）
- [ ] 受伤天数递减，为 0 切回 `healthy`
- [ ] 丢失鸽子返还判定（受天气/归巢影响）
- [ ] 日志插入赛鸽结算信息
- [ ] 每日计数重置含 `pigeonRace: 0`

## 2.6 持久化字段
- [ ] 检查 `persist` 的 `partialize`/迁移逻辑，确保新字段被存储与恢复
- [ ] 若有版本号迁移，补默认值兜底

---

## 3) `src/components/PigeonRaceModal.tsx`（新建）

### 组件结构
- [ ] 顶部：玩家货币、今日可比赛次数
- [ ] 左侧：鸽子列表（状态、属性、疲劳）
- [ ] 右侧：训练区 + 比赛区 + 最近战绩

### 交互函数
- [ ] `handleBuyPigeon()`
- [ ] `handleTrain(mode)`
- [ ] `handleEnterRace(type)`
- [ ] `renderConditionTag(condition)`
- [ ] `renderStatBar(label, value)`

### UI 状态
- [ ] `selectedId`（可与 store selectedPigeonId 同步）
- [ ] `pendingAction`（按钮防抖）

---

## 4) `src/pages/Game.tsx`

- [ ] 新增入口状态：`showPigeonRace`
- [ ] 在快捷入口区域增加“赛鸽场”按钮
- [ ] 在页面底部 modal 区挂载：
  - [ ] `{showPigeonRace && <PigeonRaceModal onClose={...} />}`
- [ ] 与 `currentEvent` 禁用态保持一致（防止事件冲突）

---

## 5) `src/data/achievements.ts`

新增成就（建议先 3~5 个）：
- [ ] `pigeon_first_win`：首次夺冠（+阅历）
- [ ] `pigeon_three_win_streak`：三连冠
- [ ] `pigeon_master_trainer`：任意鸽子单项属性达到 90
- [ ] `pigeon_legend`：累计 20 场比赛

并在成就判定逻辑中补触发条件。

---

## 6) `src/data/events.ts`

新增赛鸽相关随机事件（先做 4~6 条）：
- [ ] 赛前突雨（短程分数 -X）
- [ ] 驿路修缮（归巢 +X，持续 1 天）
- [ ] 神秘鸽哨（本次训练收益 +1）
- [ ] 黑市情报（报名费降低/奖励提高二选一）

触发条件可利用：天气、声望、NPC 好感、是否有鸽子。

---

## 7) `src/data/npcs.ts`（可选增强）

- [ ] 为 1~2 个 NPC 增加赛鸽对话与加成描述
- [ ] 在对应 NPC 互动中增加赛鸽加成 flag（例如当日训练折扣）

---

## 8) 文档更新

## `README.md`
- [ ] 在“游乐坊”中补“赛鸽场”玩法简介

## `GAME_MANUAL.md`
- [ ] 新增小节：赛鸽系统规则、天气影响、训练/比赛说明

---

## 三、数值建议（首版默认值）

## 1) 基础消耗与奖励
- [ ] 购买鸽子：150 文
- [ ] 训练消耗：
  - [ ] 速度训练：-4 体力 / -8 文
  - [ ] 耐力训练：-5 体力 / -10 文
  - [ ] 归巢训练：-3 体力 / -6 文
- [ ] 每鸽每日训练上限：2 次（第 3 次收益减半）

## 2) 比赛参数
- [ ] 每日可参赛次数：1（全局）
- [ ] 报名费：短程 20、长程 35
- [ ] 奖励：
  - [ ] 短程：1/2/3 名 = 80/45/20 文 + 12/6/2 声望
  - [ ] 长程：1/2/3 名 = 130/70/30 文 + 18/9/3 声望

## 3) 风险概率（按天气）
- [ ] 晴/阴：迷航 2%，受伤 1%
- [ ] 小雨：迷航 5%，受伤 2%
- [ ] 大雨/大雪：迷航 10%，受伤 5%

## 4) 恢复节奏
- [ ] 每日疲劳恢复：20
- [ ] 受伤恢复：1~2 天
- [ ] 丢失返还：次日按归巢值判定（高归巢更易回归）

---

## 四、验收标准（DoD）

### 功能验收
- [ ] 能买鸽、训鸽、参赛、领奖、看战绩
- [ ] 每日次数限制生效
- [ ] nextDay 后疲劳/状态变化正确
- [ ] 存档读档后数据不丢失

### 平衡验收
- [ ] 连续 10 天模拟：赛鸽收益不显著碾压“工作/基础贸易”
- [ ] 雨雪天气下风险明显但不“必亏”
- [ ] 少侠/商人/县丞都可参与但优势不同

### 体验验收
- [ ] 日志文案可读（至少包含：赛型、名次、奖励、异常）
- [ ] UI 操作路径 <= 3 步可参赛

---

## 五、建议实施顺序（可直接开干）

1. `types/game.ts` 先加类型与 state 字段
2. `gameStore.ts` 先打通 buy/train/race/nextDay（无 UI 先可跑）
3. 新建 `PigeonRaceModal.tsx` 接动作
4. `Game.tsx` 加入口与挂载
5. `achievements.ts` / `events.ts` 补内容
6. `README.md` / `GAME_MANUAL.md` 最后补文档

---

## 六、技术注意点（防踩坑）

- [ ] 所有赛鸽数值变动尽量走 store action，避免 UI 直接改 state
- [ ] 比赛结算尽量纯函数化（便于后续加测试）
- [ ] 日志长度受上限裁剪时，确保关键比赛日志优先入列
- [ ] 存档兼容老版本：无 `pigeons` 字段时要自动补默认值


---

## 七、怎么把这份清单交给 AI 编辑器执行（实操模板）

下面给你一套可以直接复制给 AI 编辑器（Cursor / Windsurf / Trae / Copilot Chat 等）的流程。

### Step 0：先让 AI 理解边界（一次性）
把这段先发给 AI：

```text
你现在是这个仓库的协作开发者。请严格按 docs/pigeon-racing-dev-plan.md 执行。
要求：
1) 每次只完成一个小迭代（不要一次改太多文件）。
2) 修改后必须运行可执行检查（至少 npm run build）。
3) 输出变更文件列表、关键函数、风险点。
4) 给出 git commit message（Conventional Commit）。
5) 如果遇到不确定设计，先给 2 个方案对比再动手。
```

### Step 1：按里程碑拆任务给 AI（推荐顺序）
- 第一次对话只做 **M1-1：类型 + store 最小闭环（无 UI）**
- 第二次对话做 **M1-2：PigeonRaceModal + Game.tsx 入口**
- 第三次对话做 **M1-3：成就/事件接入 + 文案**

> 原则：一次 PR 控制在 4~8 个文件，便于你 review。

### Step 2：可直接复制的 Prompt（分阶段）

#### Prompt A（先打通数据与逻辑）
```text
请实现 docs/pigeon-racing-dev-plan.md 中以下内容：
- 1) src/types/game.ts 的赛鸽类型与 GameState 字段
- 2) src/store/gameStore.ts 的 buyPigeon/trainPigeon/enterPigeonRace/selectPigeon
- 3) nextDay 中加入赛鸽疲劳恢复与每日次数重置
限制：
- 先不做 UI
- 不改动无关逻辑
- 所有新增逻辑必须写日志
完成后请执行 npm run build，并贴出关键 diff 摘要。
```

#### Prompt B（接入界面）
```text
在已有赛鸽 store 能力基础上，继续实现：
- 新建 src/components/PigeonRaceModal.tsx
- 在 src/pages/Game.tsx 增加“赛鸽场”入口与弹窗挂载
要求：
- 风格与现有 modal 一致
- currentEvent 时按钮禁用
- 操作路径 3 步内完成“选鸽-报名-结算”
完成后执行 npm run build，并列出手测步骤。
```

#### Prompt C（内容层增强）
```text
继续实现 docs/pigeon-racing-dev-plan.md 的内容层：
- src/data/achievements.ts 新增 3~5 个赛鸽成就
- src/data/events.ts 新增 4~6 条赛鸽事件
要求：
- 触发条件与天气/NPC关系有关
- 文案保持古风叙事
- 不引入破坏平衡的超高收益
完成后执行 npm run build，并说明平衡性设计。
```

### Step 3：让 AI 自检（每轮都要）
每轮开发后追加这句：

```text
请做一次自检清单：
1) 类型是否完整且无 TS 报错
2) 存档字段是否兼容旧档
3) 每日计数是否在 nextDay 正确重置
4) 是否有可能出现负金钱/负体力
5) 给出你最担心的 3 个 bug 点
```

### Step 4：你的人类验收清单（5 分钟版）
- [ ] 能买鸽子，钱会减少
- [ ] 能训练，体力会减少，属性会变化
- [ ] 每天只能比赛一次
- [ ] 点“结束这一天”后疲劳恢复
- [ ] 读档后鸽子数据不消失

### Step 5：如果 AI 跑偏，直接用这句拉回
```text
你偏离了 docs/pigeon-racing-dev-plan.md。
请停止新增设计，只按“二、按文件拆分（函数级）”中尚未完成的勾选项继续，
并按“最小可合并改动”提交。
```

### 推荐协作节奏
- 每天 1~2 个小 PR
- 每个 PR 只解决一个问题层（类型层 / 逻辑层 / UI层 / 内容层）
- 合并后再开下一轮，避免一次改太大导致回滚困难

