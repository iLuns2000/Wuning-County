import { Effect, GameState, Item } from '@/types/game';
import { 
  NPCGiftRule, 
  GiftCategory, 
  GiftCategoryConfig, 
  getNPCGiftRule,
  GiftMatcher 
} from '@/data/npcGiftInteractionRules';

/**
 * NPC 赠礼互动规则引擎
 * 提供通用 API 处理 NPC 赠礼逻辑
 */

export interface GiftResolutionResult {
  success: boolean;
  category: GiftCategory;
  categoryLabel: string;
  effect: Effect;
  rewardText: string;
  loreText?: string;
  message: string;
}

/**
 * 匹配礼物分类
 */
function matchGiftCategory(
  item: Pick<Item, 'id' | 'name' | 'category'>,
  categories: GiftCategoryConfig[]
): GiftCategoryConfig | null {
  for (const category of categories) {
    for (const matcher of category.matchers) {
      if (matchItemWithMatcher(item, matcher)) {
        return category;
      }
    }
  }
  return null;
}

/**
 * 检查物品是否匹配给定的匹配器
 */
function matchItemWithMatcher(
  item: Pick<Item, 'id' | 'name' | 'category'>,
  matcher: GiftMatcher
): boolean {
  switch (matcher.type) {
    case 'exact':
      return item.id === matcher.itemId;
    case 'prefix':
      return item.id.startsWith(matcher.prefix);
    case 'keyword':
      return matcher.keywords.some(keyword => item.name.includes(keyword));
    case 'tag':
      return item.category === matcher.tag;
    default:
      return false;
  }
}

/**
 * 随机抽取 Lore 文本
 */
function rollLoreText(category: GiftCategoryConfig): string | null {
  if (!category.loreDrop) return null;
  
  const { probability, pools } = category.loreDrop;
  
  // 概率判定
  if (Math.random() >= probability) return null;
  
  // 计算总权重
  const totalWeight = pools.reduce((sum, pool) => sum + pool.weight, 0);
  let random = Math.random() * totalWeight;
  
  // 选择池
  for (const pool of pools) {
    random -= pool.weight;
    if (random <= 0) {
      const texts = pool.texts;
      return texts[Math.floor(Math.random() * texts.length)];
    }
  }
  
  return null;
}

/**
 * 构建赠礼结果
 */
export function buildGiftOutcome(
  npcId: string,
  item: Pick<Item, 'id' | 'name' | 'category'>,
  npcName: string
): { success: boolean; message: string; result?: GiftResolutionResult } {
  // 获取 NPC 规则
  const rule = getNPCGiftRule(npcId);
  if (!rule) {
    return { 
      success: false, 
      message: `暂无 ${npcName} 的赠礼规则。` 
    };
  }
  
  // 匹配分类
  const category = matchGiftCategory(item, rule.categories);
  if (!category) {
    return { 
      success: false, 
      message: `这份礼物暂时不适合赠予 ${npcName}。` 
    };
  }
  
  // 随机掉落 Lore
  const loreText = rollLoreText(category);
  
  // 构建结果
  const result: GiftResolutionResult = {
    success: true,
    category: category.id,
    categoryLabel: category.label,
    effect: { ...category.effect },
    rewardText: category.rewardText,
    loreText,
    message: `你把${item.name}递给${npcName}，${category.rewardText}${loreText ? ` ${loreText}` : ''}`
  };
  
  return { success: true, message: '', result };
}

/**
 * 获取 NPC 赠礼候选物品
 */
export function getGiftCandidates(
  npcId: string,
  inventory: Record<string, number>,
  allItems: Item[]
): Array<{
  item: Item;
  count: number;
  category: GiftCategory;
  categoryLabel: string;
}> {
  const rule = getNPCGiftRule(npcId);
  if (!rule) return [];
  
  const candidates: Array<{
    item: Item;
    count: number;
    category: GiftCategory;
    categoryLabel: string;
  }> = [];
  
  // 遍历背包
  for (const [itemId, count] of Object.entries(inventory)) {
    if (count <= 0) continue;
    
    const item = allItems.find(i => i.id === itemId);
    if (!item) continue;
    
    const category = matchGiftCategory(item, rule.categories);
    if (!category) continue;
    
    candidates.push({
      item,
      count,
      category: category.id,
      categoryLabel: category.label
    });
  }
  
  // 排序
  const categoryOrder = rule.categoryOrder || rule.categories.map(c => c.id);
  candidates.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category);
    const bIndex = categoryOrder.indexOf(b.category);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.item.name.localeCompare(b.item.name, 'zh-CN');
  });
  
  return candidates;
}

/**
 * 获取 NPC 赠礼规则描述
 */
export function getNPCGiftDescription(npcId: string): string | undefined {
  const rule = getNPCGiftRule(npcId);
  return rule?.description;
}

/**
 * 检查 NPC 是否有赠礼规则
 */
export function hasNPCGiftRule(npcId: string): boolean {
  return !!getNPCGiftRule(npcId);
}

/**
 * 获取分类标签
 */
export function getGiftCategoryLabel(npcId: string, category: GiftCategory): string | undefined {
  const rule = getNPCGiftRule(npcId);
  if (!rule) return undefined;
  
  const categoryConfig = rule.categories.find(c => c.id === category);
  return categoryConfig?.label;
}
