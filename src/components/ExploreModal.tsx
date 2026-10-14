import React, { useEffect, useState } from 'react';
import { Compass, Coins, Trophy, Package, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items } from '@/data/items';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface ExploreModalProps {
  onClose: () => void;
  embedded?: boolean;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({ onClose, embedded = false }) => {
  const { exploreResult, performExplore, isExploring } = useGameStore();
  const [showResult, setShowResult] = useState(false);
  const vibrate = useGameVibrate();

  useEffect(() => {
    // Start exploration immediately when mounted
    performExplore();
  }, []); // Empty dependency array to run once

  useEffect(() => {
    if (!isExploring && exploreResult) {
      const timer = setTimeout(() => {
        setShowResult(true);
        // Vibrate based on result
        if ((exploreResult.reputation || 0) > 0) {
            vibrate(VIBRATION_PATTERNS.SUCCESS); // Success
        } else {
            vibrate(VIBRATION_PATTERNS.MEDIUM); // Failure
        }
      }, 2000); // 2 seconds delay for "exploring" animation
      return () => clearTimeout(timer);
    }
  }, [isExploring, exploreResult, vibrate]);

  const gainedItem = exploreResult?.itemId ? items.find(i => i.id === exploreResult.itemId) : null;
  const isSuccess = (exploreResult?.reputation || 0) > 0;

  if (embedded) {
    const signed = (value = 0) => `${value >= 0 ? '+' : ''}${value}`;
    return <section className="modern-explore" aria-live="polite">
      <div className="modern-explore-heading">
        <span className="modern-explore-icon"><Compass size={24} /></span>
        <div><small>山野行记</small><h2>{showResult ? (isSuccess ? '满载归来' : '此行不易') : '行至山野'}</h2></div>
        <span className="modern-explore-status">{showResult ? '旅途结束' : '探索中'}</span>
      </div>
      {!showResult ? <div className="modern-explore-loading">
        <Compass size={36} className="animate-pulse" />
        <p>翻山越岭，寻觅奇珍异宝</p>
        <small>旅途结束后，收获会显示在这里。</small>
      </div> : <>
        <p className="modern-explore-story">{exploreResult?.message || '这段旅途已经结束。'}</p>
        {isSuccess && <div className="modern-explore-rewards">
          <div><Coins size={20} /><span>银两</span><strong>{signed(exploreResult?.money)}<small> 文</small></strong></div>
          <div><Trophy size={20} /><span>声望</span><strong>{signed(exploreResult?.reputation)}</strong></div>
          {gainedItem && <div><Package size={20} /><span>{gainedItem.name}</span><strong>获得物品</strong></div>}
        </div>}
        {gainedItem && isSuccess && <p className="modern-explore-item-note">{gainedItem.description}</p>}
        {isSuccess && !gainedItem && <p className="modern-explore-item-note">本次未发现特殊物品。</p>}
        <button className="modern-explore-return" onClick={onClose}>{isSuccess ? '收下奖励，返回县城' : '返回县城'}</button>
      </>}
    </section>;
  }

  return (
    <div className={embedded ? "mg-secondary-page mg-secondary-explore" : "flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm duration-300 bg-black/80 animate-in fade-in"}>
      {embedded && <div className="mg-secondary-intro"><div><h2>山野行记</h2><p>走出县城，等待这次旅途的收获。</p></div></div>}
      <div className="flex overflow-hidden relative flex-col w-full max-w-md rounded-xl border shadow-2xl bg-card border-border">
        
        {/* Close button (only when done) */}
        {showResult && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full transition-colors hover:bg-secondary"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          
          {!showResult ? (
            <div className="flex flex-col gap-6 items-center animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl animate-ping bg-primary/20" />
                <Compass size={64} className="text-primary animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-bold">正在探险中...</h2>
              <p className="text-muted-foreground">翻山越岭，寻觅奇珍异宝</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center w-full duration-300 animate-in zoom-in">
              {!isSuccess ? (
                <>
                  <h2 className="text-2xl font-bold text-destructive">探险失败</h2>
                  <div className="p-6 w-full text-center rounded-lg bg-destructive/10">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {exploreResult?.message}
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="py-3 w-full font-bold rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    灰溜溜回家
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary">探险归来</h2>
                  
                  {exploreResult?.message && (
                    <div className="p-3 w-full text-sm text-center rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {exploreResult.message}
                    </div>
                  )}

                  <div className="p-4 space-y-3 w-full rounded-lg bg-secondary/30">
                    <div className="flex justify-between items-center p-2 rounded border bg-card border-border/50">
                      <div className="flex gap-2 items-center">
                        <Coins className="text-yellow-500" size={20} />
                        <span>获得金钱</span>
                      </div>
                      <span className="font-bold">+{exploreResult?.money}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded border bg-card border-border/50">
                      <div className="flex gap-2 items-center">
                        <Trophy className="text-purple-500" size={20} />
                        <span>获得声望</span>
                      </div>
                      <span className="font-bold">+{exploreResult?.reputation}</span>
                    </div>

                    {gainedItem ? (
                      <div className="flex flex-col gap-2 p-3 mt-2 rounded border bg-primary/5 border-primary/20 animate-in slide-in-from-bottom-4">
                        <div className="flex gap-2 items-center font-bold text-primary">
                          <Package size={20} />
                          <span>获得物品</span>
                        </div>
                        <div className="flex flex-col items-center p-2">
                          <span className="text-lg font-bold">{gainedItem.name}</span>
                          <p className="mt-1 text-xs text-muted-foreground">{gainedItem.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 text-sm italic text-muted-foreground">
                        本次探险未发现特殊物品
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={onClose}
                    className="py-3 w-full font-bold rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    收下奖励
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
