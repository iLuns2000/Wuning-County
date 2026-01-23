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
  }
];
