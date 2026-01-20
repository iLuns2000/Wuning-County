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
  }
];

export const getItemById = (id: string): Item | undefined => {
    return items.find(i => i.id === id);
};
