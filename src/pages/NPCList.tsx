/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-19 22:18:57
 * @FilePath: \textgame\src\pages\NPCList.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, MessageCircle } from 'lucide-react';
import { npcs } from '@/data/npcs';
import { useGameStore } from '@/store/gameStore';
import { LogPanel } from '@/components/LogPanel';

export const NPCList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    npcRelations, 
    handleEventOption, 
    logs, 
    playerStats, 
    addLog,
    giftFailureCounts,
    incrementGiftFailure,
    resetGiftFailure,
    interactWithNPC
  } = useGameStore();

  const handleInteraction = (npcId: string, type: 'talk' | 'gift') => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    if (type === 'talk') {
      const result = interactWithNPC(npcId, 'chat');
      if (result.message) addLog(result.message);
    } else {
      // Gift logic
      if (playerStats.money < 50) {
        incrementGiftFailure(npcId);
        const currentCount = (giftFailureCounts[npcId] || 0) + 1;
        
        if (currentCount % 5 === 0) {
           handleEventOption(
             { relationChange: { [npcId]: -10 } },
             `你多次试图“空手套白狼”，${npc.name} 觉得你毫无诚意，对你的好感度下降了！`
           );
        } else {
           addLog(`金钱不足，无法购买礼物！(连续失败次数: ${currentCount})`);
        }
        return;
      }
      
      const result = interactWithNPC(npcId, 'gift');
      if (result.success) {
        resetGiftFailure(npcId);
        handleEventOption(
            { money: -50, relationChange: { [npcId]: 10 } }, 
            `你送了一份礼物给${npc.name}，对方很高兴。`
        );
      } else {
        addLog(result.message);
      }
    }
  };

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: NPC List */}
        <div className="flex overflow-hidden flex-col gap-4 w-full max-w-md h-full md:max-w-none">
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button 
              onClick={() => navigate('/game')}
              className="p-2 rounded-full hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">拜访 NPC</h1>
          </header>

          <div className="overflow-y-auto flex-1 pr-2 space-y-3 min-h-0">
            {npcs.map(npc => {
              const relation = npcRelations[npc.id] || 0;
              return (
                <div key={npc.id} className="p-4 space-y-3 rounded-lg border bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="flex gap-2 items-center text-lg font-bold">
                        {npc.name}
                        {relation >= 40 && (
                            <span className="px-2 py-0.5 text-xs font-normal rounded-full text-muted-foreground bg-secondary">
                                {npc.title}
                            </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{npc.description}</p>
                      
                      {relation >= 80 && (
                          <div className="p-2 mt-2 text-xs rounded bg-secondary/50 text-muted-foreground">
                              <strong>县居日常:</strong> 经常在集市和茶馆出没，喜欢收集古玩字画。
                          </div>
                      )}
                      
                      {relation >= 100 && (
                          <div className="p-2 mt-2 text-xs rounded bg-primary/10 text-foreground">
                              <strong>身世背景:</strong> {npc.background}
                          </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">好感度</div>
                      <div className="font-bold text-primary">{relation}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button 
                      onClick={() => handleInteraction(npc.id, 'talk')}
                      className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded transition-colors bg-secondary hover:bg-secondary/80"
                    >
                      <MessageCircle size={16} />
                      <span>闲聊</span>
                    </button>
                    <button 
                      onClick={() => handleInteraction(npc.id, 'gift')}
                      className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded transition-colors bg-secondary hover:bg-secondary/80"
                    >
                      <Gift size={16} />
                      <span>送礼 (-50金)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
