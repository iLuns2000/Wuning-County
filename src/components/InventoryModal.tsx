import React, { useState, useEffect } from 'react';
import { X, Package, Info, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items } from '@/data/items';
import { Item } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface InventoryModalProps {
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ onClose }) => {
  const { inventory, useItem } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const vibrate = useGameVibrate();

  // Reset selected item if it's no longer in inventory
  useEffect(() => {
    if (selectedItem && !inventory.includes(selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [inventory, selectedItem]);

  // Map inventory IDs to Item objects
  const inventoryItems = inventory.map(id => items.find(i => i.id === id)).filter((i): i is Item => !!i);

  // Group items by ID to show counts (if we allow duplicates in inventory array)
  // Currently inventory is string[], assuming it can contain duplicates.
  const itemCounts = inventoryItems.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Unique items for display
  const uniqueItems = Array.from(new Set(inventoryItems));

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm duration-200 bg-black/50 animate-in fade-in">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex gap-2 items-center">
            <Package className="text-primary" />
            <h2 className="text-xl font-bold">行囊</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex overflow-hidden flex-col flex-1 md:flex-row">
          
          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 border-b md:border-b-0 md:border-r border-border min-h-[200px]">
            {uniqueItems.length === 0 ? (
              <div className="flex flex-col gap-2 justify-center items-center h-full text-muted-foreground">
                <Package size={48} className="opacity-20" />
                <p>行囊空空如也</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {uniqueItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        setSelectedItem(item);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                      ${selectedItem?.id === item.id 
                        ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                        : 'bg-secondary/30 border-border hover:bg-secondary hover:border-primary/50'
                      }`}
                  >
                    <Package size={24} className="mb-2 text-primary/80" />
                    <span className="text-xs font-medium text-center line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 bg-secondary px-1.5 rounded-full">
                      x{itemCounts[item.id]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="flex flex-col p-4 w-full md:w-1/3 bg-secondary/10">
            {selectedItem ? (
              <div className="space-y-4 duration-200 animate-in slide-in-from-right-4">
                <div className="flex flex-col items-center p-4 rounded-lg border shadow-sm bg-card border-border">
                  <Package size={48} className="mb-2 text-primary" />
                  <h3 className="text-lg font-bold">{selectedItem.name}</h3>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full mt-1">
                    {selectedItem.type === 'consumable' ? '消耗品' : 
                     selectedItem.type === 'material' ? '材料' : 
                     selectedItem.type === 'quest' ? '任务物品' :
                     selectedItem.type === 'apparel' ? '服装' :
                     selectedItem.type === 'accessory' ? '首饰' : '杂物'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2 items-center text-sm font-semibold text-muted-foreground">
                    <Info size={14} />
                    <span>物品描述</span>
                  </div>
                  <p className="p-3 text-sm leading-relaxed rounded-md border text-card-foreground/80 bg-secondary/30 border-border/50">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.type === 'consumable' && (
                  <button
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.MEDIUM);
                      useItem(selectedItem.id);
                    }}
                    className="flex gap-2 justify-center items-center py-2 mt-4 w-full font-bold rounded-md shadow-sm transition-colors bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                  >
                    <Sparkles size={16} />
                    使用
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col flex-1 justify-center items-center p-4 text-sm text-center text-muted-foreground">
                <Info size={32} className="mb-2 opacity-20" />
                <p>选择一件物品查看详情</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
