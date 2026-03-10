# 《无宁县志》进阶方案文档
## 主题：三身份专属主线 + 多结局系统（含数值方案与游戏说明补充）

## 1. 设计目标

### 1.1 核心目标
- 把现有“日常循环 + 系统模块”升级为“有中后期驱动的长期目标”。
- 强化三身份差异，让每个身份在中后期有明显不同的策略路线。
- 完成“更多角色结局设计”这个既定规划项。

### 1.2 设计原则
1. **复用现有系统，不重写引擎**  
   主线章回通过“事件触发 + 条件判定 + flags 推进”实现，沿用现有事件/状态模式。
2. **短章回，高反馈**  
   每章 2~3 个关键抉择，不做超长分支树，避免内容爆炸。
3. **数值可控，可回放调参**  
   所有核心奖励和代价做成统一结构，方便后续平衡。

---

## 2. 系统总览

### 2.1 主线结构
- 三个身份，各自 3 章（共 9 章）
- 每章包含：
  - 1 个触发条件
  - 1~2 个关键事件
  - 1 个章回结算
- 章回推进由 `mainStoryProgress[role]` 控制（0~3）

### 2.2 结局结构
结局由四维评分组成（总分 0~400）：
1. 县城治理（民生/治安/经济/文化）
2. 战火稳定（外部威胁、边防维护表现）
3. 人际与声望（关键 NPC、总声望）
4. 个人根基（金钱/产业/武学/阅历）

最终按身份取不同权重计算，映射到 S/A/B/C/D 结局阶。

---

## 3. 数据结构草案（可直接转 TS）

```ts
type StoryRole = 'magistrate' | 'merchant' | 'warrior';

type StoryChapterId =
  | 'magistrate_ch1' | 'magistrate_ch2' | 'magistrate_ch3'
  | 'merchant_ch1' | 'merchant_ch2' | 'merchant_ch3'
  | 'warrior_ch1' | 'warrior_ch2' | 'warrior_ch3';

interface StoryTrigger {
  minDay?: number;
  maxDay?: number;
  minReputation?: number;
  minMoney?: number;
  minHealth?: number;
  countyStatMin?: Partial<{
    economy: number;
    security: number;
    livelihood: number;
    culture: number;
  }>;
  npcRelationMin?: Record<string, number>;
  flagsRequired?: string[];
  flagsForbidden?: string[];
}

interface StoryChoiceEffect {
  money?: number;
  reputation?: number;
  health?: number;
  ability?: number;
  experience?: number;
  countyStats?: Partial<{
    economy: number;
    security: number;
    livelihood: number;
    culture: number;
  }>;
  relationChange?: Record<string, number>;
  externalThreat?: number;
  flagsSet?: Record<string, boolean>;
  flagsIncrement?: string[];
}

interface StoryChoice {
  id: string;
  label: string;
  description: string;
  effect: StoryChoiceEffect;
  riskTag?: 'stable' | 'balanced' | 'risky';
}

interface StoryNode {
  id: string;
  title: string;
  description: string;
  trigger?: StoryTrigger;
  choices: StoryChoice[];
  onComplete?: {
    nextNodeId?: string;
    chapterProgressAdd?: number;
  };
}

interface EndingRule {
  id: string;
  role: StoryRole;
  minScore: number;
  name: string;
  summary: string;
  reward?: StoryChoiceEffect;
}
```

---

## 4. 三身份章回设计（玩法层）

### 4.1 县丞线：《县印风云》
定位：治理与权衡（政策、治安、战火联动）。

#### CH1「赋税与民情」
- 触发：Day ≥ 20，声望 ≥ 220
- 核心冲突：财政吃紧，民怨上升
- 三选一：
  1. 轻税稳民（民生+，经济-）
  2. 严税补库（经济++，民生--）
  3. 联商筹款（经济+，需商人 NPC 关系 ≥ 30）

#### CH2「匪患夜报」
- 触发：CH1 完成且战火风险升高
- 三选一：
  1. 扩编乡勇（钱-，治安++）
  2. 悬赏缉匪（钱--，声望+，有随机失败）
  3. 暗中招安（民生+，治安波动）

#### CH3「三线抉择」
- 触发：Day ≥ 120，CH2 完成
- 终局决策：
  1. 重边防（安全优先）
  2. 重民生（发展优先）
  3. 重通商（经济优先，风险更高）

### 4.2 商人线：《商路沉浮》
定位：资本增长 + 风险控制（市场/产业/NPC 合作）。

#### CH1「货栈并购」
- 触发：Day ≥ 15，金钱 ≥ 1200
- 三选一：
  1. 稳健并购（收益稳定）
  2. 杠杆扩张（收益高，破产风险高）
  3. 合伙入股（收益中，需 NPC 好感）

#### CH2「商会之争」
- 触发：CH1 完成，经济波动显著
- 三选一：
  1. 价格战（短期利润+，声望-）
  2. 品牌战（长期利润+，前期投入高）
  3. 公益牌（利润中，声望++）

#### CH3「南北大单」
- 触发：Day ≥ 100，CH2 完成
- 三选一：
  1. 押注北线（高利润，高战火风险）
  2. 南线保守（低利润，稳定）
  3. 双线分仓（中利润，管理复杂）

### 4.3 少侠线：《江湖与城门》
定位：武学成长 + 责任抉择（武学、名望、守城）。

#### CH1「师门旧约」
- 触发：Day ≥ 18，武学值达到阈值
- 三选一：
  1. 闭关苦修（武学++，社交-）
  2. 行侠积名（声望+，武学+）
  3. 护商走镖（金钱+，有受伤风险）

#### CH2「门派与官府」
- 触发：CH1 完成，声望达到阈值
- 三选一：
  1. 倾向官府（治安+，江湖关系-）
  2. 倾向江湖（NPC 关系+，官府信任-）
  3. 两边调停（难度高，收益上限高）

#### CH3「城门夜战」
- 触发：Day ≥ 110，CH2 完成，战火中高
- 三选一：
  1. 亲战前线（高风险高回报）
  2. 策略指挥（中风险稳定）
  3. 断后掩民（民生+，个人损耗高）

---

## 5. 结局评分与数值公式

### 5.1 四维评分（每项 0~100）

#### A. 治理分 `GovScore`
```
GovScore = clamp(
  0.30*economy + 0.30*security + 0.25*livelihood + 0.15*culture,
  0, 100
)
```

#### B. 战火分 `WarScore`
```
WarScore = clamp(
  100 - externalThreat*0.8 + defenseMaintenanceBonus,
  0, 100
)
```
- `defenseMaintenanceBonus` 建议范围 [0, 20]，依据近 30 天边防维护频次/成功率。

#### C. 人际声望分 `SocialScore`
```
SocialScore = clamp(
  0.55*normalize(reputation) + 0.45*keyNpcAvgRelation,
  0, 100
)
```
- `normalize(reputation)`：声望 0~2000 映射到 0~100。

#### D. 个人根基分 `PersonalScore`
```
PersonalScore = clamp(
  0.40*normalize(money) + 0.30*normalize(assetIncome) + 0.30*normalize(coreAbility),
  0, 100
)
```

### 5.2 身份权重（总分 0~400）

#### 县丞
- Gov 35%
- War 30%
- Social 25%
- Personal 10%

#### 商人
- Gov 15%
- War 20%
- Social 20%
- Personal 45%

#### 少侠
- Gov 15%
- War 35%
- Social 20%
- Personal 30%

### 5.3 评级阈值（统一）
- S：≥ 320
- A：280 ~ 319
- B：230 ~ 279
- C：180 ~ 229
- D：< 180

---

## 6. 章回奖励/惩罚数值模板

### 6.1 单次关键抉择建议振幅
- 金钱：±80 ~ ±500（中后期可到 ±1200）
- 声望：±3 ~ ±25
- 体力/健康：±5 ~ ±25
- 县城属性：±1 ~ ±8
- 外部威胁：±2 ~ ±12
- NPC 关系：±3 ~ ±20

### 6.2 每章结算奖励（推荐）
- CH1：阅历 +30 / 声望 +10 / 标记 flag
- CH2：阅历 +45 / 声望 +15 / 解锁终章前置
- CH3：阅历 +80 / 声望 +30 / 解锁结局判定

### 6.3 风险分层
- 稳健选项：收益中，负面最小
- 平衡选项：收益中高，有条件门槛
- 激进选项：收益上限最高，附带明显失败代价

---

## 7. 与现有系统结合的“游戏说明补充”（可放 README）

建议新增章节：**📖 身份主线与结局系统（新增）**

示例说明文案：

> 从第 20 天起，你将逐步触发对应身份的三章主线。  
> 主线中的关键抉择会持续影响县城四维（治理、战火、人际、根基）。  
> 最终结局不再只看单项数值，而由多维评分综合决定。  
> 每种身份都有独立权重与专属结局名称，鼓励多周目体验。

并说明其与现有模块联动：
- 政令系统：影响治理分与战火分。
- NPC 交互：影响人际分与主线条件。
- 经济与产业：影响个人根基分。
- 天气/季节/随机事件：改变节点难度与收益。

---

## 8. 平衡建议（防止单策略通吃）

1. **通胀抑制**：金钱超过阈值后，提高部分行动成本（雇工、维护、护卫）。
2. **防爆表回拉**：单日声望增长超过阈值时，次日“名高招忌”类事件概率上升。
3. **结局防刷分**：终章前 30 天某项分数暴涨，仅计入 70%。
4. **失败也有内容**：C/D 结局也给专属文本与小奖励，降低挫败感。

---

## 9. 实施优先级（建议排期）

- 阶段 1（1~2 天）：定义主线数据结构 + 9 章节点草稿
- 阶段 2（2~3 天）：接入触发与章回推进（flags/progress）
- 阶段 3（1 天）：接入结局评分器与结局展示页
- 阶段 4（持续）：补文本、调数值、加隐藏结局

---

## 10. 一页总结

- **做什么**：三身份各 3 章主线 + 多结局评分系统。
- **为什么**：强化中后期目标、提升重玩率、命中既有待办。
- **怎么做**：复用事件机制 + 条件触发 + flags 推进 + 四维评分。
- **成本收益**：开发成本中等，玩家体感收益高。
