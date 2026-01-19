import { GameEvent } from '@/types/game';

export const randomEvents: GameEvent[] = [
  // Daily Events
  {
    id: 'daily_market',
    title: '县城集市',
    description: '县城集市开张，各种商品琳琅满目。',
    type: 'daily',
    triggerCondition: { probability: 1.0 }, // simplified
    options: [
      {
        label: '前往集市',
        message: '你逛了逛集市，买了一些生活用品。',
        effect: { money: -10, health: 5, livelihood: 2 } // inferred effects
      },
      {
        label: '沉迷玩乐',
        message: '你在集市上沉迷于杂耍表演，荒废了时光。',
        effect: { money: -20, ability: -1 } // Decrease ability
      }
    ]
  },
  {
    id: 'daily_weather',
    title: '天气变化',
    description: '天气突然变化，似乎要下雨了。',
    type: 'daily',
    triggerCondition: { probability: 1.0 },
    options: [
      {
        label: '带伞出行',
        message: '你带了伞，虽然有些不便，但没有淋湿。',
        effect: { ability: 1 }
      },
      {
        label: '偷懒睡觉',
        message: '你觉得下雨天正好睡觉，什么也没做。',
        effect: { ability: -1, health: 5 } // Decrease ability, gain health
      }
    ]
  },
  {
    id: 'daily_festival',
    title: '节日庆典',
    description: '县城举办节日庆典，到处张灯结彩。',
    type: 'daily',
    triggerCondition: { probability: 0.1 }, // Monthly approx
    options: [
      {
        label: '参与庆典',
        message: '你参与了庆典活动，心情非常愉快。',
        effect: { money: -20, reputation: 10, culture: 5 }
      },
      {
        label: '旁观',
        message: '你只是远远地看着热闹的人群。',
      }
    ]
  },
  // Opportunity Events
  {
    id: 'opp_business',
    title: '商机出现',
    description: '市场上出现了一批紧俏的货物。',
    type: 'opportunity',
    triggerCondition: { probability: 0.2 }, // Weekly approx
    options: [
      {
        label: '投资',
        message: '你果断买入，转手赚了一笔。',
        effect: { money: 50, economy: 5 }
      },
      {
        label: '观望',
        message: '你觉得风险太大，错过了这次机会。',
      }
    ]
  },
  {
    id: 'opp_noble',
    title: '贵人相助',
    description: '你在茶馆遇到一位谈吐不凡的长者。',
    type: 'opportunity',
    triggerCondition: { probability: 0.05 },
    options: [
      {
        label: '结交',
        message: '长者对你颇为赏识，给予了你一些指点。',
        effect: { reputation: 20, ability: 10 }
      },
      {
        label: '礼貌拒绝',
        message: '你礼貌地拒绝了深交，长者遗憾离去。',
      }
    ]
  },
  {
    id: 'opp_treasure',
    title: '宝藏发现',
    description: '传闻城郊的古庙里藏有宝物。',
    type: 'opportunity',
    triggerCondition: { probability: 0.02 },
    options: [
      {
        label: '去寻宝',
        message: '你费了一番周折，找到了一些古董。',
        effect: { money: 100, health: -10 }
      },
      {
        label: '不信传言',
        message: '你觉得那是骗人的，没有理会。',
      }
    ]
  },
  // Challenge Events
  {
    id: 'chal_thief',
    title: '小偷出现',
    description: '你在街上走着，突然发现钱包不见了。',
    type: 'challenge',
    triggerCondition: { probability: 0.15 },
    options: [
      {
        label: '追捕',
        message: '你奋力追赶，终于抓住了小偷。',
        effect: { reputation: 10, health: -5, order: 2 }
      },
      {
        label: '自认倒霉',
        message: '你叹了口气，损失了一些钱财。',
        effect: { money: -30 }
      }
    ]
  },
  {
    id: 'chal_bandit',
    title: '强盗来袭',
    description: '一伙强盗在城外叫嚣，威胁县城安全。',
    type: 'challenge',
    triggerCondition: { probability: 0.05 },
    options: [
      {
        label: '组织抵抗',
        message: '你组织民兵击退了强盗，保卫了县城。',
        effect: { reputation: 50, order: 10, health: -20 }
      },
      {
        label: '加强防御',
        message: '你下令紧闭城门，强盗最终退去。',
        effect: { order: 5, economy: -5 }
      }
    ]
  },
  {
    id: 'chal_disaster',
    title: '自然灾害',
    description: '连日暴雨，河水暴涨，可能会有洪涝。',
    type: 'challenge',
    triggerCondition: { probability: 0.02 },
    options: [
      {
        label: '组织救援',
        message: '你亲临一线指挥抗洪，损失降到了最低。',
        effect: { reputation: 30, livelihood: 5, money: -50, health: -10 }
      },
      {
        label: '祈祷',
        message: '你只能祈祷上苍保佑，县城受损严重。',
        effect: { livelihood: -20, economy: -10 }
      }
    ]
  },
  // Role Specific Events
  // Merchant: New Branch
  {
    id: 'role_merchant_branch',
    title: '开设分店',
    description: '你在城南发现了一个绝佳的铺面，非常适合开设新的分店。',
    type: 'opportunity',
    triggerCondition: { probability: 0.1, requiredRole: 'merchant' },
    options: [
      {
        label: '投资开店',
        message: '你投入重金开设了分店，生意兴隆，县城经济也因此受益。',
        effect: { money: -200, economy: 10 } // Merchant passive makes earning back easier
      },
      {
        label: '暂时观望',
        message: '你觉得时机未到，放弃了这个机会。',
      }
    ]
  },
  // Magistrate: Urban Planning
  {
    id: 'role_magistrate_plan',
    title: '县城规划',
    description: '新的一季度开始了，县城需要确定未来的发展方向。',
    type: 'daily',
    triggerCondition: { probability: 0.1, requiredRole: 'magistrate' },
    options: [
      {
        label: '大力发展商业',
        message: '你颁布了惠商政策，商贾云集，经济繁荣。',
        effect: { economy: 10, reputation: 5 }
      },
      {
        label: '加强治安管理',
        message: '你整顿了捕快队伍，严打犯罪，治安显著好转。',
        effect: { order: 10, reputation: 5 }
      },
      {
        label: '改善民生福利',
        message: '你修缮了公共设施，百姓安居乐业。',
        effect: { livelihood: 10, reputation: 10 }
      }
    ]
  },
  // Hero: Bounty
  {
    id: 'role_hero_bounty',
    title: '江湖悬赏令',
    description: '官府发布了悬赏令，通缉一名流窜至此的江洋大盗。',
    type: 'challenge',
    triggerCondition: { probability: 0.1, requiredRole: 'hero' },
    options: [
      {
        label: '揭榜缉凶',
        message: '你历经一番苦战，终于将大盗缉拿归案。',
        effect: { reputation: 30, money: 100, health: -30, order: 5 }
      },
      {
        label: '不惹麻烦',
        message: '你决定不去招惹这个亡命之徒。',
      }
    ]
  },
  // High Level Hero Event
  {
    id: 'role_hero_elite_challenge',
    title: '武林大会',
    description: '五年一度的武林大会召开了，各路高手云集。以你现在的武学修为，完全有资格去争夺盟主之位。',
    type: 'opportunity',
    triggerCondition: { probability: 0.2, requiredRole: 'hero', minAbility: 60 },
    options: [
      {
        label: '参加大会',
        message: '你在大会上力挫群雄，技惊四座，被推举为武林盟主！',
        effect: { reputation: 200, money: 500, health: -50, ability: 10 }
      },
      {
        label: '旁观',
        message: '你选择低调旁观，但也从高手的对决中领悟了不少。',
        effect: { ability: 5 }
      }
    ]
  }
];

export const npcEvents: GameEvent[] = [
  // Lou Xianling
  {
    id: 'lou_discuss',
    title: '政务讨论',
    description: '楼县令邀请你前往县衙讨论政务。',
    type: 'npc',
    triggerCondition: { minReputation: 500 },
    options: [
      { label: '接受邀请', message: '你们深入探讨了治县方略，受益匪浅。', effect: { reputation: 20, ability: 5, order: 5 } },
      { label: '婉拒', message: '你推脱身体不适，没有前往。' }
    ]
  },
  {
    id: 'lou_patrol',
    title: '县城巡视',
    description: '楼县令准备微服私访，邀你同行。',
    type: 'npc',
    triggerCondition: { minReputation: 300 },
    options: [
      { label: '同行', message: '你们走访了街头巷尾，了解了民生疾苦。', effect: { reputation: 15, livelihood: 5 } },
      { label: '不去', message: '你错过了这次接近县令的机会。' }
    ]
  },
  {
    id: 'lou_reward',
    title: '县令嘉奖',
    description: '鉴于你的贡献，楼县令决定公开嘉奖你。',
    type: 'npc',
    triggerCondition: { minReputation: 700 },
    options: [
      { label: '接受嘉奖', message: '你在全县百姓面前接受了表彰，声望大增。', effect: { money: 200, reputation: 100 } },
      { label: '谦辞', message: '你谦虚地推辞了，大家反而更加敬重你。', effect: { reputation: 120 } }
    ]
  },
  
];
