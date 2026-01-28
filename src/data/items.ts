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
import { snacks } from './snacks';
import { treasures } from './treasures';

export const items: Item[] = [
  ...snacks,
  ...treasures,
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
  },
  {
    id: 'clo_apricot_ruqun',
    name: '杏色襦裙',
    description: '温柔杏色襦裙，裙摆轻盈，适合日常雅会。',
    type: 'apparel',
    price: 520,
    slot: 'top',
    style: '清雅'
  },
  {
    id: 'clo_moon_shenyi',
    name: '月白深衣',
    description: '月白色深衣，线脚简洁，带出清雅气质。',
    type: 'apparel',
    price: 1280,
    slot: 'outer',
    style: '典雅'
  },
  {
    id: 'clo_bixia_changqun',
    name: '碧霞长裙',
    description: '碧霞色长裙，色泽柔和，行走间若云影流动。',
    type: 'apparel',
    price: 880,
    slot: 'bottom',
    style: '清雅'
  },
  {
    id: 'clo_cloud_cloak',
    name: '云纹披风',
    description: '披风绣有云纹，既能挡风，也添几分端雅。',
    type: 'apparel',
    price: 1280,
    slot: 'outer',
    style: '典雅'
  },
  {
    id: 'clo_qingling_changshan',
    name: '青绫长衫',
    description: '青绫长衫裁剪合体，低调而不失气度。',
    type: 'apparel',
    price: 560,
    slot: 'top',
    style: '典雅'
  },
  {
    id: 'clo_hemp_duanru',
    name: '细麻短褂',
    description: '细麻短褂透气舒适，适合轻便出行。',
    type: 'apparel',
    price: 260,
    slot: 'top',
    style: '清雅'
  },
  {
    id: 'clo_misty_outer',
    name: '烟岚外袍',
    description: '烟岚色外袍层次分明，远观若雾。',
    type: 'apparel',
    price: 1380,
    slot: 'outer',
    style: '典雅'
  },
  {
    id: 'clo_crane_sleeve',
    name: '鹤影大袖',
    description: '大袖宽阔，袖缘有鹤影暗纹。',
    type: 'apparel',
    price: 1580,
    slot: 'outer',
    style: '华贵'
  },
  {
    id: 'clo_pine_zhi_duo',
    name: '松青直裰',
    description: '松青直裰挺括耐穿，适合正式场合。',
    type: 'apparel',
    price: 980,
    slot: 'top',
    style: '典雅'
  },
  {
    id: 'clo_ink_doupeng',
    name: '墨影斗篷',
    description: '墨色斗篷垂坠感强，添几分英气。',
    type: 'apparel',
    price: 1480,
    slot: 'outer',
    style: '英气'
  },
  {
    id: 'clo_snow_duanru',
    name: '雪羽短襦',
    description: '短襦轻巧，衣缘似雪羽，清丽可人。',
    type: 'apparel',
    price: 420,
    slot: 'top',
    style: '清雅'
  },
  {
    id: 'clo_lotus_baizhe',
    name: '莲纹百褶裙',
    description: '裙摆起落如莲花绽放，步伐更显婉约。',
    type: 'apparel',
    price: 860,
    slot: 'bottom',
    style: '俏皮'
  },
  {
    id: 'clo_yulin_duanda',
    name: '羽林短打',
    description: '短打利落，行动自如，适合轻快活动。',
    type: 'apparel',
    price: 600,
    slot: 'top',
    style: '英气'
  },
  {
    id: 'clo_river_blue_pants',
    name: '江蓝长裤',
    description: '江蓝长裤裁剪利落，搭配外袍更显稳重。',
    type: 'apparel',
    price: 540,
    slot: 'bottom',
    style: '典雅'
  },
  {
    id: 'clo_cyan_embroidery_shoes',
    name: '黛青绣履',
    description: '黛青绣履针脚细密，穿着舒适耐看。',
    type: 'apparel',
    price: 360,
    slot: 'shoes',
    style: '清雅'
  },
  {
    id: 'acc_haitang_earring',
    name: '海棠耳坠',
    description: '耳坠形似海棠花蕊，摇曳生姿。',
    type: 'accessory',
    price: 610,
    slot: 'ear',
    style: '华贵'
  },
  {
    id: 'acc_jade_bi_pendant',
    name: '玉璧颈饰',
    description: '玉璧温润，佩于颈间更添端庄。',
    type: 'accessory',
    price: 1480,
    slot: 'neck',
    style: '典雅'
  },
  {
    id: 'acc_silver_bangle',
    name: '素银镯',
    description: '银镯素雅，光泽柔和，适合日常佩戴。',
    type: 'accessory',
    price: 420,
    slot: 'hand',
    style: '清雅'
  },
  {
    id: 'acc_gold_bracelet',
    name: '鎏金手环',
    description: '鎏金手环光华内敛，庄重而不张扬。',
    type: 'accessory',
    price: 980,
    slot: 'hand',
    style: '华贵'
  },
  {
    id: 'acc_cloud_hairpin',
    name: '流云簪',
    description: '发簪轻巧，簪头似流云凝结。',
    type: 'accessory',
    price: 520,
    slot: 'head',
    style: '清雅'
  },
  {
    id: 'acc_pearl_hairpin',
    name: '明珠步摇',
    description: '步摇垂珠微晃，行走间更显灵动。',
    type: 'accessory',
    price: 1280,
    slot: 'head',
    style: '华贵'
  },
  {
    id: 'acc_lotus_ring',
    name: '莲纹指环',
    description: '指环刻莲纹，雅致清净。',
    type: 'accessory',
    price: 380,
    slot: 'hand',
    style: '清雅'
  },
  {
    id: 'acc_gourd_pendant',
    name: '葫芦佩',
    description: '葫芦形佩饰寓意平安喜乐。',
    type: 'accessory',
    price: 460,
    slot: 'waist',
    style: '俏皮'
  },
  {
    id: 'acc_coral_beads',
    name: '珊瑚串',
    description: '珊瑚串色泽温暖，佩戴更显华贵。',
    type: 'accessory',
    price: 1380,
    slot: 'neck',
    style: '华贵'
  },
  {
    id: 'acc_jade_belt',
    name: '玉扣腰佩',
    description: '玉扣腰佩稳妥大方，搭配外袍更显层次。',
    type: 'accessory',
    price: 720,
    slot: 'waist',
    style: '典雅'
  },
  {
    id: 'acc_lantern_earring',
    name: '灯影耳坠',
    description: '耳坠形似小灯，微光灵动。',
    type: 'accessory',
    price: 560,
    slot: 'ear',
    style: '俏皮'
  },
  {
    id: 'acc_bamboo_jade',
    name: '竹节玉佩',
    description: '竹节玉佩清瘦挺拔，寓意节节高升。',
    type: 'accessory',
    price: 680,
    slot: 'waist',
    style: '典雅'
  },
  {
    id: 'acc_cloud_necklace',
    name: '云纹项圈',
    description: '项圈细致雕云纹，端雅稳重。',
    type: 'accessory',
    price: 920,
    slot: 'neck',
    style: '典雅'
  },
  {
    id: 'acc_plum_blossom_pin',
    name: '梅影簪',
    description: '簪头梅影点点，冷艳含香。',
    type: 'accessory',
    price: 840,
    slot: 'head',
    style: '典雅'
  },
  {
    id: 'acc_silk_tassel',
    name: '丝穗挂饰',
    description: '丝穗垂落，随步轻扬，增添灵动感。',
    type: 'accessory',
    price: 500,
    slot: 'waist',
    style: '俏皮'
  },
  {
    id: 'acc_amber_beads',
    name: '琥珀手串',
    description: '琥珀色泽温润，佩戴舒心。',
    type: 'accessory',
    price: 760,
    slot: 'hand',
    style: '典雅'
  },
  {
    id: 'acc_jade_lock',
    name: '福纹玉锁',
    description: '玉锁刻福纹，寓意护佑平安。',
    type: 'accessory',
    price: 880,
    slot: 'neck',
    style: '典雅'
  },
  // Alchemy Items (2048 Minigame)
  { id: 'herb_residue', name: '药渣', description: '炼丹失败的产物，虽无大用，但这灰烬中似乎还残留着一丝药性。', type: 'material', price: 1, color: 'bg-stone-400', textColor: 'text-white' },
  { id: 'herb_licorice', name: '甘草', description: '寻常可见的草药，药性温和，是炼丹的基础材料。', type: 'material', price: 2, color: 'bg-green-600', textColor: 'text-white' },
  { id: 'herb_peel', name: '陈皮', description: '晒干的橘皮，气味芳香，能理气健脾。', type: 'material', price: 5, color: 'bg-orange-600', textColor: 'text-white' },
  { id: 'herb_honeysuckle', name: '金银花', description: '花初开为白，后转为黄，故名金银花，清热解毒。', type: 'material', price: 15, color: 'bg-yellow-500', textColor: 'text-white' },
  { id: 'herb_angelica', name: '当归', description: '补血活血，调经止痛，润肠通便。', type: 'material', price: 40, color: 'bg-amber-800', textColor: 'text-white' },
  { id: 'herb_pearl', name: '珍珠粉', description: '研磨细腻的珍珠粉，有安神定惊、明目消翳之效。', type: 'material', price: 100, color: 'bg-slate-500', textColor: 'text-white' },
  { id: 'herb_ganoderma', name: '紫灵芝', description: '紫色的灵芝，极其罕见，延年益寿的上品。', type: 'material', price: 250, color: 'bg-purple-700', textColor: 'text-white' },
  { id: 'herb_cordyceps', name: '冬虫夏草', description: '冬天是虫，夏天是草，神奇的滋补药材。', type: 'material', price: 600, color: 'bg-amber-900', textColor: 'text-white' },
  { id: 'herb_ambergris', name: '龙涎香', description: '大海中异兽的珍宝，异香扑鼻，价值连城。', type: 'material', price: 1500, color: 'bg-gray-600', textColor: 'text-white' },
  { id: 'herb_snow_lotus', name: '天山雪莲', description: '生长在极寒之地的雪莲，能解百毒。', type: 'material', price: 4000, color: 'bg-cyan-600', textColor: 'text-white' },
  { id: 'herb_ginseng_king', name: '千年人参', description: '吸收了千年日精月华的人参，已有灵性。', type: 'material', price: 10000, color: 'bg-red-700', textColor: 'text-white' },
];

export const getItemById = (id: string): Item | undefined => {
    return items.find(i => i.id === id);
};
