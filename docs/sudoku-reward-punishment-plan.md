# 数独奖惩机制规划（V1.0）

> 目标：让数独玩法从“纯休闲”升级为“可持续参与、可控产出、可调难度”的系统，同时避免刷分和挫败感。

## 1. 设计原则

1. **完成优先，效率加成**：先鼓励玩家“做完”，再通过时间、失误、提示控制奖励上限。
2. **难度有梯度，收益有差异**：困难局显著高于简单局，体现风险回报。
3. **惩罚不过度**：允许犯错，但对反复试错和高频提示设置软惩罚。
4. **防刷机制内建**：重复刷同难度低质量对局时，收益递减。
5. **可扩展到赛季/任务系统**：后续可无缝接入日常任务、成就、活动倍率。

---

## 2. 奖励结构（建议）

## 2.1 结算奖励类型

- **基础银钱（money）**：核心产出。
- **经验（experience）**：稳定成长。
- **声望（reputation）**：小幅波动，作为高质量完成的附加鼓励。

> 若当前经济系统希望更保守，可先只发 money + experience，声望在 V1.1 开启。

## 2.2 基础奖励（按难度）

| 难度 | 基础银钱 | 基础经验 |
|---|---:|---:|
| easy | 30 | 12 |
| medium | 55 | 22 |
| hard | 95 | 38 |

说明：hard 约为 easy 的 3.1 倍，覆盖更高时间成本和思考成本。

## 2.3 质量加成系数（最终奖励核心公式）

### 最终银钱公式

`finalMoney = floor(baseMoney × timeFactor × mistakeFactor × hintFactor × streakFactor × antiFarmFactor)`

### 最终经验公式

`finalExp = floor(baseExp × timeFactor × hintFactor × antiFarmFactor)`

> 经验不受 mistakeFactor 影响，可降低“手抖输入”导致的心理落差。

---

## 3. 各系数建议

## 3.1 时间系数 timeFactor（按难度分段）

### easy
- `<= 180s`：1.20
- `181~360s`：1.00
- `361~600s`：0.85
- `> 600s`：0.70

### medium
- `<= 300s`：1.25
- `301~540s`：1.00
- `541~900s`：0.85
- `> 900s`：0.70

### hard
- `<= 480s`：1.30
- `481~840s`：1.00
- `841~1320s`：0.85
- `> 1320s`：0.70

## 3.2 失误系数 mistakeFactor（仅影响 money）

按“错误输入总次数（errorCount）”结算：
- 0 次：1.15（完美奖励）
- 1~2 次：1.00
- 3~5 次：0.90
- 6~9 次：0.78
- >=10 次：0.65

## 3.3 提示系数 hintFactor

若后续加入“提示格/自动填一格”：
- 0 次提示：1.10
- 1 次提示：0.95
- 2 次提示：0.82
- >=3 次提示：0.68

> 当前版本即使没有提示按钮，也建议预留字段，便于后续扩展。

## 3.4 连胜系数 streakFactor

连续“高质量完成”（hint=0 且 error<=2）累计：
- 连胜 1~2：1.00
- 连胜 3~4：1.05
- 连胜 5~7：1.10
- 连胜 8+：1.15（封顶）

中断条件：
- 失败、退出、重开当前局、或使用 >=2 次提示。

## 3.5 防刷系数 antiFarmFactor（同难度当日多次）

同一自然日内按每个难度独立计数：
- 第 1~3 局：1.00
- 第 4~6 局：0.85
- 第 7~10 局：0.70
- 第 11 局起：0.55

> 保证“玩得多仍有收益”，但难以无脑刷爆经济。

---

## 4. 惩罚机制（失败与中途退出）

## 4.1 失败判定建议

满足任一条件视为失败：
- 手动点击“认输/放弃”；
- 错误次数达到上限（建议 12 次）；
- 超过最大时长（例如 45 分钟）自动结束。

## 4.2 失败惩罚（软惩罚）

- money：`-8 / -12 / -18`（easy / medium / hard）
- experience：不扣，防止负反馈过强。
- streak：清零。
- 声望：默认不扣；若需要高压模式，可 hard 失败扣 1 点声望（可选）。

## 4.3 中途退出与重开

- **退出本局**：按失败处理（但首次退出可给 50% 惩罚豁免，新手友好）。
- **重开本局**：不立刻扣资源，但本局若最终完成，额外乘以 `restartPenaltyFactor = 0.85`。

---

## 5. 反作弊与鲁棒性

1. 结算时二次验证盘面确实等于标准解。
2. 时间按“开始到完成”的服务器/可信时钟（若纯前端则防本地篡改可弱化处理）。
3. 单局奖励设置上下限：
   - `minMoney = 8`
   - `maxMoney = 180`（避免活动叠加爆表）
4. 同一局不得重复结算（局 ID + 完成状态锁）。

---

## 6. 与现有系统对接建议

## 6.1 需要新增/复用的数据字段

建议在玩家状态中维护：
- `sudokuStats.dailyAttemptsByDifficulty`
- `sudokuStats.winStreak`
- `sudokuStats.bestTimeByDifficulty`
- `sudokuStats.todayCompleted`
- `sudokuStats.todayPerfectCompleted`

每局临时态：
- `startTimestamp`
- `errorCount`
- `hintUsed`
- `restartCount`
- `difficulty`

## 6.2 结算伪代码

```ts
const base = BASE_REWARD[difficulty];
const timeFactor = getTimeFactor(difficulty, usedSeconds);
const mistakeFactor = getMistakeFactor(errorCount);
const hintFactor = getHintFactor(hintUsed);
const streakFactor = getStreakFactor(winStreak);
const antiFarmFactor = getAntiFarmFactor(dailyAttemptsByDifficulty[difficulty]);
const restartPenaltyFactor = restartCount > 0 ? 0.85 : 1;

const finalMoney = clamp(
  Math.floor(base.money * timeFactor * mistakeFactor * hintFactor * streakFactor * antiFarmFactor * restartPenaltyFactor),
  8,
  180
);

const finalExp = clamp(
  Math.floor(base.exp * timeFactor * hintFactor * antiFarmFactor),
  4,
  90
);
```

---

## 7. 数值示例（便于策划校验）

- **示例 A（hard，高质量）**：
  - 420s，error=1，hint=0，连胜5，今日第2局
  - `95 × 1.30 × 1.00 × 1.10 × 1.10 × 1.00 ≈ 149`
  - 获得约 `149 money`，经验约 `54 exp`。

- **示例 B（easy，刷局）**：
  - 700s，error=8，hint=2，连胜0，今日第8局
  - `30 × 0.70 × 0.78 × 0.82 × 1 × 0.70 ≈ 9`
  - 仍有微量收益，但刷局效率明显降低。

- **示例 C（medium，失败）**：
  - error 到 12 次触发失败
  - 扣 `12 money`，连胜清零。

---

## 8. 上线节奏建议

### Phase 1（本周）
- 仅上线：基础奖励 + 时间系数 + 失误系数 + 失败软惩罚。

### Phase 2（次周）
- 增加：连胜系数 + 防刷系数 + 日志埋点（完成率、平均时长、奖励中位数）。

### Phase 3（活动期）
- 加入限时活动：
  - “数独周”hard 首胜额外 +30%；
  - 每日第1局保底奖励 +20%。

---

## 9. 建议默认配置（可直接落地）

如果你想快速上线一个“稳妥版本”，建议先用以下开关：

- 开启：基础奖励 / 时间系数 / 失误系数 / 失败软惩罚
- 关闭：提示系数（待提示功能实装）
- 开启：防刷系数（从第 4 局开始衰减）
- 开启：连胜（上限 1.10，先保守）

这样可以在不大改 UI 的前提下，先把经济闭环跑起来。
