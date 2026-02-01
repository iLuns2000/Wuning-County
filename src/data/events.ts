import { GameEvent } from '@/types/game';

export const randomEvents: GameEvent[] = [
  // Daily Events
  {
    id: 'daily_market',
    title: '县城集市',
    description: '县城集市开张，各种商品琳琅满目。',
    type: 'daily',
    stylePreference: { preferred: ['清雅', '俏皮'] },
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
      },
      {
        label: '离开',
        message: '你没看上什么东西，转身离开了。',
      }
    ]
  },
  {
    id: 'daily_festival',
    title: '节日庆典',
    description: '县城举办节日庆典，到处张灯结彩。',
    type: 'daily',
    stylePreference: { preferred: ['华贵', '俏皮'] },
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
    stylePreference: { preferred: ['典雅', '清雅'] },
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
    stylePreference: { preferred: ['典雅', '清雅'] },
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
    stylePreference: { preferred: ['英气', '华贵'] },
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
    stylePreference: { preferred: ['英气'] },
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
    stylePreference: { preferred: ['英气'] },
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
    stylePreference: { preferred: ['典雅', '华贵'] },
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
    stylePreference: { preferred: ['典雅'] },
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
    stylePreference: { preferred: ['英气'] },
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
    stylePreference: { preferred: ['英气', '华贵'] },
    triggerCondition: {
      probability: 0.2,
      requiredRole: 'hero',
      minAbility: 60,
      custom: (state) => !state.flags['hero_alliance_leader']
    },
    options: [
      {
        label: '参加大会',
        message: '你在大会上力挫群雄，技惊四座，被推举为武林盟主！',
        effect: {
          reputation: 200,
          money: 500,
          health: -50,
          ability: 10,
          flagsSet: { hero_alliance_leader: true }
        }
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
    id: 'chadu_season_spring_peach',
    title: '春桃栽种',
    description: '春回大地，茶嘟邀你在柳园一角栽下桃枝。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const SEASON_LENGTH = 90;
        const adjustedDay = state.day - 1;
        const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
        return seasonIndex === 0 && !state.flags['flower_task_spring_done'];
      }
    },
    options: [
      {
        label: '栽下桃枝',
        message: '你与茶嘟一起轻覆新土，盼来年繁花。',
        effect: { relationChange: { cha_du: 20 }, flagsSet: { flower_task_spring_done: true } }
      },
      {
        label: '改日再来',
        message: '你婉拒了茶嘟的邀请。'
      }
    ]
  },
  {
    id: 'chadu_season_summer_lotus',
    title: '夏荷栽植',
    description: '盛夏将至，茶嘟邀你在落星湖畔添一池新荷。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const SEASON_LENGTH = 90;
        const adjustedDay = state.day - 1;
        const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
        return seasonIndex === 1 && !state.flags['flower_task_summer_done'];
      }
    },
    options: [
      {
        label: '扶荷入泥',
        message: '清波荡漾，荷苗入泥，夏意渐浓。',
        effect: { relationChange: { cha_du: 20 }, flagsSet: { flower_task_summer_done: true } }
      },
      {
        label: '改日再来',
        message: '你婉拒了茶嘟的邀请。'
      }
    ]
  },
  {
    id: 'chadu_season_autumn_chrysanthemum',
    title: '秋菊分栽',
    description: '秋风起，茶嘟邀你在柳园分栽菊苗。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const SEASON_LENGTH = 90;
        const adjustedDay = state.day - 1;
        const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
        return seasonIndex === 2 && !state.flags['flower_task_autumn_done'];
      }
    },
    options: [
      {
        label: '分栽新菊',
        message: '霜前培土，待傲寒初放。',
        effect: { relationChange: { cha_du: 20 }, flagsSet: { flower_task_autumn_done: true } }
      },
      {
        label: '改日再来',
        message: '你婉拒了茶嘟的邀请。'
      }
    ]
  },
  {
    id: 'chadu_season_winter_plum',
    title: '冬梅扶栽',
    description: '隆冬雪里，茶嘟邀你于柳园扶栽梅桩。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const SEASON_LENGTH = 90;
        const adjustedDay = state.day - 1;
        const seasonIndex = Math.floor((adjustedDay % (SEASON_LENGTH * 4)) / SEASON_LENGTH);
        return seasonIndex === 3 && !state.flags['flower_task_winter_done'];
      }
    },
    options: [
      {
        label: '扶栽梅桩',
        message: '雪压枝头，暗香初起。',
        effect: { relationChange: { cha_du: 20 }, flagsSet: { flower_task_winter_done: true } }
      },
      {
        label: '改日再来',
        message: '你婉拒了茶嘟的邀请。'
      }
    ]
  },
  {
    id: 'falling_star_lake_spongebob_boat',
    title: '落星湖泛舟',
    description: '四季花事已毕，落星湖上微风轻拂。有人问：“是谁住在深海的大菠萝里？”你笑着应声，一起登舟。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const done = state.flags['flower_task_spring_done'] && state.flags['flower_task_summer_done'] && state.flags['flower_task_autumn_done'] && state.flags['flower_task_winter_done'];
        return !!done && !state.flags['spongebob_boating_done'];
      }
    },
    options: [
      {
        label: '登舟泛湖',
        message: '落星湖畔芦苇沙沙，与你与海绵宝宝泛舟一圈。',
        effect: { experience: 10, flagsSet: { spongebob_boating_done: true } }
      },
      {
        label: '改日再约',
        message: '你暂且婉拒了这次泛舟。'
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
    description: 'CcccJq邀请你一起焚烧废纸。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '看来你也是惜纸之人，未时三刻，火候最佳，我们一同前去。',
        effect: { money: 20, health: -5, relationChange: { ccccjq: 15 }, flagsIncrement: ['ccccjq_burn_paper_count'] }
      },
      {
        label: '拒绝',
        message: '也罢。',
        effect: { relationChange: { ccccjq: -3 } }
      }
    ]
  },
  {
    id: 'ccccjq_make_needle',
    title: '制针',
    description: '来啦，此番是为取走制法，还是？',
    type: 'npc',
    triggerCondition: { probability: 0 }, // Manually triggered or relation checked in code
    options: [
      {
        label: '想与你一同完成 (100文)',
        message: '好，请按图纸所载备材，七日后请如约前来。',
        effect: { money: -100, health: -20, relationChange: { ccccjq: 30 } }
      },
      {
        label: '我想自己尝试',
        message: 'CcccJq从屋内一处锁匣中取出“青影针制法”皮纸，推至你面前。“制法在此，但有四句口诀，图上未载明，你需记清……”',
        effect: { relationChange: { ccccjq: 5 }, itemsAdd: ['qingying_needle_recipe'] }
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
    id: 'luhua_rob_rich',
    title: '劫富济贫',
    description: '套麻袋胖揍外出查账的张员外',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '一起到集市买了一个结结实实的麻袋和两把木棍，蹲在张府门外躁候',
        effect: { money: -15, health: 20, relationChange: { luhua: 10 } }
      },
      {
        label: '拒绝',
        message: '假装无事发生并警告你不许说出去',
        effect: { relationChange: { luhua: -10 } }
      }
    ]
  },
  {
    id: 'luhua_tease_yexiao',
    title: '调戏夜宵',
    description: '去小司雕像底下守候小贩夜宵出摊并献上最诚挚的祝福',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '打量了一下你的身形样貌，勉强同意，夜宵出来以后就把你抛诸脑后，不由得响起那首《路人》',
        effect: { health: 10, relationChange: { luhua: 5 } }
      },
      {
        label: '拒绝',
        message: '一个人兴冲冲的跑去找夜宵结果被关门杀，拉着你坐在街头合唱《多一点》解忧',
        effect: { money: -5, health: -5, relationChange: { luhua: -5 } }
      }
    ]
  },
  {
    id: 'luhua_poop_street',
    title: '当街拉屎',
    description: '她邀请你一起在街上拉屎',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '震惊万分并质疑你的人品',
        effect: { relationChange: { luhua: -10 } }
      },
      {
        label: '拒绝',
        message: '问你是不是便秘然后向你推销通便的嘎炸药材',
        effect: { money: -20, health: 10, relationChange: { luhua: 10 }, itemsAdd: ['lingnan_fried_food'] }
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
    id: 'lengyue_learn_basic',
    title: '初次鉴宝',
    description: '你来到玄月阁，希望能学习鉴宝与文物修复。冷月未央看着你：“修复古物需坐十年冷凳，你可耐得住寂寞？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '表明决心 (20文)',
        message: '冷月未央目光从手中拓片上移开，淡然一瞥：“无宁宝阁的规矩，识物先识史。你若连《考古图》与《博古图》的体例都分不清，便先去看《金石录》的前十卷。”她轻触一件青铜器的修补痕，“修复不是掩盖。这处补得太‘新’，毁了沧桑气韵。你想学，就先学会‘尊重旧痕’。”',
        effect: { money: -20, reputation: 10, ability: 10, relationChange: { lengyue_weiyang: 10 } }
      },
      {
        label: '知难而退',
        message: '冷月未央淡淡道：“那便作罢。只是这世间真伪，今后你看万物时，或会多三分犹豫。”',
        effect: { relationChange: { lengyue_weiyang: -5 } }
      }
    ]
  },
  {
    id: 'lengyue_learn_advanced',
    title: '深入学习',
    description: '你在玄月阁连续学习了七日，今日冷月未央似乎有话对你说。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '倾听教诲',
        message: '冷月未央将一本手札轻推至你面前：“这是我整理的《无宁鉴古疑云录》。顶楼有间‘格物室’，里面所藏并非珍宝，而是历代仿古赝鼎、修复败笔，以及我阁鉴定失误之记录。想上去看看吗？那才是鉴宝人告别‘眼学’，直面‘物证’的起点。”',
        effect: { money: 1000, reputation: 500, ability: 70, relationChange: { lengyue_weiyang: 90 }, itemsAdd: ['appraisal_notebook'] }
      },
      {
        label: '婉拒深造',
        message: '冷月未央微微颔首：“也好。此道本就如临深渊，不踏足亦是智慧。机缘未至，不必强求。玄月阁的门永远为有心人开。”',
        effect: { money: 100, ability: 5 }
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
    title: '杏林春中药铺',
    description: '千妖正在整理药材，空气中弥漫着淡淡的药香。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '赠送礼物',
        message: '你送给千妖一些稀有草药，她非常喜欢。',
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
    id: 'qian_xiaolu_leek',
    title: '讨要韭菜',
    description: '看着千妖院子里长势喜人的韭菜，你心生一计。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '讨要一把 (亲密度25解锁)',
        message: '千妖白了你一眼，但还是拔了一把韭菜扔给你。',
        effect: { relationChange: { qian_xiaolu: 2 }, itemsAdd: ['fresh_leek'] } // Assuming fresh_leek exists or generic item
      },
      {
        label: '放弃',
        message: '你怕被千妖拿着韭菜抽，打消了这个念头。',
      }
    ]
  },
  {
    id: 'qian_xiaolu_pineapple',
    title: '品尝甜点',
    description: '千妖端出一碗色泽诱人的红茶酿番菠萝。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '品尝 (亲密度50解锁)',
        message: '“这是什么神仙美味！天哪！你手艺真不错！”',
        effect: { relationChange: { qian_xiaolu: 5 }, itemsAdd: ['pineapple_tea'] }
      }
    ]
  },
  {
    id: 'qian_xiaolu_croton',
    title: '黑暗料理',
    description: '千妖笑眯眯地端出一盘绿油油的果冻状物体：“客官，来一份韭菜巴豆冻吗？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '挑战极限 (亲密度75解锁)',
        message: '“？yue……你、yue……小鹿杀人啦！”',
        effect: { health: -20, relationChange: { qian_xiaolu: 5 }, itemsAdd: ['leek_croton_jelly'] }
      },
      {
        label: '快跑',
        message: '你撒腿就跑，身后传来千妖的笑声。',
      }
    ]
  },
  {
    id: 'qian_xiaolu_bun',
    title: '美味肉包',
    description: '一阵香味飘来，千妖刚蒸好一笼韭菜肉包。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '大快朵颐 (亲密度100解锁)',
        message: '“小鹿，你做的韭菜肉包真是一绝啊！干脆把你的中药铺关门，开一家包子铺吧！”',
        effect: { health: 20, relationChange: { qian_xiaolu: 10 }, itemsAdd: ['leek_bun'] }
      }
    ]
  },
  {
    id: 'qian_xiaolu_ribbon',
    title: '最终奖励',
    description: '千妖拿在手里把玩着一条精致的绶带。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '询问绶带 (亲密度520解锁)',
        message: '“你怎么什么都会！小鹿，这绶带好精致，我真的可以拥有吗？”',
        effect: { relationChange: { qian_xiaolu: 50 }, itemsAdd: ['magistrate_ribbon'] }
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
        message: '你们在县城玩了一圈，宁缨送了你一件礼物。',
        effect: { relationChange: { ningying: 10 }, flagsIncrement: ['ningying_play_count', 'ningying_gift_count'], flagsSet: { ningying_gift_received: true }, itemsAdd: ['random_treasure_bag'] }
      }
    ]
  },
  {
    id: 'ningying_delivery',
    title: '送东西',
    description: '宁缨看起来有些苦恼：“可以帮忙送个东西吗？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受 (10文)',
        message: '宁缨非常感谢你。',
        effect: { money: 10, relationChange: { ningying: 2 } }
      },
      {
        label: '拒绝',
        message: '“还有事情，下次再说。”',
      }
    ]
  },
  {
    id: 'ningying_hotpot',
    title: '天涯涮肉坊',
    description: '“这天气，倒适合吃锅子呀！要不要一起去天涯涮肉坊？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受 (10文)',
        message: '非常开心一起去吃好吃的，宁缨赠予你一件西洋舶来品。',
        effect: { money: -10, health: 10, relationChange: { ningying: 5 }, itemsAdd: ['western_gadget'] }
      },
      {
        label: '拒绝',
        message: '你拒绝了邀请。',
      }
    ]
  },
  {
    id: 'ningying_boating',
    title: '泛舟游湖',
    description: '“这几日天清气爽，最宜泛舟游湖，岸边芦苇沙沙响，你要不要同我去湖上泛一圈？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '湖上风光无限好。',
        effect: { health: -10, relationChange: { ningying: 5 }, experience: 5 }
      },
      {
        label: '拒绝',
        message: '你拒绝了邀请。',
      }
    ]
  },
  {
    id: 'ningying_bookstore',
    title: '书坊寻奇',
    description: '“书坊新到的江湖异闻册太有意思，全是各地奇人怪事，你要不要陪我去瞧瞧？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '两人在书坊看得十分入迷，不知天地为何物。',
        effect: { health: -1, relationChange: { ningying: 5 } }
      },
      {
        label: '拒绝',
        message: '你拒绝了邀请。',
      }
    ]
  },
  {
    id: 'guan_yuhe_organize_toolbox',
    title: '帮忙整理工具箱',
    description: '这工具箱越用越乱，我都记不清哪些工具放哪儿了。你能不能帮我一起整理一下？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '同意',
        message: '“太谢谢你了！这下找工具可方便多了”',
        effect: { relationChange: { guan_yuhe: 5 }, reputation: 2 }
      },
      {
        label: '拒绝',
        message: '“没事没事，我自己收拾就好，不耽误你时间了”',
      }
    ]
  },
  {
    id: 'guan_yuhe_choose_color',
    title: '帮忙挑选配色',
    description: '我新设计了一款挂件，纠结用胭脂红还是石榴红的线，你能帮我提提建议吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '同意',
        message: '“你选的颜色真不错，看着颜色更鲜艳了，就按你说的来，（从边上拿个成品）这个送你”',
        effect: { relationChange: { guan_yuhe: 5 }, reputation: 2, ability: 2, money: 10 }
      },
      {
        label: '拒绝',
        message: '“好吧（挠头），我自己再对比看看”',
      }
    ]
  },
  {
    id: 'guan_yuhe_find_needle',
    title: '帮忙找丢失的绣花针',
    description: '糟了！我那根最细的绣花针不见了，你能不能帮我找找？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '同意',
        message: '“可算找到了！还是你的眼睛看得仔细，谢谢你”',
        effect: { relationChange: { guan_yuhe: 5 }, ability: 2 }
      },
      {
        label: '拒绝',
        message: '“那好吧，我再仔细找找”',
      }
    ]
  },
  {
    id: 'guan_yuhe_eat_together',
    title: '一起去酒楼吃饭',
    description: '要下工了，我打算去行月酒楼吃顿好的！但是一个人吃种类少，点多了又吃不完，你要和我一起拼个桌吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '同意',
        message: '“太爽了！有人一起吃饭就是香！”',
        effect: { relationChange: { guan_yuhe: 5 }, health: 5, money: -20 }
      },
      {
        label: '拒绝',
        message: '“好吧，那我就少点几个菜”',
      }
    ]
  },
  {
    id: 'ye_xiao_shop',
    title: '点开买东西',
    description: '“。。。。”（夜宵不语，只是一味地盯着你直到交易或离开）',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '就看看',
        message: '你被盯得心里发毛，决定还是先走为妙。',
        effect: { relationChange: { ye_xiao: 1 } }
      },
      {
        label: '买小掌柜泥人 (50文)',
        message: '你买下了无宁县的经典地标——小掌柜泥人。',
        effect: { money: -50, itemsAdd: ['clay_figure_manager'], relationChange: { ye_xiao: 2 } }
      },
      {
        label: '买木质黄金冰箱 (100文)',
        message: '你买下了冰箱，并获赠了一块涂了金漆的迷你石头。',
        effect: { money: -100, itemsAdd: ['wooden_gold_fridge'], relationChange: { ye_xiao: 2 } }
      },
      {
        label: '买木雕海绵宝宝 (80文)',
        message: '你刚拿起木雕，夜宵突然幽幽地问道：“是谁住在深海的大菠萝里？”',
        effect: { money: -80, itemsAdd: ['wood_carving_spongebob'], flagsSet: { ye_xiao_quiz_pending: true } }
      }
    ]
  },
  {
    id: 'ye_xiao_spongebob_quiz',
    title: '夜宵的提问',
    description: '夜宵死死盯着你，等待着你的回答：“是谁住在深海的大菠萝里？”',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => state.flags['ye_xiao_quiz_pending']
    },
    options: [
      {
        label: '“海绵宝宝！”',
        message: '夜宵点点头，默默塞给你一只派大星装饰。你隐约听见她嘀咕：“说起海绵宝宝，楼县令也与他有过一次渊源……”',
        effect: { itemsAdd: ['patrick_star_decor'], flagsSet: { ye_xiao_quiz_pending: false }, relationChange: { ye_xiao: 5 } }
      },
      {
        label: '“章鱼哥！”',
        message: '夜宵愣了一下，递给你一只章鱼哥竖笛装饰。',
        effect: { itemsAdd: ['squidward_clarinet_decor'], flagsSet: { ye_xiao_quiz_pending: false }, relationChange: { ye_xiao: 3 } }
      }
    ]
  },
  {
    id: 'qi_jiu_patrol',
    title: '在街上巡逻',
    description: '玖捕快正在街上巡逻，满头大汗。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '递上一杯水',
        message: '“谢谢您，我刚好需要呢。”',
        effect: { relationChange: { qi_jiu: 5 } }
      },
      {
        label: '聊聊话本',
        message: '“哎呀，我下值刚好没事干，可以听书了。”',
        effect: { relationChange: { qi_jiu: 5 } }
      }
    ]
  },
  {
    id: 'qi_jiu_propaganda',
    title: '张贴告示',
    description: '玖捕快正在广场宣传楼县令的政策。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '询问楼县令办案',
        message: '“大名鼎鼎的老李偷鸡案，可是我们楼县令办的！”',
        effect: { relationChange: { qi_jiu: 5 } }
      }
    ]
  },
  {
    id: 'qi_jiu_inspect',
    title: '商家巡查',
    description: '玖捕快正在商家店铺巡查。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '举报商家(确有其事)',
        message: '“经本捕快调查，确有此事，举报有奖！”',
        effect: { money: 100, relationChange: { qi_jiu: 5 } }
      },
      {
        label: '举报商家(恶意诬陷)',
        message: '“经本捕快调查，发现你恶意举报，对你处以罚款！”',
        effect: { money: -100, relationChange: { qi_jiu: -5 } }
      }
    ]
  },
  {
    id: 'qi_jiu_listen_story',
    title: '卷毛茶坊听说书',
    description: '玖捕快下值后来到茶坊听说书。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '聊聊挖洞的故事',
        message: '“嘿嘿，今天讲的好像是你下山挖惊鹊盗洞结果啥都没有……”（玖捕快面露尴尬）',
        effect: { relationChange: { qi_jiu: -1 } }
      },
      {
        label: '聊聊赌坊的故事',
        message: '“哎哟喂，今天精彩了是小司赌坊被举报关门整改了！”',
        effect: { relationChange: { qi_jiu: 5 } }
      },
      {
        label: '聊聊县令的故事',
        message: '“不得了了，今天讲的是楼县令断案如神呀！”',
        effect: { relationChange: { qi_jiu: 5 } }
      }
    ]
  },
  {
    id: 'sanyue_gift_book',
    title: '送书籍',
    description: '你要送书籍给三月吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '送给阿久',
        message: '“阿久定喜欢，我替他谢谢你。”',
        effect: { relationChange: { san_yue: 5 } }
      },
      {
        label: '送给三月',
        message: '“我不识字，你送给更需要的人吧。”',
        effect: { relationChange: { san_yue: -2 } }
      }
    ]
  },
  {
    id: 'sanyue_gift_herb',
    title: '送药材',
    description: '你要送药材给三月吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '普通药材',
        message: '“翟大夫也常送我这个。你懂我。”',
        effect: { relationChange: { san_yue: 5 } }
      },
      {
        label: '名贵药材',
        message: '“这药名贵，你留着自用吧。”',
        effect: { relationChange: { san_yue: -2 } }
      }
    ]
  },
  {
    id: 'sanyue_gift_stone',
    title: '送鹅卵石',
    description: '你要送鹅卵石给三月吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '漂亮纹路的',
        message: '“这纹路好看，像玉汤山捡的。”',
        effect: { relationChange: { san_yue: 5 } }
      },
      {
        label: '普通沉重的',
        message: '“石头沉重，不如送点轻省的。”',
        effect: { relationChange: { san_yue: -2 } }
      }
    ]
  },
  {
    id: 'sanyue_gift_food',
    title: '送食物',
    description: '你要送食物给三月吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '亲手做的',
        message: '“你自己做的？手艺不错。”',
        effect: { relationChange: { san_yue: 5 } }
      },
      {
        label: '买来的',
        message: '“归雁楼不缺吃食，你自留着。”',
        effect: { relationChange: { san_yue: -2 } }
      }
    ]
  },
  {
    id: 'sanyue_gift_jewelry',
    title: '送金银珠宝',
    description: '你要送金银珠宝给三月吗？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '赠送',
        message: '“这太贵重，我不能收。”',
        effect: { relationChange: { san_yue: 2 } }
      },
      {
        label: '强行赠送',
        message: '“归雁楼不收不义之财。”（三月生气了）',
        effect: { relationChange: { san_yue: -5 } }
      }
    ]
  },
  {
    id: 'sanyue_buy_food',
    title: '买店里吃食',
    description: '“客官今日想喝什么粥？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '买粥',
        message: '“谢谢客官，下次再来。”',
        effect: { money: -5, health: 2, relationChange: { san_yue: 2 } }
      }
    ]
  },
  {
    id: 'xiajun_intel_report',
    title: '情报上报',
    description: '夏君正于茶馆一角独酌，似乎在等待着什么消息。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '提供市井流言',
        message: '夏君微微颔首，提笔在册上记录：“闲言碎语非无用，汇入诗笺定波澜。”',
        effect: { relationChange: { xia_jun: 2 }, reputation: 1 }
      },
      {
        label: '提供重要线索',
        message: '夏君眼神一凝，随即展颜一笑：“孤身难守百重关，长街短巷耳目联。多谢阁下！”',
        effect: { relationChange: { xia_jun: 10 }, money: 50, reputation: 5 }
      },
      {
        label: '打听长安笺',
        message: '夏君轻摇折扇：“长安诗缘，待有缘人。阁下若能查证实情，或许便是那有缘人。”',
        effect: { relationChange: { xia_jun: 1 } }
      }
    ]
  },
  {
    id: 'yinhe_music_dream',
    title: '你我可有缘',
    description: '银河看着你，眼神中透着期许：“听说小友也有一个音乐梦？”',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '是的，我有',
        message: '“请与我入室内一叙...C大调（C Major）是C音开始的自然大调，组成的音有CDEFGAB...@#￥%&@”',
        effect: { relationChange: { yin_he: 1 } }
      },
      {
        label: '不好意思，我只是路过',
        message: '“我相信缘分还会再来，但相逢既是有缘。”（银河塞给了你一大笔盘缠）',
        effect: { money: 50000, relationChange: { yin_he: 1 } }
      }
    ]
  },
  {
    id: 'yingyue_meet_mountain',
    title: '山上偶遇',
    description: '在后山上遇到正在采集酿酒材料的影月。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '打招呼',
        message: '影月看了你一眼，似乎在评估你们的关系。',
        effect: { relationChange: { ying_yue: 1 } }
      },
      {
        label: '一起走 (需好感>50)',
        message: '“你也来这里吗？我在准备酿酒的材料，要一起走吗？”（影月开心地邀请你）',
        effect: { relationChange: { ying_yue: 5 } }
      },
      {
        label: '默默离开',
        message: '影月继续专注于手中的材料，根本没有注意到你（或者装作没看到）。',
        effect: { relationChange: { ying_yue: 0 } }
      }
    ]
  },
  {
    id: 'yingyue_steal_skill',
    title: '偷师学艺',
    description: '你悄悄溜进酒窖，发现影月正在调配新酒。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '暗中观察',
        message: '你记下了一些关键步骤，酿酒技艺有所提升。',
        effect: { ability: 2, relationChange: { ying_yue: -2 } }
      },
      {
        label: '现身请教',
        message: '影月被你吓了一跳，但看在你诚心的份上，教了你几招。',
        effect: { ability: 5, relationChange: { ying_yue: 5 } }
      }
    ]
  },
  {
    id: 'fengge_consult_treasure',
    title: '咨询宝物线索',
    description: '听说二掌柜有一条关于宝物的线索，要不要向他咨询呢？',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '接受',
        message: '“消息保真，快去寻宝吧，祝你好运~”',
        effect: { money: -1, ability: 1 }
      },
      {
        label: '拒绝',
        message: '“莫向外求，善、大善、老善喽~”',
        effect: { relationChange: { feng_ge: 1 } }
      }
    ]
  },
  {
    id: 'chadu_collect_flower',
    title: '协助采花',
    description: '茶嘟正在花丛中忙碌，需要帮手采摘花枝。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '采对了',
        message: '“这枝不错，送你啦！”（赏花一枝）',
        effect: { reputation: 1 }
      },
      {
        label: '采错了',
        message: '“哎呀！你怎么把花苞剪了！”（茶嘟给了你一巴掌）',
        effect: { health: -20, relationChange: { cha_du: -2 } }
      }
    ]
  },
  {
    id: 'chadu_gift_flower',
    title: '一同赠花',
    description: '茶嘟准备去城中赠花，邀请你同行。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '送对人',
        message: '“那姑娘笑得真好看，这十文钱请你喝酒。”',
        effect: { money: 10, relationChange: { cha_du: 2 } }
      },
      {
        label: '送错地方',
        message: '“你怎么送到赌坊去了！”（茶嘟给了你一巴掌）',
        effect: { health: -20, relationChange: { cha_du: -2 } }
      }
    ]
  },
  {
    id: 'chadu_flower_quiz',
    title: '柳园对花',
    description: '茶嘟在柳园设下花局，邀你识花名、吟诗作对。',
    type: 'npc',
    triggerCondition: { probability: 0 },
    options: [
      {
        label: '识梅',
        message: '你指认梅花，疏影横斜，暗香浮动。',
        effect: { reputation: 5, relationChange: { cha_du: 5 }, itemsAdd: ['gentleman_plum'] }
      },
      {
        label: '识兰',
        message: '你指认幽兰，其馨不言而自远。',
        effect: { reputation: 5, relationChange: { cha_du: 5 }, itemsAdd: ['gentleman_orchid'] }
      },
      {
        label: '识竹',
        message: '你指认修竹，风来疏疏作响。',
        effect: { reputation: 5, relationChange: { cha_du: 5 }, itemsAdd: ['gentleman_bamboo'] }
      },
      {
        label: '识菊',
        message: '你指认黄菊，傲霜凌寒，风骨自见。',
        effect: { reputation: 5, relationChange: { cha_du: 5 }, itemsAdd: ['gentleman_chrysanthemum'] }
      },
      {
        label: '猜错花名',
        message: '“连这都不认得？罚酒一杯！”',
        effect: { health: -10 }
      }
    ]
  },
  {
    id: 'yuelao_temple_prayer',
    title: '月老祠祈愿',
    description: '柳园对花后，若集齐梅兰竹菊四君子，可持香三柱于月老祠祈愿。',
    type: 'npc',
    triggerCondition: {
      probability: 1.0,
      custom: (state) => {
        const hasPlum = state.inventory.includes('gentleman_plum');
        const hasOrchid = state.inventory.includes('gentleman_orchid');
        const hasBamboo = state.inventory.includes('gentleman_bamboo');
        const hasChrysanthemum = state.inventory.includes('gentleman_chrysanthemum');
        return hasPlum && hasOrchid && hasBamboo && hasChrysanthemum && !state.flags['yuelao_prayer_done'];
      }
    },
    options: [
      {
        label: '上香祈愿',
        message: '你于月老祠上香三柱，系下一枚同心结。',
        effect: { itemsAdd: ['incense_three', 'love_knot'], flagsSet: { yuelao_prayer_done: true } }
      },
      {
        label: '暂不祈愿',
        message: '你决定择日再来。'
      }
    ]
  }
];
