import React, { useEffect, useState } from 'react';
import { Compass, Coins, Trophy, Package, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items } from '@/data/items';

interface ExploreModalProps {
  onClose: () => void;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({ onClose }) => {
  const { exploreResult, performExplore, isExploring } = useGameStore();
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Start exploration immediately when mounted
    performExplore();
  }, []); // Empty dependency array to run once

  useEffect(() => {
    if (!isExploring && exploreResult) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 2000); // 2 seconds delay for "exploring" animation
      return () => clearTimeout(timer);
    }
  }, [isExploring, exploreResult]);

  const gainedItem = exploreResult?.itemId ? items.find(i => i.id === exploreResult.itemId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col relative">
        
        {/* Close button (only when done) */}
        {showResult && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          
          {!showResult ? (
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
                <Compass size={64} className="text-primary animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-bold">正在探险中...</h2>
              <p className="text-muted-foreground">翻山越岭，寻觅奇珍异宝</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300 w-full">
              <h2 className="text-2xl font-bold text-primary">探险归来</h2>
              
              <div className="w-full bg-secondary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between p-2 bg-card rounded border border-border/50">
                  <div className="flex items-center gap-2">
                    <Coins className="text-yellow-500" size={20} />
                    <span>获得金钱</span>
                  </div>
                  <span className="font-bold">+{exploreResult?.money}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-card rounded border border-border/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-purple-500" size={20} />
                    <span>获得声望</span>
                  </div>
                  <span className="font-bold">+{exploreResult?.reputation}</span>
                </div>

                {gainedItem ? (
                  <div className="flex flex-col gap-2 p-3 bg-primary/5 rounded border border-primary/20 mt-2 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Package size={20} />
                      <span>获得物品</span>
                    </div>
                    <div className="flex flex-col items-center p-2">
                      <span className="text-lg font-bold">{gainedItem.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">{gainedItem.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-sm text-muted-foreground italic">
                    本次探险未发现特殊物品
                  </div>
                )}
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                收下奖励
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
