import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { npcs } from '@/data/npcs';

export const Collection: React.FC = () => {
  const navigate = useNavigate();
  const { collectedScrolls } = useGameStore();

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
                  <div className="pt-2 text-xs text-right border-t text-muted-foreground">
                    赠予者: {npcName}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
