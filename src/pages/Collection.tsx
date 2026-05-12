import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { npcs } from '@/data/npcs';
import { Scroll as ScrollType } from '@/types/game';

export const Collection: React.FC = () => {
  const navigate = useNavigate();
  const { collectedScrolls, openScroll } = useGameStore();
  const [revealingScroll, setRevealingScroll] = useState<ScrollType | null>(null);
  const [showContent, setShowContent] = useState(false);

  const handleOpen = (scroll: ScrollType) => {
    if (scroll.opened) {
      // Already opened, just show content
      setRevealingScroll(scroll);
      setShowContent(true);
      return;
    }
    // Open the scroll first
    openScroll(scroll.id);
    setRevealingScroll(scroll);
    setShowContent(false);
    // Trigger reveal animation
    setTimeout(() => setShowContent(true), 300);
  };

  const closeModal = () => {
    setRevealingScroll(null);
    setShowContent(false);
  };

  // Get the latest data from store after openScroll updates it
  const getUpdatedScroll = (id: string) => collectedScrolls.find(s => s.id === id);

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="space-y-6 w-full max-w-2xl">
        <header className="flex gap-4 items-center py-2 shrink-0">
          <button
            onClick={() => navigate('/game')}
            className="p-2 rounded-full transition-colors hover:bg-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex gap-2 items-center text-xl font-bold">
            <Scroll className="text-primary" />
            藏珍匣
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collectedScrolls.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-lg border-2 border-dashed text-muted-foreground">
              <p>暂无收藏</p>
              <p className="mt-2 text-xs">与 NPC 建立深厚羁绊或许能获得意外之喜...</p>
            </div>
          ) : (
            collectedScrolls.map((scroll) => {
              const npcName = scroll.npcId ? npcs.find(n => n.id === scroll.npcId)?.name : '未知';

              return (
                <div key={scroll.id} className="p-4 rounded-lg border shadow-sm transition-shadow bg-card hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-primary">{scroll.name}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                      第 {scroll.obtainedAt} 天获得
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{scroll.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      赠予者: {npcName}
                    </span>
                    <button
                      onClick={() => handleOpen(scroll)}
                      className="flex gap-1 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {scroll.opened ? (
                        <>查看卷轴</>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          展开卷轴
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Scroll Content Modal */}
      {revealingScroll && (() => {
        const latest = getUpdatedScroll(revealingScroll.id) || revealingScroll;
        return (
          <div
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60"
            onClick={closeModal}
          >
            <div
              className={`relative w-full max-w-md p-6 rounded-xl border-2 shadow-2xl bg-card transition-all duration-500 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="flex gap-2 items-center text-lg font-bold text-primary">
                  <Scroll size={20} />
                  卷轴内容
                </h2>
                <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                  第 {latest.obtainedAt} 天获得
                </span>
              </div>

              <div className="p-4 mb-4 rounded-lg border-2 border-dashed bg-secondary/50 border-primary/30">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {latest.openedContent || '卷轴上的文字模糊不清，无法辨认...'}
                </p>
              </div>

              <div className="text-xs text-right text-muted-foreground">
                赠予者: {latest.npcId ? npcs.find(n => n.id === latest.npcId)?.name : '未知'}
              </div>

              <button
                onClick={closeModal}
                className="px-4 py-2 mt-4 w-full text-sm font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                收好卷轴
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
