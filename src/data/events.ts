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
  },
  // Chicken Theft Case Events
  {
    id: 'chicken_theft_dispute',
    title: '偷鸡疑云',
    description: '集市上，老张拉着老李吵得不可开交，引来许多百姓围观。老张声称老李偷了他家的下蛋母鸡，老李则矢口否认。',
    type: 'npc',
    triggerCondition: { 
      probability: 0.3, 
      custom: (state) => !state.flags['chicken_case_started'] && !state.flags['chicken_case_solved_success'] && !state.flags['chicken_case_failed']
    },
    options: [
      {
        label: '协助县令调查',
        message: '你决定协助县令调查此事。老张和老李见有人出面，连忙拉着你评理。',
        effect: { 
          flagsSet: { chicken_case_started: true, chicken_stage: 1 },
          reputation: 5
        }
      },
      {
        label: '无视',
        message: '你觉得这只是邻里小事，摇了摇头离开了。',
        effect: { 
          flagsSet: { chicken_case_ignored: true },
          reputation: -5
        }
      }
    ]
  },
  {
    id: 'chicken_theft_investigate',
    title: '案件调查',
    description: '受县令所托，你需要收集更多线索，以便协助县令断案。',
    type: 'npc',
    triggerCondition: { 
      // Always available if stage is 1, essentially forcing this to be a high priority if picked, 
      // but since we rely on random selection, probability 1.0 makes it likely to appear.
      probability: 1.0,
      custom: (state) => state.flags['chicken_stage'] === 1
    },
    options: [
      {
        label: '询问老张',
        message: '老张激动地说：“少侠/掌柜的！昨天我家院墙上有搭梯子的痕迹，今早我看到老李鞋底有和我家后院一样的淤泥！肯定是他！”',
        effect: { flagsSet: { chicken_clue_zhang: true } }
      },
      {
        label: '询问老李',
        message: '老李一脸委屈：“您明鉴啊！我昨晚早早就睡了，大门紧闭根本没出门。那鞋底的淤泥……是我今早去村口池塘打水沾上的！”',
        effect: { flagsSet: { chicken_clue_li: true } }
      },
      {
        label: '查看现场',
        message: '你仔细查看了现场，发现院墙确实有攀爬痕迹。在墙角的草丛里，你发现了一根遗落的麻绳，上面粘着鸡毛。这麻绳编制手法独特，像是老李编竹筐常用的那种。',
        effect: { flagsSet: { chicken_clue_scene: true } }
      },
      {
        label: '向县令禀报',
        message: '经过一番调查，你心里已经有了底，决定向县令禀报调查结果。',
        effect: { flagsSet: { chicken_stage: 2 } }
      }
    ]
  },
  {
    id: 'chicken_theft_verdict',
    title: '协助断案',
    description: '公堂之上，县令正在审问老张和老李。县令转头看向你：“对于此案，你有何高见？”',
    type: 'npc',
    triggerCondition: { 
      probability: 1.0,
      custom: (state) => state.flags['chicken_stage'] === 2
    },
    options: [
      {
        label: '建议定老李的罪',
        message: '你向县令呈上证据：“大人，那麻绳正是老李编竹筐所用，且上面粘有鸡毛。”县令听后一拍惊堂木，老李见证据确凿，瘫倒在地承认了事实。案情大白，县令对你赞赏有加。',
        effect: { 
          flagsSet: { chicken_case_solved_success: true, chicken_stage: 3 }, 
          reputation: 50,
          money: 20, // Reward
          relationChange: { lao_zhang: 20, lao_li: -10 }
        }
      },
      {
        label: '建议定老张诬告',
        message: '你认为证据不足，建议县令惩戒老张。然而数日后，有人看见老李在偷偷吃鸡……你这才知道建议错了，不仅让县令断了错案，自己也成了笑柄。',
        effect: { 
          flagsSet: { chicken_case_failed: true, chicken_stage: 3 }, 
          reputation: -30,
          relationChange: { lao_zhang: -30, lao_li: 10 }
        }
      },
      {
        label: '建议证据不足',
        message: '你建议县令因证据不足暂时退堂。案子成了悬案，县令叹了口气，百姓也对你的能力颇有微词。',
        effect: { 
          flagsSet: { chicken_stage: 3 },
          reputation: -10
        }
      }
    ]
  },
  // Umbrella Sale Event
  {
    id: 'rainy_day_umbrella',
    title: '雨中叫卖',
    description: '今天阴雨连绵，街边有个小贩正在叫卖二手的油纸伞。',
    type: 'npc',
    triggerCondition: {
      probability: 1,
      custom: (state) => {
        const isRainy = state.weather === 'rain_light' || state.weather === 'rain_heavy';
        const hasMoney = state.playerStats.money >= 50;
        const hasUmbrella = state.inventory.includes('oil_paper_umbrella');
        return isRainy && hasMoney && !hasUmbrella;
      }
    },
    options: [
      {
        label: '购买油纸伞 (50文)',
        message: '你花50文买下了这把旧伞。细细观察时，发现伞柄上刻着“临安制造”四个字。',
        effect: {
          money: -50,
          itemsAdd: ['oil_paper_umbrella']
        }
      },
      {
        label: '不需要',
        message: '你觉得淋点雨也无妨，便匆匆走过了。',
      }
    ]
  },
  // New Restaurant Event
  {
    id: 'new_restaurant_opening',
    title: '新酒楼开张',
    description: '由于无宁县经商环境良好治安稳定，有外地商人闻名而来开了一个新酒楼。这个酒楼据说天南地北的菜都会做，门口一位店小二嘴皮十分利索，见人便喊：“客官里面请几位，请上座好茶来奉陪！”',
    type: 'random',
    triggerCondition: {
      probability: 1.0, // Always triggers if condition met (handled by custom logic below, usually achievement unlocks are instant, but events need trigger)
                        // Actually, achievements are checked automatically. This event is for flavor/narrative.
                        // We can make it trigger once when stats are high.
      custom: (state) => {
        // Trigger if stats are high AND event hasn't happened yet
        return state.countyStats.economy > 80 && 
               state.countyStats.order > 80 && 
               !state.flags['new_restaurant_event_shown'];
      }
    },
    options: [
      {
        label: '进店看看',
        message: '你走进酒楼，果然宾客满座，热闹非凡。店小二热情地招呼你入座。',
        effect: {
          reputation: 10,
          flagsSet: { new_restaurant_event_shown: true }
        }
      },
      {
        label: '路过',
        message: '你看着热闹的酒楼，欣慰地点了点头，继续巡视。',
        effect: {
          flagsSet: { new_restaurant_event_shown: true }
        }
      }
    ]
  },
  // First Heavy Snow Event
  {
    id: 'first_heavy_snow',
    title: '大雪封山',
    description: '今天是你遇到的第一个大雪天，雪势过大无法出门。你在宅子里看着窗外大雪满山，路上也一片死寂。',
    type: 'random', // Using random but high probability logic handles it
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        return state.weather === 'snow_heavy' && !state.flags['first_heavy_snow_encountered'];
      }
    },
    options: [
      {
        label: '静观雪景',
        message: '你静静地看着窗外，感受着这份天地间的寂静。',
        effect: {
           flagsSet: { first_heavy_snow_encountered: true },
           // We don't need to force achievement unlock here if we use the flag condition in achievements.ts
           // But to be safe and provide immediate feedback:
           // Actually achievements checks are run after events in gameStore.
        }
      }
    ]
  }
];

export const npcEvents: GameEvent[] = [
  {
    id: 'npc_lou_invite',
    title: '县令邀请',
    description: '楼县令邀请你到府上一叙。',
    type: 'npc',
    triggerCondition: { minReputation: 100, probability: 0.1 },
    options: [
      {
        label: '欣然前往',
        message: '你与楼县令相谈甚欢，他对你的见解颇为赞赏。',
        effect: { reputation: 20, ability: 5, relationChange: { lou_xianling: 10 } }
      },
      {
        label: '婉言谢绝',
        message: '你推脱身体不适，楼县令表示遗憾。',
        effect: { reputation: -5, relationChange: { lou_xianling: -5 } }
      }
    ]
  },
  {
    id: 'npc_lao_li_bamboo',
    title: '竹编新品',
    description: '老李新编了一批精巧的竹篮，正愁怎么卖个好价钱。',
    type: 'npc',
    triggerCondition: { probability: 0.1 },
    options: [
      {
        label: '帮忙推销',
        message: '你凭借三寸不烂之舌帮老李卖了个好价钱，老李笑得合不拢嘴。',
        effect: { money: 10, reputation: 5, relationChange: { lao_li: 15, lao_zhang: -5 } } // 老张嫉妒
      },
      {
        label: '自己买下',
        message: '你自掏腰包买下了竹篮，老李感激涕零。',
        effect: { money: -20, relationChange: { lao_li: 20 } }
      },
      {
        label: '嘲讽两句',
        message: '你嘲笑这竹篮样式过时，老李气得吹胡子瞪眼。',
        effect: { relationChange: { lao_li: -20, lao_zhang: 10 } } // 老张幸灾乐祸
      }
    ]
  },
  {
    id: 'npc_lao_zhang_harvest',
    title: '丰收喜悦',
    description: '今年风调雨顺，老张家的庄稼大丰收，但他正发愁收割不及。',
    type: 'npc',
    triggerCondition: { probability: 0.1 },
    options: [
      {
        label: '下地帮忙',
        message: '你卷起裤腿下地帮忙，累得腰酸背痛，但老张非要送你一袋新米。',
        effect: { health: -10, money: 5, relationChange: { lao_zhang: 20 } }
      },
      {
        label: '雇人相助',
        message: '你出钱帮老张雇了几个短工，老张感动得直抹眼泪。',
        effect: { money: -15, reputation: 10, relationChange: { lao_zhang: 25, lao_li: -5 } } // 老李觉得你多管闲事
      },
      {
        label: '视而不见',
        message: '你假装没看见，匆匆走过。',
        effect: { relationChange: { lao_zhang: -5 } }
      }
    ]
  },
  {
    id: 'npc_neighbors_quarrel',
    title: '邻里争吵',
    description: '老李和老张又因为门口的一块地界吵了起来，引来众人围观。',
    type: 'npc',
    triggerCondition: { probability: 0.05 }, // Rare event
    options: [
      {
        label: '帮老李说话',
        message: '你指出地界确实偏向老李家，老张气愤地回了屋，老李得意洋洋。',
        effect: { relationChange: { lao_li: 15, lao_zhang: -20 } }
      },
      {
        label: '帮老张说话',
        message: '你认为老张占理，老李虽然不服但没再多说，老张对你投来感激的目光。',
        effect: { relationChange: { lao_li: -20, lao_zhang: 15 } }
      },
      {
        label: '各打五十大板',
        message: '你指出两人都有不对之处，两人虽然都不爽，但也觉得你说得在理。',
        effect: { reputation: 10, relationChange: { lao_li: -5, lao_zhang: -5 } }
      }
    ]
  }
];
