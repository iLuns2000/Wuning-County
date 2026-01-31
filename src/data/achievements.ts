import { Achievement, GameState } from '@/types/game';

export const achievements: (Achievement & { condition: (state: GameState) => boolean })[] = [
  {
    id: 'first_pot_of_gold',
    name: '第一桶金',
    description: '持有金钱超过 1000 文',
    rewardExp: 50,
    condition: (state) => state.playerStats.money >= 1000
  },
  {
    id: 'survivor',
    name: '生存专家',
    description: '存活超过 10 天',
    rewardExp: 100,
    condition: (state) => state.day > 10
  },
  {
    id: 'veteran',
    name: '老江湖',
    description: '存活超过 30 天',
    rewardExp: 300,
    condition: (state) => state.day > 30
  },
  {
    id: 'social_butterfly',
    name: '交际花',
    description: '声望达到 500',
    rewardExp: 100,
    condition: (state) => state.playerStats.reputation >= 500
  },
  {
    id: 'highly_respected',
    name: '德高望重',
    description: '声望达到 2000',
    rewardExp: 500,
    condition: (state) => state.playerStats.reputation >= 2000
  },
  {
    id: 'scholar',
    name: '才高八斗',
    description: '能力值达到 100',
    rewardExp: 100,
    condition: (state) => state.playerStats.ability >= 100
  },
  {
    id: 'wuning_collector',
    name: '无宁收藏家',
    description: '集齐无宁县微缩景观一套',
    rewardExp: 200,
    condition: (state) => state.inventory.includes('wuning_landscape')
  },
  {
    id: 'master',
    name: '一代宗师',
    description: '能力值达到 500',
    rewardExp: 500,
    condition: (state) => state.playerStats.ability >= 500
  },
  {
    id: 'wealthy',
    name: '富甲一方',
    description: '持有金钱超过 10000 文',
    rewardExp: 500,
    condition: (state) => state.playerStats.money >= 10000
  },
  {
    id: 'tycoon',
    name: '富可敌国',
    description: '持有金钱超过 100000 文',
    rewardExp: 2000,
    condition: (state) => state.playerStats.money >= 100000
  },
  {
    id: 'chicken_case_solved',
    name: '断案如神',
    description: '成功破获老李偷鸡案，查明真相',
    rewardExp: 100,
    condition: (state) => !!state.flags['chicken_case_solved_success']
  },
  {
    id: 'tea_seeking',
    name: '梅坞寻茶',
    description: '三月三，天水蓝，阳光照暖了青杉',
    rewardExp: 200,
    condition: (state) => {
      // Day 61 of the year (Spring 61) and Sunny
      const dayOfYear = (state.day - 1) % 360 + 1;
      return dayOfYear === 61 && state.weather === 'sunny';
    }
  },
  {
    id: 'linan_memory',
    name: '临安记忆',
    description: '伞柄上刻着临安制造四个字，也许上一任主人曾经撑着这把伞在断桥等人...',
    rewardExp: 50,
    condition: (state) => state.inventory.includes('oil_paper_umbrella')
  },
  {
    id: 'lovesickness_tablet_found',
    name: '相思碑',
    description: '冷雁南飞 而我面向北 自锁眉 凭栏等谁归',
    rewardExp: 100,
    condition: (state) => state.inventory.includes('lovesickness_tablet')
  },
  {
    id: 'guest_please_enter',
    name: '客官请进',
    description: '客官里面请几位，请上座好茶来奉陪',
    rewardExp: 150,
    condition: (state) => state.countyStats.economy > 80 && state.countyStats.order > 80
  },
  {
    id: 'thousand_mountains_snow_silence',
    name: '千山雪寂',
    description: '大雪满山，路上死寂',
    rewardExp: 200,
    condition: (state) => !!state.flags['first_heavy_snow_encountered']
  },
  {
    id: 'night_rain_jianghu',
    name: '夜雨江湖',
    description: '恭喜你在夜雨中依旧有外出江湖探索的勇气',
    rewardExp: 200,
    condition: (state) => state.inventory.includes('cursed_sword')
  },
  {
    id: 'first_moon',
    name: '第一枚月亮',
    description: '在秋天掉落一枚弯月亮，无论凑近端详还是远望，都算吾乡',
    rewardExp: 100,
    condition: (state) => state.inventory.includes('crescent_moon_badge')
  },
  {
    id: 'slacking_off_song',
    name: '上班摸鱼写的歌',
    description: '天下人波澜壮阔 如火如荼 我要吃饱喝足 好同命运赌上一赌',
    rewardExp: 50,
    condition: (state) => !!state.flags['achievement_slacking_unlocked']
  },
  // New Achievements
  {
    id: 'cat_steal_fail',
    name: '读书人的事情，那能叫偷吗',
    description: '猫猫发现了你，偷烹饪秘笈失败',
    rewardExp: 50,
    provider: '云吞吞',
    condition: (state) => !!state.flags['cat_steal_fail']
  },
  {
    id: 'cat_steal_success',
    name: '拿捏猫奴易如反掌',
    description: '猫猫很喜欢你的小鱼干，偷烹饪秘笈成功',
    rewardExp: 100,
    provider: '云吞吞',
    condition: (state) => !!state.flags['cat_steal_success']
  },
  {
    id: 'cat_order_first',
    name: '客官请进',
    description: '喜欢老板的报菜名吗~',
    rewardExp: 50,
    provider: '云吞吞',
    condition: (state) => !!state.flags['cat_order_first']
  },
  {
    id: 'luhua_haircut',
    name: '到梦幻只雕剃肆理发',
    description: '三人同行一人免费，全场八折开业大酬宾',
    rewardExp: 50,
    provider: '芦花',
    condition: (state) => (state.flags['luhua_haircut_count'] || 0) >= 1
  },
  {
    id: 'wuyan_praise',
    name: '扭曲的爱',
    description: '爱她让我们变得抽象',
    rewardExp: 50,
    provider: '无言',
    condition: (state) => (state.flags['wuyan_praise_count'] || 0) >= 5
  },
  {
    id: 'wuyan_buy',
    name: '人傻钱多',
    description: '钱不是问题，咱就是喜欢！',
    rewardExp: 200,
    provider: '无言',
    condition: (state) => (state.flags['wuyan_buy_count'] || 0) >= 5
  },
  {
    id: 'baizhou_refuse',
    name: '“机” 缘未到',
    description: '累计拒绝10次机关图纸合作邀请，始终未应允。',
    rewardExp: 50,
    provider: '柏舟',
    condition: (state) => (state.flags['baizhou_refuse_count'] || 0) >= 10
  },
  {
    id: 'baizhou_agree',
    name: '千 “图” 百炼',
    description: '累计答应10次机关图纸合作邀请，成为精通机关设计的天才。',
    rewardExp: 100,
    provider: '柏舟',
    condition: (state) => (state.flags['baizhou_agree_count'] || 0) >= 10
  },
  {
    id: 'baizhou_partner',
    name: '图纸 “搭” 档',
    description: '累计答应20次机关图纸合作邀请，成为对方专属的机关设计搭档。',
    rewardExp: 200,
    provider: '柏舟',
    condition: (state) => (state.flags['baizhou_agree_count'] || 0) >= 20
  },
  {
    id: 'guanshan_hit_5',
    name: '神箭手',
    description: '无宁箭馆的神射手，箭术指导',
    rewardExp: 50,
    provider: '关山',
    condition: (state) => (state.flags['guanshan_hit_continuous'] || 0) >= 5
  },
  {
    id: 'guanshan_hit_10',
    name: '百步穿杨',
    description: '无宁箭馆的神射手，无宁箭馆的教头',
    rewardExp: 100,
    provider: '关山',
    condition: (state) => (state.flags['guanshan_hit_continuous'] || 0) >= 10
  },
  {
    id: 'guanshan_miss_10',
    name: '箭圣下凡',
    description: '养由基下凡附身',
    rewardExp: 50,
    provider: '关山',
    condition: (state) => (state.flags['guanshan_miss_continuous'] || 0) >= 10
  },
  {
    id: 'lengyue_study_7',
    name: '叩门金石',
    description: '首次在冷月面前，独立完成一件文物的基础断代与辨伪。',
    rewardExp: 100,
    provider: '冷月未央',
    condition: (state) => (state.flags['lengyue_study_count'] || 0) >= 7 && !!state.flags['lengyue_exam_passed']
  },
  {
    id: 'lengyue_study_10',
    name: '补阙之手',
    description: '成功修复一件“修旧如旧”的文物，技艺得到冷月的默许。',
    rewardExp: 150,
    provider: '冷月未央',
    condition: (state) => (state.flags['lengyue_study_count'] || 0) >= 10 && !!state.flags['lengyue_repair_success']
  },
  {
    id: 'lengyue_study_20',
    name: '光阴对话者',
    description: '不仅修复了器物，更解读并重现了一段失落的历史真相。',
    rewardExp: 300,
    provider: '冷月未央',
    condition: (state) => (state.flags['lengyue_study_count'] || 0) >= 20 && !!state.flags['lengyue_ultimate_success']
  },
  {
    id: 'linjian_help',
    name: '热心市民',
    description: '你真是个好人呐',
    rewardExp: 100,
    provider: '林间',
    condition: (state) => (state.flags['linjian_help_count'] || 0) >= 10
  },
  {
    id: 'qianxiaolu_intimacy',
    name: '药香满襟',
    description: '千小鹿很喜欢你，送你一条最新款的绶带',
    rewardExp: 520,
    provider: '千妖（千小鹿）',
    condition: (state) => (state.npcRelations['qian_xiaolu'] || 0) >= 520
  },
  {
    id: 'ccccjq_proxy_write',
    name: '行走的润笔费',
    description: '她的规矩你倒背如流，她的砚台有你一份磨损',
    rewardExp: 100,
    provider: 'CcccJq',
    condition: (state) => (state.flags['ccccjq_proxy_write_count'] || 0) >= 10
  },
  {
    id: 'ccccjq_burn_paper',
    name: '人形鼓风机',
    description: '熟能生巧，你已经深谙焚纸的火候与技巧',
    rewardExp: 100,
    provider: 'CcccJq',
    condition: (state) => (state.flags['ccccjq_burn_paper_count'] || 0) >= 10
  },
  {
    id: 'lichen_night_tour',
    name: '守夜人',
    description: '你已经成为无宁夜晚的守护人，与黑暗中守护这片安宁之地！',
    rewardExp: 100,
    provider: '璃尘',
    condition: (state) => (state.flags['lichen_night_tour_count'] || 0) >= 10
  },
  {
    id: 'lichen_brew_wine',
    name: '酿酒师',
    description: '由于你经常学习酿酒技术，你已经能自己制作好酒！',
    rewardExp: 100,
    provider: '璃尘',
    condition: (state) => (state.flags['lichen_brew_wine_count'] || 0) >= 10
  },
  {
    id: 'lichen_waiter',
    name: '合格的店小二',
    description: '由于你经常在小言酒馆打下手，你已经是合格的店小二了！',
    rewardExp: 100,
    provider: '璃尘',
    condition: (state) => (state.flags['lichen_waiter_count'] || 0) >= 10
  },
  {
    id: 'lichen_leak_info',
    name: '泄密者',
    description: '由于你经常给璃尘泄露情报，县丞已经掌握相关信息，请注意祸从口出！',
    rewardExp: 50,
    provider: '璃尘',
    condition: (state) => (state.flags['lichen_leak_info_count'] || 0) >= 10
  },
  {
    id: 'song_food',
    name: '无宁美食家',
    description: '天地辽阔，尽入我等口腹',
    rewardExp: 100,
    provider: '宋颂声',
    condition: (state) => (state.flags['song_food_count'] || 0) >= 10
  },
  {
    id: 'song_bone',
    name: '接骨高高手',
    description: '你得到了接骨高手的倾囊相授与出师认可，藏珍匣中的草药任你取用',
    rewardExp: 200,
    provider: '宋颂声',
    condition: (state) => (state.flags['song_learn_count'] || 0) >= 10 && (state.flags['song_herb_count'] || 0) >= 10
  },
  {
    id: 'song_diary',
    name: '花笺主事人',
    description: '漂亮的纸册谁不喜欢呢，方寸天地，你是主宰，心事付于此间',
    rewardExp: 100,
    provider: '宋颂声',
    condition: (state) => (state.flags['song_diary_count'] || 0) >= 10
  },
  {
    id: 'zhaozhao_farm',
    name: '种地小能手',
    description: '你掌握了种地的技能',
    rewardExp: 100,
    provider: '赵赵',
    condition: (state) => (state.flags['zhaozhao_farm_count'] || 0) >= 20
  },
  {
    id: 'zhaozhao_fish',
    name: '抓鱼小能手',
    description: '你掌握了抓鱼的技能',
    rewardExp: 100,
    provider: '赵赵',
    condition: (state) => (state.flags['zhaozhao_fish_count'] || 0) >= 20
  },
  {
    id: 'zhaozhao_deliver',
    name: '粮店守护者',
    description: '你维护了粮店的名声',
    rewardExp: 100,
    provider: '赵赵',
    condition: (state) => (state.flags['zhaozhao_deliver_count'] || 0) >= 20
  },
  {
    id: 'zhaozhao_refuse',
    name: '农场黑名单',
    description: '你被拉入了农场黑名单',
    rewardExp: 50,
    provider: '赵赵',
    condition: (state) => (state.flags['zhaozhao_refuse_count'] || 0) >= 20
  },
  {
    id: 'jincheng_wine_fengze',
    name: '天选之子',
    description: '药酒虽好，可不要贪杯哦~',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['jincheng_wine_fengze_daily'] || 0) >= 5
  },
  {
    id: 'jincheng_wine_poison',
    name: '百毒不侵',
    description: '我都百毒不侵了怎么还在-10HP，-10HP...',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['jincheng_wine_poison_daily'] || 0) >= 5
  },
  {
    id: 'jincheng_wine_bread',
    name: '喝饱吃的',
    description: '我是来喝酒的还是来吃饭的？',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['jincheng_wine_bread_daily'] || 0) >= 5
  },
  {
    id: 'jincheng_wine_mustard',
    name: '芥末有劲',
    description: '好上头啊，感觉我的天灵盖都不见了（满嘴冒沫',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['jincheng_wine_mustard_daily'] || 0) >= 5
  },
  {
    id: 'ningying_partner',
    name: '一见如故',
    description: '你成为宁缨的搭子',
    rewardExp: 100,
    provider: '宁缨',
    condition: (state) => (state.flags['ningying_play_count'] || 0) >= 1 && !!state.flags['ningying_gift_received']
  },
  {
    id: 'ningying_friend_same',
    name: '金兰之交',
    description: '你成为宁缨的好朋友',
    rewardExp: 200,
    provider: '宁缨',
    condition: (state) => (state.npcRelations['ningying'] || 0) >= 60 && (state.flags['ningying_gift_count'] || 0) >= 30
  },
  {
    id: 'ningying_friend_diff',
    name: '莫逆之交',
    description: '你成为宁缨的好朋友',
    rewardExp: 200,
    provider: '宁缨',
    condition: (state) => (state.npcRelations['ningying'] || 0) >= 60 && (state.flags['ningying_gift_count'] || 0) >= 50
  },
  {
    id: 'down_the_mountain',
    name: '下山',
    description: '江湖险恶，你孤身一人须有宝物护身',
    rewardExp: 300,
    condition: (state) => 
      state.inventory.includes('wolf_claw') &&
      state.inventory.includes('goose_feather') &&
      state.inventory.includes('holy_water')
  },
  {
    id: 'blacksmith_beginner',
    name: '铸造初学者',
    description: '你已经初步掌握铁匠技能了',
    rewardExp: 100,
    condition: (state) => (state.flags['blacksmith_count'] || 0) >= 10
  },
  {
    id: 'blacksmith_master',
    name: '铸造精通者',
    description: '你已经深入掌握铁匠技能了',
    rewardExp: 300,
    condition: (state) => (state.flags['blacksmith_count'] || 0) >= 30
  },
  {
    id: 'spear_beginner',
    name: '枪术初学者',
    description: '你已经初步掌握边关枪术了',
    rewardExp: 100,
    condition: (state) => (state.flags['spear_count'] || 0) >= 10
  },
  {
    id: 'spear_master',
    name: '枪术精通者',
    description: '你已经深入掌握边关枪术了',
    rewardExp: 300,
    condition: (state) => (state.flags['spear_count'] || 0) >= 30
  },
  {
    id: 'wine_god_1',
    name: '千杯不醉',
    description: '单日饮用“女儿红”超过5次，获得酒量提升。',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['daily_wine_1_count'] || 0) >= 5
  },
  {
    id: 'wine_god_2',
    name: '酒中仙',
    description: '单日饮用“竹叶青”超过5次，获得酒量提升。',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['daily_wine_2_count'] || 0) >= 5
  },
  {
    id: 'wine_god_3',
    name: '醉生梦死',
    description: '单日饮用“状元红”超过5次，获得酒量提升。',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['daily_wine_3_count'] || 0) >= 5
  },
  {
    id: 'wine_god_4',
    name: '把酒问天',
    description: '单日饮用“剑南春”超过5次，获得酒量提升。',
    rewardExp: 100,
    provider: '锦城',
    condition: (state) => (state.flags['daily_wine_4_count'] || 0) >= 5
  },
  {
    id: 'wine_master',
    name: '酒国至尊',
    description: '集齐四种酒的成就，行月酒楼拼酒永久免费！',
    rewardExp: 500,
    provider: '锦城',
    condition: (state) => 
      state.achievements.includes('wine_god_1') &&
      state.achievements.includes('wine_god_2') &&
      state.achievements.includes('wine_god_3') &&
      state.achievements.includes('wine_god_4')
  },
  {
    id: 'brewer',
    name: '酿酒师',
    description: '在小言酒馆学习酿酒，掌握酿造技艺',
    rewardExp: 200,
    condition: (state) => !!state.flags['can_brew_wine']
  }
];
