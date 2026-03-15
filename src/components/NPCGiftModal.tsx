import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Package, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items } from '@/data/items';
import { getJiYiOuGiftCategory, getJiYiOuGiftCategoryLabel } from '@/data/npcGiftRules';
import { 
  getGiftCandidates, 
  getNPCGiftDescription, 
  getGiftCategoryLabel, 
  hasNPCGiftRule 
} from '@/services/npcGiftInteractionEngine';
import { Item } from '@/types/game';
import { GiftCategory } from '@/data/npcGiftInteractionRules';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface NPCGiftModalProps {
  npcId: string;
  npcName: string;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
}

export const NPCGiftModal: React.FC<NPCGiftModalProps> = ({ npcId, npcName, onClose, onConfirm }) => {
  const { inventory } = useGameStore();
  const vibrate = useGameVibrate();
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // 获取赠礼描述
  const giftDescription = getNPCGiftDescription(npcId) || '选择一件礼物赠予对方。';

  const giftCandidates = useMemo(() => {
    // 优先使用通用配置
    if (hasNPCGiftRule(npcId)) {
      return getGiftCandidates(npcId, inventory, items);
    }
    
    // 兼容旧的季一藕逻辑
    if (npcId === 'ji_yi_ou') {
      const candidates = Object.entries(inventory)
        .filter(([_, count]) => count > 0)
        .map(([itemId, count]) => {
          const item = items.find(entry => entry.id === itemId);
          if (!item) return null;

          const category = getJiYiOuGiftCategory(item);
          if (!category) return null;

          return {
            item,
            count,
            category: category as GiftCategory,
            categoryLabel: getJiYiOuGiftCategoryLabel(category)
          };
        })
        .filter((entry): entry is { item: Item; count: number; category: GiftCategory; categoryLabel: string } => !!entry)
        .sort((a, b) => {
          return a.item.name.localeCompare(b.item.name, 'zh-CN');
        });

      return candidates;
    }
    
    return [];
  }, [inventory, npcId]);

  // 获取分类标签的辅助函数
  const getCategoryLabel = (category: GiftCategory): string => {
    if (hasNPCGiftRule(npcId)) {
      return getGiftCategoryLabel(npcId, category) || category;
    }
    // 兼容旧的季一藕逻辑
    if (npcId === 'ji_yi_ou') {
      return getJiYiOuGiftCategoryLabel(category as any) || category;
    }
    return category;
  };

  useEffect(() => {
    if (giftCandidates.length === 0) {
      setSelectedItemId('');
      return;
    }

    if (!giftCandidates.some(candidate => candidate.item.id === selectedItemId)) {
      setSelectedItemId(giftCandidates[0].item.id);
    }
  }, [giftCandidates, selectedItemId]);

  const handleConfirm = () => {
    if (!selectedItemId) return;
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    onConfirm(selectedItemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Gift className="text-primary" size={18} />
            <h3 className="text-lg font-bold">赠礼给 {npcName}</h3>
          </div>
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 text-sm text-muted-foreground">
          {giftDescription}
        </div>

        <div className="px-5 pb-5 max-h-[55vh] overflow-y-auto">
          {giftCandidates.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground space-y-2">
              <Package className="mx-auto opacity-30" size={36} />
              <p>行囊里暂时没有可赠予的美食。</p>
              <p className="text-xs">可先前往小吃街打包糖葫芦、小笼包或其他零食。</p>
            </div>
          ) : (
            <div className="space-y-2">
              {giftCandidates.map(candidate => {
                const active = selectedItemId === candidate.item.id;
                return (
                  <button
                    key={candidate.item.id}
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.LIGHT);
                      setSelectedItemId(candidate.item.id);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/20 hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground">{candidate.item.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          分类：{getCategoryLabel(candidate.category)}
                        </div>
                      </div>
                      <div className="text-xs rounded-full bg-secondary px-2 py-1 text-muted-foreground">
                        x{candidate.count}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 bg-secondary/20">
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedItemId}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedItemId
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-70'
            }`}
          >
            赠予选中美食
          </button>
        </div>
      </div>
    </div>
  );
};
