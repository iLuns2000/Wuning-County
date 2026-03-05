import { DebuffConfig } from '@/types/game';

/**
 * 12 条 Debuff 配置表
 * 所有 id 唯一，每条至少 1 种可操作解除方式
 */
export const debuffConfigs: DebuffConfig[] = [
  // ─── 1. 商路阻塞（经济向）───────────────────────────────────
  {
    id: 'trade_blocked',
    name: '商路阻塞',
    description:
      '战火流言四起，行商不敢夜行，车队在关口排成长龙。码头货栈堆积如山，银钱却迟迟进不了城。',
    severity: 'moderate',
    trigger: {
      type: 'threshold',
      field: 'externalThreat.warRisk',
      direction: 'above',
      value: 60,
      consecutiveDays: 2,
      custom: (state) =>
        state.externalThreat.warRisk >= 60 &&
        !state.flags['defense_maintained_daily'],
    },
    duration: 3,
    effects: {
      economy: -2,
      facilityIncomeMultiplier: -0.15,
    },
    clearMethods: [
      {
        id: 'patrol_twice',
        label: '连续完成 2 次巡防',
        requiredFlag: 'trade_blocked_patrol_clear',
        autoCondition: (state) =>
          (state.flags['trade_blocked_patrol_count'] || 0) >= 2,
      },
      {
        id: 'clear_road_money',
        label: '花费 80 文"疏通商路"',
        moneyCost: 80,
      },
    ],
    stackRule: 'refresh',
    maxStacks: 1,
  },

  // ─── 2. 税负透支（经济/民生双向）─────────────────────────────
  {
    id: 'tax_overload',
    name: '税负透支',
    description:
      '账面繁荣背后，是商户抱怨"今日开张明日关门"，百姓私下议论"挣钱快，活路难"。',
    severity: 'moderate',
    trigger: {
      type: 'consecutive',
      consecutiveDays: 5,
      custom: (state) => {
        const ecoHistory = state.flags['economy_delta_5d'] || 0;
        const livHistory = state.flags['livelihood_delta_5d'] || 0;
        return ecoHistory > 12 && livHistory <= 2;
      },
    },
    duration: 4,
    effects: {
      economy: -1,
      livelihood: -1,
    },
    clearMethods: [
      {
        id: 'rest_policy_2d',
        label: '切换休养类政策并维持 2 天',
        autoCondition: (state) =>
          (state.flags['rest_policy_days'] || 0) >= 2,
      },
      {
        id: 'tax_rebate_money',
        label: '发放减税补贴（花费 120 文）',
        moneyCost: 120,
      },
    ],
    stackRule: 'none',
    maxStacks: 1,
  },

  // ─── 3. 工坊停摆（经济向）────────────────────────────────────
  {
    id: 'workshop_closed',
    name: '工坊停摆',
    description:
      '夜里盗案频发，白天作坊关门。匠人宁可在家守门，也不敢把货押去市集。',
    severity: 'moderate',
    trigger: {
      type: 'threshold',
      field: 'countyStats.order',
      direction: 'below',
      value: 35,
    },
    duration: -1, // 直到治安恢复
    effects: {
      economy: -2,
    },
    clearMethods: [
      {
        id: 'order_restore_auto',
        label: '治安恢复到 45 以上（自动解除）',
        autoCondition: (state) => state.countyStats.order >= 45,
      },
      {
        id: 'community_patrol_rep',
        label: '花费 30 声望"联防动员"立即解除',
        reputationCost: 30,
      },
    ],
    stackRule: 'none',
    maxStacks: 1,
  },

  // ─── 4. 商会恐慌（经济向，夜袭后续）─────────────────────────
  {
    id: 'merchant_panic',
    name: '商会恐慌',
    description:
      '夜袭后城门口贴满"暂不收货"的告示，票号收紧放贷，商会长老集体观望。',
    severity: 'severe',
    trigger: {
      type: 'raid',
      probability: 0.7,
    },
    duration: 2,
    effects: {
      economy: -1,
      immediateMoney: -6,  // 触发时一次性 -6（以文计，在 store 中乘以适当系数）
    },
    clearMethods: [
      {
        id: 'merchant_appease_money',
        label: '花钱"商会安抚金"（150 文）',
        moneyCost: 150,
      },
      {
        id: 'public_stability_rep',
        label: '花费 20 声望"公开稳定预期"',
        reputationCost: 20,
      },
    ],
    stackRule: 'stack',
    maxStacks: 2,
  },

  // ─── 5. 粮价飞涨（民生向）────────────────────────────────────
  {
    id: 'grain_price_surge',
    name: '粮价飞涨',
    description:
      '米铺门前天未亮就排起长队，锅灶升烟变少，街坊互相打听哪里还能买到平价粮。',
    severity: 'moderate',
    trigger: {
      type: 'threshold',
      field: 'countyStats.economy',
      direction: 'below',
      value: 45,
      custom: (state) =>
        state.disasterState.active && state.countyStats.economy < 45,
    },
    duration: 3,
    effects: {
      livelihood: -2,
    },
    clearMethods: [
      {
        id: 'disaster_relief_money',
        label: '执行赈济（花费 100 文）',
        moneyCost: 100,
      },
      {
        id: 'rescue_event_auto',
        label: '触发"救援成功"类事件自动解除',
        autoCondition: (state) =>
          !!(state.flags['disaster_relief_success']),
      },
    ],
    stackRule: 'none',
    maxStacks: 1,
  },

  // ─── 6. 徭役积怨（民生向）────────────────────────────────────
  {
    id: 'corvee_resentment',
    name: '徭役积怨',
    description:
      '工地灯火通明，村巷却怨声渐起。青壮年被反复征调，田里老人和孩童扛起农活。',
    severity: 'moderate',
    trigger: {
      type: 'consecutive',
      consecutiveDays: 3,
      custom: (state) =>
        (state.flags['heavy_construction_days'] || 0) >= 3 &&
        !state.flags['rest_policy_days'],
    },
    duration: 2,
    effects: {
      livelihood: -1,
      immediateLivelihood: -3, // 首次触发立即 -3
    },
    clearMethods: [
      {
        id: 'stop_corvee',
        label: '执行"停役一日"（花费 40 文）',
        moneyCost: 40,
      },
      {
        id: 'labor_subsidy_money',
        label: '发放劳补降低 1 层（花费 60 文）',
        moneyCost: 60,
      },
    ],
    stackRule: 'stack',
    maxStacks: 2,
  },

  // ─── 7. 安置压力（民生/治安双向）────────────────────────────
  {
    id: 'settlement_pressure',
    name: '安置压力',
    description:
      '夜袭过后，城隍庙与驿馆挤满流离百姓。临时安置点嘈杂拥挤，小冲突不断。',
    severity: 'minor',
    trigger: {
      type: 'raid',
      probability: 1.0, // 夜袭后必触发
    },
    duration: 2,
    effects: {
      livelihood: -1,
      order: -1,
    },
    clearMethods: [
      {
        id: 'patrol_or_relief',
        label: '完成一次巡防或赈济自动解除',
        autoCondition: (state) =>
          !!(state.flags['patrol_done_today'] || state.flags['relief_done_today']),
      },
      {
        id: 'emergency_settlement_money',
        label: '花钱"紧急安置"（80 文）',
        moneyCost: 80,
      },
    ],
    stackRule: 'none',
    maxStacks: 1,
  },

  // ─── 8. 医馆挤兑（民生向 + 财政压力）──────────────────────
  {
    id: 'clinic_overload',
    name: '医馆挤兑',
    description:
      '医馆外药香与哭声混在一起，郎中连夜出诊。药价抬升后，不少人只能"先忍一忍"。',
    severity: 'moderate',
    trigger: {
      type: 'consecutive',
      consecutiveDays: 3,
      custom: (state) =>
        (state.flags['health_negative_event_days'] || 0) >= 2,
    },
    duration: 3,
    effects: {
      livelihood: -2,
      money: -10,
    },
    clearMethods: [
      {
        id: 'medical_fund_money',
        label: '一次性拨付"医疗专项银"（200 文）',
        moneyCost: 200,
      },
      {
        id: 'renowned_doctor_event',
        label: '触发"名医坐诊"正向事件自动解除',
        autoCondition: (state) =>
          !!(state.flags['renowned_doctor_visited']),
      },
    ],
    stackRule: 'none',
    maxStacks: 1,
  },

  // ─── 9. 学宫失修（文化向）────────────────────────────────────
  // {
  //   id: 'academy_neglect',
  //   name: '学宫失修',
  //   description:
  //     '学宫檐角漏雨，讲席蒙尘，童生三三两两散去。街头说书替代了学堂晨读。',
  //   severity: 'minor',
  //   trigger: {
  //     type: 'consecutive',
  //     consecutiveDays: 4,
  //     custom: (state) =>
  //       (state.flags['culture_invest_days'] || 0) === 0 &&
  //       state.countyStats.culture < 75,
  //   },
  //   duration: -1, // 直到进行文教修缮
  //   effects: {
  //     culture: -1,
  //   },
  //   clearMethods: [
  //     {
  //       id: 'academy_repair_money',
  //       label: '执行"学宫修缮"（花费 100 文）',
  //       moneyCost: 100,
  //     },
  //     {
  //       id: 'cultural_festival',
  //       label: '举办文会（花费 40 声望）',
  //       reputationCost: 40,
  //     },
  //   ],
  //   stackRule: 'none',
  //   maxStacks: 1,
  // },

  // ─── 10. 科场舞弊风波（文化重创）────────────────────────────
  // {
  //   id: 'exam_scandal',
  //   name: '科场舞弊风波',
  //   description:
  //     '榜单一出，茶楼巷口尽是质疑。读书人愤而撕榜，士绅联名上书，县学威望一夜跌落。',
  //   severity: 'severe',
  //   trigger: {
  //     type: 'event',
  //     custom: (state) => !!(state.flags['exam_scandal_triggered']),
  //   },
  //   duration: 2,
  //   effects: {
  //     culture: -1,
  //     immediateCulture: -6,
  //     immediateReputation: -4,
  //   },
  //   clearMethods: [
  //     {
  //       id: 'investigate_rep',
  //       label: '公开查案（花费 50 声望）',
  //       reputationCost: 50,
  //     },
  //     {
  //       id: 'reopen_exam_money',
  //       label: '重开科试（花费 180 文）',
  //       moneyCost: 180,
  //     },
  //   ],
  //   stackRule: 'none',
  //   maxStacks: 1,
  // },

  // ─── 11. 市井粗俗化（文化慢性流失）──────────────────────────
  // {
  //   id: 'culture_vulgarization',
  //   name: '市井粗俗化',
  //   description:
  //     '街市越发喧腾，快钱玩法盛行。热闹是热闹了，读书风气却被不断挤压。',
  //   severity: 'minor',
  //   trigger: {
  //     type: 'consecutive',
  //     consecutiveDays: 3,
  //     custom: (state) =>
  //       (state.flags['entertainment_windfall_days'] || 0) >= 2 &&
  //       (state.flags['culture_invest_days'] || 0) === 0,
  //   },
  //   duration: 3,
  //   effects: {
  //     culture: -2,
  //     economy: 1, // 短期甜头
  //   },
  //   clearMethods: [
  //     {
  //       id: 'cultural_festival_rep',
  //       label: '举办文会（花费 40 声望）',
  //       reputationCost: 40,
  //     },
  //     {
  //       id: 'academy_subsidy_money',
  //       label: '学宫补贴（花费 80 文）',
  //       moneyCost: 80,
  //     },
  //   ],
  //   stackRule: 'none',
  //   maxStacks: 1,
  // },

  // ─── 12. 人才外流（文化核心惩罚）────────────────────────────
  // {
  //   id: 'talent_exodus',
  //   name: '人才外流',
  //   description:
  //     '教谕、匠师、账房先生纷纷"另谋高就"，留下的是空席与未完的教案、账册和工图。',
  //   severity: 'severe',
  //   trigger: {
  //     type: 'consecutive',
  //     consecutiveDays: 3,
  //     custom: (state) => {
  //       const lowEco = state.countyStats.economy < 35;
  //       const lowLiv = state.countyStats.livelihood < 35;
  //       const lowCulture = state.countyStats.culture < 45;
  //       return (lowEco || lowLiv) && lowCulture;
  //     },
  //   },
  //   duration: 4,
  //   effects: {
  //     culture: -2,
  //     cultureGainMultiplier: -0.2,
  //   },
  //   clearMethods: [
  //     {
  //       id: 'recovery_auto',
  //       label: '经济或民生恢复到 45+ 并保持 2 天（自动解除）',
  //       autoCondition: (state) =>
  //         (state.countyStats.economy >= 45 || state.countyStats.livelihood >= 45) &&
  //         (state.flags['recovery_days'] || 0) >= 2,
  //     },
  //     {
  //       id: 'talent_retention_plan',
  //       label: '"人才挽留计划"（150 文 + 25 声望）',
  //       moneyCost: 150,
  //       reputationCost: 25,
  //     },
  //   ],
  //   stackRule: 'none',
  //   maxStacks: 1,
  // },
];

/** 按 id 快速查找配置 */
export const getDebuffConfig = (id: string): DebuffConfig | undefined =>
  debuffConfigs.find((d) => d.id === id);
