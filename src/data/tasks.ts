import { Task, GameState } from '@/types/game';

export const tasks: Task[] = [
  // Magistrate Tasks
  {
    id: 'magistrate_1',
    role: 'magistrate',
    title: '整治乱象',
    description: '新官上任，县城治安混乱，百姓怨声载道。首要任务是整顿治安，恢复秩序。',
    goalDescription: '治安值达到 60',
    checkCompletion: (state: GameState) => state.countyStats.order >= 60,
    reward: { reputation: 50, money: 100 },
    rewardText: '治安大为好转，百姓对你交口称赞。',
    nextTaskId: 'magistrate_2',
    specialAction: {
      label: '严厉执法',
      description: '加大执法力度，严惩不法之徒。',
      costText: '消耗 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 20) {
          return { success: false, message: '体力不足，无法执法！' };
        }
        return {
          success: true,
          message: '你亲自带队严厉执法，抓捕了一批地痞流氓，治安有所好转，但也引起了一些非议。',
          effect: {
            health: -20,
            countyStats: { order: 5 },
            playerStats: { reputation: -2 }
          }
        };
      }
    }
  },
  {
    id: 'magistrate_2',
    role: 'magistrate',
    title: '充盈库房',
    description: '虽然治安好转，但县衙库房空虚，难以应对突发灾情。需要想办法发展经济，充盈库房。',
    goalDescription: '经济值达到 60',
    checkCompletion: (state: GameState) => state.countyStats.economy >= 60,
    reward: { reputation: 80, money: 200 },
    rewardText: '库房充盈，县衙运转正常。',
    nextTaskId: 'magistrate_3',
    specialAction: {
      label: '鼓励商贸',
      description: '颁布优惠政策，鼓励商贾往来。',
      costText: '消耗 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 20) {
          return { success: false, message: '体力不足！' };
        }
        return {
          success: true,
          message: '你颁布了鼓励商贸的政令，集市日渐繁荣。',
          effect: {
            health: -20,
            countyStats: { economy: 5 },
            playerStats: { money: 20 } // Tax revenue?
          }
        };
      }
    }
  },
  {
    id: 'magistrate_3',
    role: 'magistrate',
    title: '万民拥戴',
    description: '为官一任，造福一方。不仅要仓廪实，更要知礼节。',
    goalDescription: '文化与民生均达到 60',
    checkCompletion: (state: GameState) => state.countyStats.culture >= 60 && state.countyStats.livelihood >= 60,
    reward: { reputation: 200, ability: 10 },
    rewardText: '无宁县在你治下路不拾遗，夜不闭户，你成为了人人称颂的好官。',
    specialAction: {
      label: '宣讲教化',
      description: '兴办义学，教化百姓。',
      costText: '消耗 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 20) {
          return { success: false, message: '体力不足！' };
        }
        return {
          success: true,
          message: '你在县学宣讲圣贤书，百姓深受教化。',
          effect: {
            health: -20,
            countyStats: { culture: 3, livelihood: 3 }
          }
        };
      }
    }
  },

  // Merchant Tasks
  {
    id: 'merchant_1',
    role: 'merchant',
    title: '第一桶金',
    description: '万事开头难，你需要通过精明的手段赚取第一桶金，为日后的商业帝国打下基础。',
    goalDescription: '金钱达到 1000',
    checkCompletion: (state: GameState) => state.playerStats.money >= 1000,
    reward: { reputation: 20, ability: 5 },
    rewardText: '你成功赚取了第一桶金，在这个城市站稳了脚跟。',
    nextTaskId: 'merchant_2',
    specialAction: {
      label: '投机倒把',
      description: '寻找市场差价，进行高风险高回报的短期交易。',
      costText: '消耗 50 金钱 + 10 体力',
      handler: (state: GameState) => {
        if (state.playerStats.money < 50) return { success: false, message: '资金不足！' };
        if (state.playerStats.health < 10) return { success: false, message: '体力不足！' };
        
        const success = Math.random() > 0.4; // 60% chance success
        if (success) {
          return {
            success: true,
            message: '你敏锐地抓住了商机，大赚了一笔！',
            effect: {
              money: 100, // +150 - 50 cost
              health: -10
            }
          };
        } else {
          return {
            success: true,
            message: '这次行情看走眼了，亏了一些钱。',
            effect: {
              money: -50,
              health: -10
            }
          };
        }
      }
    }
  },
  {
    id: 'merchant_2',
    role: 'merchant',
    title: '商业帝国',
    description: '有了资本，你不再满足于小打小闹。你要通过垄断关键物资，影响整个县城的经济命脉。',
    goalDescription: '县城经济达到 70',
    checkCompletion: (state: GameState) => state.countyStats.economy >= 70,
    reward: { money: 500, reputation: 50 },
    rewardText: '你的商号已经控制了县城的半壁江山，连县令都要对你礼让三分。',
    nextTaskId: 'merchant_3',
    specialAction: {
      label: '垄断市场',
      description: '斥巨资控制关键物资，操纵市场价格。',
      costText: '消耗 200 金钱 + 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.money < 200) return { success: false, message: '资金不足！' };
        if (state.playerStats.health < 20) return { success: false, message: '体力不足！' };

        return {
          success: true,
          message: '你通过垄断手段拉升了物价，虽然百姓有些怨言，但县城经济数据确实好看了，你的腰包也更鼓了。',
          effect: {
            money: -100, // Gain 100 net (spent 200, maybe gained 300?) - let's say cost 200, gain effect money +300 -> net +100
            health: -20,
            countyStats: { economy: 5 },
            playerStats: { money: 300 } 
          }
        };
      }
    }
  },
  {
    id: 'merchant_3',
    role: 'merchant',
    title: '乐善好施',
    description: '富甲一方后，你意识到名声的重要性。是时候回馈乡里，做一个大善人了。',
    goalDescription: '声望达到 500',
    checkCompletion: (state: GameState) => state.playerStats.reputation >= 500,
    reward: { ability: 20 },
    rewardText: '你不仅富可敌国，更有着崇高的声望，成为了真正的商界领袖。',
    specialAction: {
      label: '开仓放粮',
      description: '在城中设立粥棚，救济穷人。',
      costText: '消耗 100 金钱',
      handler: (state: GameState) => {
        if (state.playerStats.money < 100) return { success: false, message: '资金不足！' };
        
        return {
          success: true,
          message: '你的善举感动了全城百姓，大家纷纷称颂你的功德。',
          effect: {
            money: -100,
            playerStats: { reputation: 30 },
            countyStats: { livelihood: 2 }
          }
        };
      }
    }
  },

  // Hero Tasks
  {
    id: 'hero_1',
    role: 'hero',
    title: '初出茅庐',
    description: '你初入江湖，藉藉无名。要想扬名立万，必须先去各大武馆挑战，证明自己的实力。',
    goalDescription: '声望达到 200',
    checkCompletion: (state: GameState) => state.playerStats.reputation >= 200,
    reward: { ability: 10, money: 50 },
    rewardText: '你在江湖中已经小有名气，各路豪杰开始注意到你。',
    nextTaskId: 'hero_2',
    specialAction: {
      label: '武馆踢馆',
      description: '挑战城中武馆教头，切磋武艺。',
      costText: '消耗 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 20) return { success: false, message: '体力不足！' };
        
        return {
          success: true,
          message: '你凭着高超的武艺击败了武馆教头，围观群众爆发出阵阵喝彩。',
          effect: {
            health: -20,
            playerStats: { reputation: 15, ability: 2 }
          }
        };
      }
    }
  },
  {
    id: 'hero_2',
    role: 'hero',
    title: '除暴安良',
    description: '有了名气，更要有侠义心肠。最近城中治安不靖，正需要你这样的侠士出手。',
    goalDescription: '治安值达到 70',
    checkCompletion: (state: GameState) => state.countyStats.order >= 70,
    reward: { reputation: 100, health: 20 },
    rewardText: '城中百姓视你为守护神，歹徒听到你的名字都要退避三舍。',
    nextTaskId: 'hero_3',
    specialAction: {
      label: '夜间巡逻',
      description: '在夜间巡视街道，打击犯罪。',
      costText: '消耗 20 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 20) return { success: false, message: '体力不足！' };
        
        return {
          success: true,
          message: '你抓获了几名趁夜行窃的小贼，维护了一方安宁。',
          effect: {
            health: -20,
            countyStats: { order: 5 },
            playerStats: { reputation: 10 }
          }
        };
      }
    }
  },
  {
    id: 'hero_3',
    role: 'hero',
    title: '一代宗师',
    description: '行侠仗义固然重要，但武学之道永无止境。你需要在武学上更进一步，成为一代宗师。',
    goalDescription: '能力达到 90',
    checkCompletion: (state: GameState) => state.playerStats.ability >= 90,
    reward: { reputation: 500 },
    rewardText: '你的武功已臻化境，开宗立派，成为了一代宗师。',
    specialAction: {
      label: '生死历练',
      description: '挑战江湖顶尖高手，在生死边缘领悟武学真谛。',
      costText: '消耗 50 体力',
      handler: (state: GameState) => {
        if (state.playerStats.health < 50) return { success: false, message: '体力不足！' };
        
        const success = Math.random() > 0.3;
        if (success) {
          return {
            success: true,
            message: '历经九死一生，你终于突破了瓶颈，武功大进！',
            effect: {
              health: -50,
              playerStats: { ability: 8 }
            }
          };
        } else {
          return {
            success: true,
            message: '对手实力太强，你受了内伤，需要静养。',
            effect: {
              health: -50, // Maybe more damage?
              playerStats: { ability: 1 } // Gain a little from failure
            }
          };
        }
      }
    }
  }
];
