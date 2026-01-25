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
        // Check if achievement is already unlocked
        const hasAchievement = state.achievements.includes('linan_memory');
        return isRainy && hasMoney && !hasUmbrella && !hasAchievement;
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
  },
  // Autumn Moon Viewing Event
  {
    id: 'autumn_moon_viewing',
    title: '观月',
    description: '这么晚还在工作的你抬头望向天空，惊讶的发现今天是，一枚月亮弯弯挂在天上。迷迷糊糊的月亮好像掉了下来落到了你的背包里。',
    type: 'random',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        // Check for Autumn (Season index 2) AND Day 7 or 8 of season AND "Working late" (high daily counts)
        // Helper logic duplicated from store since we can't import easily
        const SEASON_LENGTH = 90;
        const adjustedDay = state.day - 1;
        const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
        const dayOfSeason = (adjustedDay % SEASON_LENGTH) + 1;
        
        // Autumn is index 2. 7th or 8th day.
        // "Still working late at night" -> check total actions. Assuming > 10 is getting late.
        // Also check if we already have the badge to avoid repeat.
        return seasonIndex === 2 && 
               (dayOfSeason === 7 || dayOfSeason === 8) && 
               (state.dailyCounts.work + state.dailyCounts.rest >= 10) &&
               !state.inventory.includes('crescent_moon_badge') &&
               !state.achievements.includes('first_moon');
      }
    },
    options: [
      {
        label: '收下月亮',
        message: '你捡起了那枚弯弯的月亮徽章，心中泛起一丝思乡之情。“在秋天掉落一枚弯月亮，无论凑近端详还是远望，都算吾乡”。',
        effect: {
           itemsAdd: ['crescent_moon_badge']
        }
      }
    ]
  },
  // Slacking Off Event
  {
    id: 'slacking_off',
    title: '摸鱼时刻',
    description: '今天是不是什么也不想干只想摸鱼？那就送你一首《上班摸鱼写的歌》。“天下人波澜壮阔 如火如荼 我要吃饱喝足 好同命运赌上一赌 逆水孤舟敢笑着就不觉苦 借过山重水复 铺开云烟打个地铺”',
    type: 'random',
    triggerCondition: {
      probability: 0, // Triggered manually only
      custom: () => false
    },
    options: [
       {
         label: '收下歌词',
         message: '你听着这首歌，觉得心情格外舒畅。',
         effect: {
            // We use a flag to unlock the achievement
            flagsSet: { achievement_slacking_unlocked: true },
            // Important: We must set a flag to mark that we handled slacking for this day
            // But we need the current day value. Effect doesn't support dynamic values easily here.
            // Wait, Effect is static. 
            // We need to solve the loop issue.
            // TimeManager checks `flags['slacking_event_day'] === day`.
            // But we can't set dynamic `day` in static `events.ts`.
            
            // Workaround: We can't use static `flagsSet` with dynamic value.
            // We can use a boolean flag like `slacking_event_triggered_generic: true`?
            // No, because `day` changes.
            
            // Better approach:
            // In TimeManager, we are triggering the event.
            // We can update the flag *immediately* before or after triggering the event in TimeManager?
            // But we can't call `updateStats` easily from TimeManager without exposing it.
            // `useGameStore` exposes `updateStats`.
            // So in TimeManager, we can do:
            // triggerSpecificEvent('slacking_off');
            // updateStats({ flags: { ...flags, slacking_event_day: day } });
            
            // Let's modify TimeManager to do this.
            // So we don't need to change events.ts for the loop prevention flag.
            // Just the achievement flag.
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
  },
  // New NPC Interactions
  {
    id: 'wuyan_forge',
    title: '委托打造',
    description: '你踏入铁匠铺，炉火正旺。无言正挥锤锻打，你提出了打造的需求。',
    type: 'npc',
    triggerCondition: { probability: 0 }, // Manual trigger
    options: [
      {
        label: '打造农具',
        message: '无言点了点头，表示过几天来取。',
        effect: { ability: 1, relationChange: { wuyan: 1 } }
      },
      {
        label: '打造神兵 (200文)',
        message: '无言看着你的银子，虽然眼神无奈，还是答应了打造“炫酷”神兵。',
        effect: { money: -200, relationChange: { wuyan: 2 } }
      }
    ]
  },
  {
    id: 'mzfeee_info',
    title: '获取情报',
    description: '百晓生似乎有什么话想告诉你。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受 (5文)',
        message: '你获得了无关紧要的乡野八卦一条。',
        effect: { money: -5, relationChange: { mzfeee: 1 } }
      },
      {
        label: '拒绝',
        message: '你逃离了百晓生绘声绘色的口水攻击，身心得到了疗愈。',
        effect: { health: 1, relationChange: { mzfeee: -1 } }
      }
    ]
  },
  {
    id: 'mzfeee_snacks',
    title: '品尝小吃',
    description: '新鲜出炉的烤饼、麻球点心、糖葫芦，请君挑选。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '购买 (10文)',
        message: '你饱餐一顿，并得到了情报贩子的九折优惠情报资格。',
        effect: { money: -10, relationChange: { mzfeee: 10 } }
      },
      {
        label: '拒绝',
        message: '你不认可她的厨艺，距离百晓生VIP客户的地位又远了一步。',
        effect: { relationChange: { mzfeee: -5 } }
      }
    ]
  },
  {
    id: 'yun_enter_shop',
    title: '进店坐下',
    description: '云老板走上来问到客官想吃点啥？要不要试试本店新推出的茶点？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '推荐推荐 (20文)',
        message: '云老板给你推荐了几道美味的菜肴，你大快朵颐。',
        effect: { money: -20, health: 5, relationChange: { yun_tuntun: 1 }, flagsSet: { cat_order_first: true } }
      },
      {
        label: '不用了',
        message: '小二给你端上来了一壶茶水。无事发生。',
        effect: { relationChange: { yun_tuntun: -1 } }
      },
      {
        label: '征用桌子',
        message: '来者是客，云老板怒不敢言，但心中悄悄记下了今日之仇。',
        effect: { relationChange: { yun_tuntun: -5 } }
      }
    ]
  },
  {
    id: 'yun_steal_skill',
    title: '后厨偷师',
    description: '你打算悄悄摸到后厨去，在窗户上扣一个洞偷师。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '贿赂小猫 (10文)',
        message: '小猫们乖乖的吃着你给的鱼干，你默默记录着美味馄饨的制作过程。偷师成功。',
        effect: { money: -10, ability: 2, flagsSet: { cat_steal_success: true } }
      },
      {
        label: '直接进入',
        message: '猫咪叫声引起了云老板的注意，你被当场抓住，小二将你扔出大门。',
        effect: { relationChange: { yun_tuntun: -5 }, flagsSet: { cat_steal_fail: true } }
      }
    ]
  },
  {
    id: 'fangfang_meet_deer',
    title: '林间遇鹿',
    description: '在野外偶遇一只麋鹿，甚是美丽。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '摸摸',
        message: '麋鹿接受的你的善意，并让你摸了摸。',
        effect: { relationChange: { fangfang: 5 } } // +5 elk, +5 cat too
      },
      {
        label: '溜了',
        message: '你绕路而行，但总感觉错失一份机缘。',
      },
      {
        label: '此鹿甚美',
        message: '瞬时黑幕笼罩……（你遭到了莫名的诅咒）',
        effect: { health: -50 }
      }
    ]
  },
  {
    id: 'dousha_drink',
    title: '喝酒',
    description: '豆沙邀请你今晚一起饮酒。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受 (150文)',
        message: '晚上和豆沙对饮，喝多了抢着买单，并结清了老板欠款。',
        effect: { money: -150, relationChange: { dousha: 1 } }
      },
      {
        label: '拒绝',
        message: '无事发生。',
      }
    ]
  },
  {
    id: 'dousha_task',
    title: '接取任务',
    description: '豆沙这里有一些杂活需要人手，比如运碳、找矿等。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '运送木炭',
        message: '你帮豆沙运送了一批木炭，累得满头大汗。',
        effect: { health: -10, money: 20, relationChange: { dousha: 2 } }
      },
      {
        label: '寻找矿石',
        message: '你在山上找了一天，终于找到了一块稀有矿石交给豆沙。',
        effect: { health: -15, money: 30, relationChange: { dousha: 3 } }
      },
      {
        label: '下次再说',
        message: '你现在没空，婉拒了豆沙。',
      }
    ]
  },
  {
    id: 'xiaosi_account',
    title: '算账',
    description: '与小四一起到账房待一天。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '她看账本一目十行，而你却困得昏睡了过去。',
        effect: { health: 10, relationChange: { xiaosi: -10 } }
      },
      {
        label: '拒绝',
        message: '她对你摇了摇头，说你朽木不可雕也。',
        effect: { relationChange: { xiaosi: -10 } }
      }
    ]
  },
  {
    id: 'xiaosi_guard',
    title: '站岗',
    description: '在首富小四的家门前站岗。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '你站了一天岗，获得了报酬。',
        effect: { money: 20, health: 5, relationChange: { xiaosi: 10 } }
      },
      {
        label: '拒绝',
        message: '你错失了一个财富密码。',
      }
    ]
  },
  {
    id: 'zhuansun_enter_pavilion',
    title: '进入锋锷阁',
    description: '映入眼帘的是琳琅满目的各式武器盔甲……的画像。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '质疑',
        message: '颛孙鹤解释说为了防盗只放画像。',
        effect: { relationChange: { zhuansun_he: 1 } }
      },
      {
        label: '委托锻造',
        message: '你提交了材料，颛孙鹤答应一旬后交货。',
        effect: { relationChange: { zhuansun_he: 2 } }
      }
    ]
  },
  {
    id: 'song_interactions',
    title: '宋大夫的医馆',
    description: '你来到了医馆，打算做什么？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '问诊/抓药 (10文)',
        message: '宋大夫为你诊治了一番。',
        effect: { health: 57, money: -10 }
      },
      {
        label: '讨论时新装扮',
        message: '你们讨论了当下的流行装扮，甚是投机。',
        effect: { relationChange: { song_songsheng: 5 }, ability: 5 }
      },
      {
        label: '一起出门',
        message: '你们一起逛街采药，度过了愉快的一天。',
        effect: { relationChange: { song_songsheng: 15 }, ability: 15, money: 5, reputation: 5, flagsIncrement: ['song_food_count', 'song_herb_count'] }
      },
      {
        label: '帮忙整理',
        message: '你帮忙整理了药材。',
        effect: { money: 10, ability: 10, relationChange: { song_songsheng: 2 }, health: 2, reputation: 8 }
      },
      {
        label: '投喂美食',
        message: '你给宋大夫带了些美食，她非常开心。',
        effect: { money: 20, relationChange: { song_songsheng: 10 }, flagsIncrement: ['song_food_count'] }
      },
      {
        label: '学习医术',
        message: '你向宋大夫请教医术，受益匪浅。',
        effect: { ability: 5, relationChange: { song_songsheng: 5 }, flagsIncrement: ['song_learn_count'] }
      },
      {
        label: '写花笺册子',
        message: '你们一起制作了精美的花笺册子。',
        effect: { culture: 5, relationChange: { song_songsheng: 5 }, flagsIncrement: ['song_diary_count'] }
      }
    ]
  },
  {
    id: 'ccccjq_interaction',
    title: '路过',
    description: 'CcccJq将正在书写的最后一笔完成，抬眼望向你。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '进店，委托代笔 (50文)',
        message: '“口述即可。”CcccJq边说边从案下取出一张纸铺好，用镇纸压住上缘，随后双手交叠于案上，做出准备倾听的姿态。',
        effect: { money: -50, relationChange: { ccccjq: 10 }, flagsIncrement: ['ccccjq_proxy_write_count'] }
      },
      {
        label: '不进店',
        message: 'CcccJq微微颔首，低下头继续书写。',
        effect: { relationChange: { ccccjq: 2 } }
      }
    ]
  },
  {
    id: 'ccccjq_burn_paper',
    title: '焚烧废纸',
    description: 'CcccJq正在焚烧废弃的稿纸。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '帮忙焚烧',
        message: '你帮忙一起焚烧废纸，掌握了火候的技巧。',
        effect: { relationChange: { ccccjq: 5 }, flagsIncrement: ['ccccjq_burn_paper_count'] }
      }
    ]
  },
  {
    id: 'wuyan_interact',
    title: '铁匠铺互动',
    description: '你在铁匠铺看着忙碌的无言。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '赞美通缉令',
        message: '你对着墙上画风清奇的通缉令一顿猛夸，无言虽然没说话，但看起来很受用。',
        effect: { relationChange: { wuyan: 5 }, flagsIncrement: ['wuyan_praise_count'] }
      },
      {
        label: '购买绝世神兵 (500文)',
        message: '你花大价钱买了一把“绝世神兵”，虽然看起来普普通通。',
        effect: { money: -500, relationChange: { wuyan: 10 }, flagsIncrement: ['wuyan_buy_count'] }
      }
    ]
  },
  {
    id: 'luhua_haircut',
    title: '梦幻只雕剃肆',
    description: '芦花热情的招呼你：“客官，理发吗？还是骑雕？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '理发 (20文)',
        message: '芦花给你剪了一个“杀马特”发型，你感觉自己变强了。',
        effect: { money: -20, reputation: 5, flagsIncrement: ['luhua_haircut_count'] }
      },
      {
        label: '骑雕飞行 (100文)',
        message: '你体验了一把骑雕飞行，刺激极了！',
        effect: { money: -100, health: -5, experience: 10, flagsIncrement: ['luhua_haircut_count'] }
      }
    ]
  },
  {
    id: 'baizhou_interact',
    title: '机关术探讨',
    description: '柏舟拿着一张图纸兴奋地找你：“这个设计怎么样？要不要一起合作？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '同意合作',
        message: '你们一起研究了半天，终于完善了设计。',
        effect: { ability: 5, relationChange: { baizhou: 10 }, flagsIncrement: ['baizhou_agree_count'] }
      },
      {
        label: '婉言拒绝',
        message: '你表示对机关术一窍不通，柏舟失望地离开了。',
        effect: { relationChange: { baizhou: -2 }, flagsIncrement: ['baizhou_refuse_count'] }
      }
    ]
  },
  {
    id: 'guanshan_archery',
    title: '箭馆练箭',
    description: '关山教头正在指导学员射箭。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '尝试射箭',
        message: '你拿起弓箭尝试了一次。',
        effect: { 
          // Logic for hit/miss needs randomness?
          // Using a simple 50/50 for now, or based on ability?
          // If ability > 50, hit.
          // Wait, we need CONTINUOUS hit/miss.
          // This requires logic in the handler or store to reset the counter if broken.
          // Store only supports increment.
          // So if I hit, I increment hit_continuous. If I miss, I reset hit_continuous?
          // The current store implementation only increments.
          // I can't reset via 'flagsIncrement'.
          // I might need to accept that I can't do "continuous" logic perfectly with just JSON config without store changes for "reset".
          // BUT, I can simulate "continuous" by just counting total hits/misses for now as a compromise,
          // OR I can use the `custom` handler in `Task` but this is an Event.
          //
          // Let's stick to "Cumulative" counts for now as "Continuous" requires deeper store changes (reset logic).
          // Or I can add `flagsReset` to Effect?
          // Let's add `flagsReset` to Effect! It's easy.
          flagsIncrement: ['guanshan_hit_continuous'] 
          // Ideally I should check probability here. But EventOption is static.
          // I'll make two options: "认真射箭" (Hit chance high) and "随意乱射" (Miss chance high).
        }
      },
      {
        label: '认真瞄准',
        message: '你屏气凝神，正中靶心！',
        effect: { ability: 2, flagsIncrement: ['guanshan_hit_continuous'], flagsSet: { guanshan_miss_continuous: 0 } }
      },
      {
        label: '闭眼瞎射',
        message: '你闭着眼睛射了一箭，果然脱靶了。',
        effect: { flagsIncrement: ['guanshan_miss_continuous'], flagsSet: { guanshan_hit_continuous: 0 } }
      }
    ]
  },
  {
    id: 'lengyue_study',
    title: '文物修复',
    description: '冷月未央正在修复一件古董。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '跟随学习',
        message: '你在一旁认真观察学习，并通过了小考核。',
        effect: { ability: 5, relationChange: { lengyue_weiyang: 5 }, flagsIncrement: ['lengyue_study_count'], flagsSet: { lengyue_exam_passed: true } }
      },
      {
        label: '尝试修复',
        message: '在冷月的指导下，你成功修复了一件简单的文物。',
        effect: { ability: 10, relationChange: { lengyue_weiyang: 10 }, flagsIncrement: ['lengyue_study_count'], flagsSet: { lengyue_repair_success: true } }
      },
      {
        label: '挑战高难度',
        message: '你尝试修复一件核心文物，竟然成功了！重现了失落的历史。',
        effect: { ability: 20, relationChange: { lengyue_weiyang: 20 }, flagsIncrement: ['lengyue_study_count'], flagsSet: { lengyue_ultimate_success: true } }
      }
    ]
  },
  {
    id: 'linjian_help',
    title: '协助捕快',
    description: '林间正忙得焦头烂额。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '提供帮助',
        message: '你帮林间处理了一些琐事。',
        effect: { reputation: 5, relationChange: { lin_jian: 5 }, flagsIncrement: ['linjian_help_count'] }
      }
    ]
  },
  {
    id: 'qian_xiaolu_interact',
    title: '千小鹿的药庐',
    description: '千小鹿正在整理草药。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '赠送礼物',
        message: '你送给千小鹿一些稀有草药，她非常喜欢。',
        effect: { relationChange: { qian_xiaolu: 20 } }
      },
      {
        label: '闲聊',
        message: '你们聊了聊养生之道。',
        effect: { relationChange: { qian_xiaolu: 5 } }
      }
    ]
  },
  {
    id: 'lichen_interact',
    title: '酒馆杂事',
    description: '璃尘正在酒馆忙碌。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '夜游无宁',
        message: '你与璃尘一起巡视了夜晚的无宁县。',
        effect: { relationChange: { li_chen: 5 }, flagsIncrement: ['lichen_night_tour_count'] }
      },
      {
        label: '学习酿酒',
        message: '璃尘教了你一些酿酒的技巧。',
        effect: { ability: 5, relationChange: { li_chen: 5 }, flagsIncrement: ['lichen_brew_wine_count'] }
      },
      {
        label: '帮忙打下手',
        message: '你在酒馆帮忙跑堂。',
        effect: { money: 10, relationChange: { li_chen: 5 }, flagsIncrement: ['lichen_waiter_count'] }
      },
      {
        label: '醉饮论时事',
        message: '酒过三巡，你向璃尘透露了一些情报。',
        effect: { relationChange: { li_chen: 10 }, flagsIncrement: ['lichen_leak_info_count'] }
      }
    ]
  },
  {
    id: 'zhaozhao_work',
    title: '农场劳作',
    description: '赵赵正在田间地头忙碌。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '种地',
        message: '你下地干活，挥洒汗水。',
        effect: { health: 2, money: 5, flagsIncrement: ['zhaozhao_farm_count'] }
      },
      {
        label: '抓鱼',
        message: '你在河边抓了几条鱼。',
        effect: { money: 10, flagsIncrement: ['zhaozhao_fish_count'] }
      },
      {
        label: '送货',
        message: '你帮赵赵往粮店送了一车粮食。',
        effect: { money: 15, flagsIncrement: ['zhaozhao_deliver_count'] }
      },
      {
        label: '拒绝工作',
        message: '你拒绝了赵赵的工作邀请。',
        effect: { relationChange: { zhao_zhao: -2 }, flagsIncrement: ['zhaozhao_refuse_count'] }
      }
    ]
  },
  {
    id: 'jincheng_drink',
    title: '拼酒',
    description: '锦城拿出了几坛好酒，邀你共饮。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '喝风泽药酒',
        message: '你喝下了风泽药酒，感觉神清气爽。',
        effect: { health: 10, flagsIncrement: ['jincheng_wine_fengze_daily'] }
      },
      {
        label: '喝微毒药酒',
        message: '这酒里似乎有毒……生命值-10。',
        effect: { health: -10, flagsIncrement: ['jincheng_wine_poison_daily'] }
      },
      {
        label: '喝馒头酒',
        message: '这酒怎么有股馒头味？',
        effect: { health: 5, flagsIncrement: ['jincheng_wine_bread_daily'] }
      },
      {
        label: '喝芥末酒',
        message: '咳咳咳！太冲了！',
        effect: { health: -5, flagsIncrement: ['jincheng_wine_mustard_daily'] }
      }
    ]
  },
  {
    id: 'ningying_play',
    title: '游玩',
    description: '宁缨想去县里逛逛。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '陪同游玩',
        message: '你们在县城玩了一圈，宁缨送了你一件舶来品礼物。',
        effect: { relationChange: { ningying: 10 }, flagsIncrement: ['ningying_play_count', 'ningying_gift_count'], flagsSet: { ningying_gift_received: true } }
      }
    ]
  }
];
