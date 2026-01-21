/*
 * @Author: xyZhan
 * @Date: 2026-01-20 20:03:30
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-21 07:58:31
 * @FilePath: \textgame\src\data\items.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import { Item } from '@/types/game';

export const items: Item[] = [
  {
    id: 'bamboo_basket',
    name: '精制竹篮',
    description: '老李亲手编制的竹篮，工艺精湛，结实耐用。',
    type: 'misc'
  },
  {
    id: 'old_wine',
    name: '陈年老酒',
    description: '一坛封存多年的老酒，酒香扑鼻。',
    type: 'consumable',
    effect: {
        health: 5,
        reputation: 2
    }
  },
  {
    id: 'chicken_feather',
    name: '杂色鸡毛',
    description: '从案发现场捡到的鸡毛，似乎是破案的关键线索。',
    type: 'quest'
  },
  {
    id: 'mysterious_token',
    name: '神秘令牌',
    description: '不知材质的黑色令牌，上面刻着看不懂的符文。',
    type: 'misc'
  },
  {
    id: 'oil_paper_umbrella',
    name: '油纸伞',
    description: '一把来自临安的二手油纸伞，上面隐约有这一点水迹。',
    type: 'misc'
  },
  {
    id: 'lovesickness_tablet',
    name: '相思碑',
    description: '一块大石头，它好像是一块碑，经历了岁月的沉淀，很多字迹已经模糊不清，但是依稀可以看见上面刻着“冷雁南飞 而我面向北 自锁眉 凭栏等谁归”。',
    type: 'misc'
  },
  {
    id: 'cursed_sword',
    name: '被诅咒的剑',
    description: '一把黑色的剑，在雨夜里更加显得诡异。剑身呈现幽蓝光泽，材质为特殊玄铁铸造，带有不规则的黑色纹路如同黑蝶展翅。剑柄缠绕着褪色的蓝色丝绸，末端镶嵌着一颗深邃的蓝宝石，宝石表面流转着细微的黑色雾气。在夜晚或阴暗环境中，剑身会发出微弱的蓝光，同时有黑色蝶影在剑身边缘环绕飞舞。',
    type: 'misc'
  },
  {
    id: 'crescent_moon_badge',
    name: '弯月亮徽章',
    description: '一枚上弦月月亮模样的徽章，好像有故乡的味道。',
    type: 'misc'
  },
  {
    id: 'wolf_claw',
    name: '荒原灰狼的利爪',
    description: '荒原灰狼的锋利爪子，可做武器防身。',
    type: 'consumable',
    effect: {
      ability: 5
    }
  },
  {
    id: 'goose_feather',
    name: '南飞落雁的神羽',
    description: '传说中南飞落雁留下的神羽，轻盈坚韧，可为羽衣护体。',
    type: 'consumable',
    effect: {
      reputation: 5,
      health: 5
    }
  },
  {
    id: 'holy_water',
    name: '深山清潭的圣水',
    description: '深山人迹罕至处的清潭之水，据说可当甘泉疗伤。',
    type: 'consumable',
    effect: {
      health: 20
    }
  }
];

export const getItemById = (id: string): Item | undefined => {
    return items.find(i => i.id === id);
};
