/*
 * @Author: xyZhan
 * @Date: 2026-01-20 20:03:30
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-31 19:24:23
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
    id: 'wonton_72_transformations',
    name: '馄饨的七十二变',
    description: '云吞吞亲手撰写的馄饨制作秘籍，记载了七十二种馄饨的包法和馅料配方。',
    type: 'misc'
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
  {
    id: 'lingnan_fried_food',
    name: '嘎炸',
    description: '岭南带来的嘎炸，可入药食用。',
    type: 'consumable',
    effect: { health: 5 }
  },
  {
    id: 'yangguo_egg',
    name: '神雕蛋',
    description: '杨过神雕第八十八代绝育之前留下的蛋。',
    type: 'treasure'
  },
  {
    id: 'soul_bell',
    name: '小铜钟',
    description: '逐客生涯中的灵魂打击乐器小铜钟，上刻钟文谈及故乡的一段传说。',
    type: 'misc'
  },
  {
    id: 'bell_rubbing',
    name: '拓片',
    description: '刻有岭南某个传说的拓片，内容如下：黄月容，江南扬州人，年十四嫁与慈溪进士冯元飙为妾，后冯受揭阳令，月容度岭相随，颇谙刀笔，与参案牍，多合律，却因受宠遭主母妒忌，被害身亡，殒命岭南，自生及死，方十八年，铸此钟以为纪。',
    type: 'misc'
  },
  {
    id: 'fresh_leek',
    name: '新鲜韭菜',
    description: '一把新鲜的韭菜，翠绿欲滴，散发着独特的辛辣味。',
    type: 'material'
  },
  {
    id: 'luban_lock',
    name: '鲁班锁',
    description: '有一块可拆卸重组的小型鲁班锁，传闻是墨子流传下来的物件，焦虑时常在桌下偷偷摆弄。',
    type: 'misc'
  },
  {
    id: 'moon_eclipse_compass',
    name: '月蚀罗盘',
    description: '巴掌大小的青铜罗盘，表面有可滑动的白玉月相遮板，能根据日期手动调节成当前月相。当遮板完全覆盖时（模拟月全食），盘底会浮现血色星图。玄月门初代掌门所制，历代掌门用于记录发现的“月相墓葬”位置。在真实月全食之夜，罗盘指针会指向附近“月相墓葬”入口。',
    type: 'misc'
  },
  {
    id: 'appraisal_notebook',
    name: '《无宁鉴古疑云录》',
    description: '一本冷月未央自己总结整理的鉴宝、文物修复心得的笔记',
    type: 'misc'
  },
  {
    id: 'magistrate_ribbon',
    name: '绶带',
    description: '楼县令上值时所佩戴的绶带，通过和掌柜千妖互动获得',
    type: 'misc'
  },
  {
    id: 'leek_croton_jelly',
    name: '韭菜巴豆冻',
    description: '散发着诡异气味的绿色胶状物体，似乎是某种黑暗料理。',
    type: 'consumable',
    effect: { health: -10 }
  },
  {
    id: 'pineapple_tea',
    name: '红茶酿番菠萝',
    description: '红茶的醇厚与番菠萝的酸甜完美融合，神仙美味！',
    type: 'consumable',
    effect: { health: 10, money: 5 }
  },
  {
    id: 'leek_bun',
    name: '韭菜肉包',
    description: '皮薄馅大，汁水丰盈，千妖的拿手绝活。',
    type: 'consumable',
    effect: { health: 20, reputation: 2 }
  },
  {
    id: 'random_treasure_bag',
    name: '宁缨的赠礼',
    description: '宁缨赠送的随机宝物，里面可能装着簪子、玉坠、金瓜子或水晶珠等稀罕物件。',
    type: 'treasure',
    price: 500
  },
  {
    id: 'western_gadget',
    name: '西洋舶来品',
    description: '一件精致的西洋小玩意，做工精巧，在市面上很难见到。',
    type: 'treasure',
    price: 300
  },
  {
    id: 'jingshanwei_thousand_token',
    name: '南直隶径山卫千户令',
    description: '一块沉甸甸的令牌，象征着南直隶径山卫千户的权威。',
    type: 'misc'
  },
  {
    id: 'jingshanwei_hundred_token',
    name: '径山卫百户令',
    description: '径山卫百户的令牌，不知道是什么材质做的，水火不侵',
    type: 'misc'
  },
  {
    id: 'qingying_needle_recipe',
    name: '青影针制法',
    description: '一张浅褐色的陈旧皮纸，其上绘有青影针的详细图样与工序，关键处有数行纤小的朱砂批注。',
    type: 'misc'
  },
  {
    id: 'shark_razor',
    name: '鲨鱼剃须刀',
    description: '无名杂货铺销冠：鲨鱼剃须刀',
    type: 'misc'
  },
  {
    id: 'sun_chair',
    name: '无名杂货铺的太阳椅',
    description: '一把胡桃木做成的太阳椅，躺起来很舒服还可以折叠',
    type: 'misc'
  },
  {
    id: 'zhiyin_wine',
    name: '知音酒',
    description: '璃尘亲自酿制好酒；上穷碧落下黄泉，与君相逢话千秋',
    type: 'consumable',
    effect: { health: 10, reputation: 5 }
  },
  {
    id: 'good_wine',
    name: '一壶好酒',
    description: '璃尘亲自酿制好酒',
    type: 'consumable',
    effect: { health: 10 }
  },
  {
    id: 'red_sword_duanyu',
    name: '赤剑断欲',
    description: '璃尘曾经纵横江湖佩剑之一，不知被藏于何处',
    type: 'misc'
  },
  {
    id: 'wonton_manual',
    name: '美食秘笈《馄饨的七十二变》',
    description: '云老板家密不外传的馄饨制作秘笈，有了它你也能开一家大饭店！',
    type: 'misc'
  },
  {
    id: 'mechanism_key',
    name: '机关钥匙',
    description: '一把专为解锁各类机关匣、隐秘门扉打造的特制万能钥匙，匙身契合机关卡槽的独特纹路，是探索密域的基础必备品。',
    type: 'misc'
  },
  {
    id: 'butterfly_step_shake',
    name: '蝶恋花步摇',
    description: '一支绿色蝴蝶缠枝牡丹步摇，阳光下泛着莹光，精致华贵',
    type: 'misc'
  },
  {
    id: 'silver_flower_shears',
    name: '银制花剪',
    description: '无比锋利，既可修剪花枝，也可作为武器',
    type: 'misc'
  },
  {
    id: 'rare_flower_seeds',
    name: '珍藏花种',
    description: '游历所得，含异域花种，可观赏可入药',
    type: 'misc'
  },
  {
    id: 'celadon_gourd_bottle',
    name: '青瓷葫芦瓶',
    description: '可装酒水，长久保鲜',
    type: 'misc'
  },
  {
    id: 'four_seasons_flower_record',
    name: '《四季花时录》',
    description: '记录各种花开时节与最佳采撷时',
    type: 'misc'
  },
  {
    id: 'sword_moves_slanted',
    name: '《剑走偏锋》',
    description: '内功心法，增加速度',
    type: 'consumable',
    effect: { ability: 5 }
  },
  {
    id: 'ink_shadow_sword',
    name: '墨影',
    description: '十大名剑之一',
    type: 'misc'
  },
  {
    id: 'mushroom_manual',
    name: '《菌菇培育知识大全》',
    description: '一本墨骨自己整理记录的笔记',
    type: 'misc'
  },
  {
    id: 'iron_sword',
    name: '一把铁剑',
    description: '一把豆沙铸造的铁剑',
    type: 'misc'
  },
  {
    id: 'iron_spear',
    name: '一杆铁枪',
    description: '一把豆沙铸造的铁枪',
    type: 'misc'
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
  {
    id: 'clay_figure_manager',
    name: '小掌柜泥人',
    description: '无宁县的经典地标。',
    type: 'misc',
    price: 50
  },
  {
    id: 'wood',
    name: '木头',
    description: '普通的木材，可以用来制作各种物品。',
    type: 'material',
    price: 1
  },
  {
    id: 'stone',
    name: '石头',
    description: '坚硬的石块，建筑和工艺的基础材料。',
    type: 'material',
    price: 1
  },
  {
    id: 'clay_shopkeeper',
    name: '小掌柜泥人',
    description: '捏得惟妙惟肖的小掌柜泥人，看着很喜庆。',
    type: 'misc',
    price: 15
  },
  {
    id: 'wooden_gold_fridge',
    name: '木制黄金冰箱',
    description: '买冰箱送金子（涂了金漆的迷你石头）。',
    type: 'misc',
    price: 20
  },
  {
    id: 'wood_carving_spongebob',
    name: '木雕海绵宝宝',
    description: '“是谁住在深海的大菠萝里”',
    type: 'misc',
    price: 8
  },
  {
    id: 'wuning_fragment',
    name: '无宁县微缩景观碎片',
    description: '制作精良的微缩景观碎片，集齐12个可以兑换整套景观。',
    type: 'misc'
  },
  {
    id: 'wuning_landscape',
    name: '无宁县微缩景观',
    description: '一套完整的无宁县微缩景观，做工精细，极具收藏价值。',
    type: 'misc'
  },
  {
    id: 'barber_discount_coupon',
    name: '理发八折优惠券',
    description: '在梦幻只雕剃肆下次理发可享受八折优惠，用后即失效。',
    type: 'misc'
  },
  {
    id: 'gaza_conditioner',
    name: '嘎炸护发素',
    description: '岭南知名动物所制，芦花自主研发，你或许成为了第一只小白鼠。',
    type: 'consumable',
    price: 8
  },
  {
    id: 'patrick_star_decor',
    name: '派大星装饰',
    description: '一只粉红色的海星装饰，看起来不太聪明的样子。',
    type: 'misc'
  },
  {
    id: 'squidward_clarinet_decor',
    name: '章鱼哥竖笛装饰',
    description: '一只拿着竖笛的章鱼哥装饰，仿佛能听到那美妙（？）的笛声。',
    type: 'misc'
  },
  {
    id: 'storage_bag',
    name: '储物袋',
    description: '一种产自外地的布袋子，能够增加储物栏容量，一定程度延长物品有效期。',
    type: 'misc',
    price: 500
  },
  {
    id: 'ximeng_invitation',
    name: '曦梦楼邀请函',
    description: '一张精致的邀请函，持有者可参与曦梦楼的问答挑战。',
    type: 'misc'
  },
  {
    id: 'sword_edge_method',
    name: '《剑走偏锋》心法',
    description: '记载了奇诡剑招的武学秘籍，修习后身法如电，速度大增。',
    type: 'misc'
  },
  {
    id: 'wild_mushroom',
    name: '野生菌',
    description: '灵茸园里采集的新鲜野生菌，味道鲜美，可用于烹饪。',
    type: 'material'
  },
  {
    id: 'bamboo_fungus',
    name: '竹荪',
    description: '珍稀的菌类，被称为“菌中皇后”，口感爽脆。',
    type: 'material'
  },
  {
    id: 'mogu_gift',
    name: '墨骨的谢礼',
    description: '墨骨赠送的礼物，里面似乎装着一些珍贵的菌种。',
    type: 'misc'
  },
  {
    id: 'gentleman_plum',
    name: '梅枝',
    description: '花中四君子之一，冷香疏影，取一枝以记。',
    type: 'quest'
  },
  {
    id: 'gentleman_orchid',
    name: '兰叶',
    description: '花中四君子之一，幽兰其馨，取一叶以记。',
    type: 'quest'
  },
  {
    id: 'gentleman_bamboo',
    name: '竹节',
    description: '花中四君子之一，竹节清瘦挺拔，取一节以记。',
    type: 'quest'
  },
  {
    id: 'gentleman_chrysanthemum',
    name: '菊花',
    description: '花中四君子之一，傲霜凌寒，取一朵以记。',
    type: 'quest'
  },
  {
    id: 'incense_three',
    name: '香三柱',
    description: '月老祠供奉用香，一次祈愿消耗三柱。',
    type: 'consumable'
  },
  {
    id: 'love_knot',
    name: '同心结',
    description: '红绳同心结，寓意良缘。',
    type: 'accessory',
    slot: 'waist',
    style: '俏皮'
  }
];

export const getItemById = (id: string): Item | undefined => {
    return items.find(i => i.id === id);
};
