import { Item } from '@/types/game';

export const snacks: Item[] = [
  { 
    id: 'snack_potato', 
    name: '土豆', 
    description: '武宁街头的经典小吃，看似普通却有着令人怀念的味道。', 
    type: 'consumable', 
    effect: { health: 2 } 
  },
  { 
    id: 'snack_ginger', 
    name: '老姜', 
    description: '辛辣透骨，一口下去浑身暖洋洋的。', 
    type: 'consumable', 
    effect: { health: 3 } 
  },
  { 
    id: 'snack_shenleshui', 
    name: '沈乐水', 
    description: '清冽甘甜的泉水，仿佛能洗涤心灵的尘埃。', 
    type: 'consumable', 
    effect: { health: 2, culture: 1 } 
  },
  { 
    id: 'snack_chaducha', 
    name: '茶嘟茶', 
    description: '茶香浓郁，回甘悠长，是文人雅士的最爱。', 
    type: 'consumable', 
    effect: { health: 1, culture: 2 } 
  },
  { 
    id: 'snack_yuntuntun', 
    name: '云吞吞', 
    description: '皮薄馅大，像云朵一样在汤中漂浮。', 
    type: 'consumable', 
    effect: { health: 4 } 
  },
  { 
    id: 'snack_jiyiou', 
    name: '季一藕', 
    description: '爽脆的藕片，带着季节的清新。', 
    type: 'consumable', 
    effect: { health: 3 } 
  },
  { 
    id: 'snack_qijiujiu', 
    name: '柒玖酒', 
    description: '酒香醇厚，喝多了容易让人想起往事。', 
    type: 'consumable', 
    effect: { health: -1, reputation: 1 } 
  },
  { 
    id: 'snack_zhuyejiu', 
    name: '竹叶酒', 
    description: '竹叶清香融入酒中，雅致非凡。', 
    type: 'consumable', 
    effect: { health: -1, culture: 2 } 
  },
  { 
    id: 'snack_kaojiucai', 
    name: '烤韭菜', 
    description: '烧烤摊必点，香气扑鼻。', 
    type: 'consumable', 
    effect: { health: 2 } 
  },
  { 
    id: 'snack_doushabao', 
    name: '豆沙包', 
    description: '甜而不腻，软糯可口。', 
    type: 'consumable', 
    effect: { health: 3 } 
  },
  { 
    id: 'snack_antangtang', 
    name: '暗棠糖', 
    description: '黑色的糖块，味道神秘而独特。', 
    type: 'consumable', 
    effect: { health: 1 } 
  },
  { 
    id: 'snack_kaojingque', 
    name: '烤惊鹊', 
    description: '名字吓人，其实是某种美味的禽类料理。', 
    type: 'consumable', 
    effect: { health: 5 } 
  },
  { 
    id: 'snack_yunjuegeng', 
    name: '云雀羹', 
    description: '细腻顺滑，入口即化。', 
    type: 'consumable', 
    effect: { health: 5, culture: 1 } 
  },
  { 
    id: 'snack_jiucaijiaozi', 
    name: '韭菜饺子', 
    description: '皮薄馅大，咬一口汁水四溢。', 
    type: 'consumable', 
    effect: { health: 4 } 
  },
  { 
    id: 'snack_xiaoyutangmian', 
    name: '小鱼汤面', 
    description: '鲜美的小鱼熬制的汤底，面条劲道。', 
    type: 'consumable', 
    effect: { health: 6 } 
  },
  { 
    id: 'snack_zhutongnuomifan', 
    name: '竹筒糯米饭', 
    description: '竹子的清香渗入糯米，软糯香甜。', 
    type: 'consumable', 
    effect: { health: 6 } 
  },
  { 
    id: 'snack_tiebandiaomintui', 
    name: '铁板刁民腿', 
    description: '极其劲道的烤肉，名字霸气，吃起来更带劲。', 
    type: 'consumable', 
    effect: { health: 8, reputation: -1 } 
  },
  { 
    id: 'snack_jiemoyoulijiu', 
    name: '芥末有力酒', 
    description: '辛辣刺激，喝一口精神百倍，就是有点冲头。', 
    type: 'consumable', 
    effect: { health: -2, ability: 2 } 
  },
  { 
    id: 'snack_rouguikaoppingguo', 
    name: '肉桂烤苹果', 
    description: '西域风味，肉桂的香气与苹果的酸甜完美融合。', 
    type: 'consumable', 
    effect: { health: 4 } 
  },
  { 
    id: 'snack_yeyeyeyeziyin', 
    name: '椰椰叶叶子饮', 
    description: '清凉解暑，名字虽然拗口但味道极好。', 
    type: 'consumable', 
    effect: { health: 3 } 
  }
];
