/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-25 12:25:12
 * @FilePath: \textgame\src\pages\NPCList.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React from 'react';import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, MessageCircle, Sparkles } from 'lucide-react';
import { npcs } from '@/data/npcs';
import { npcEvents } from '@/data/events';
import { useGameStore } from '@/store/gameStore';
import { LogPanel } from '@/components/LogPanel';
import { EventModal } from '@/components/EventModal';

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
    interactWithNPC,
    currentEvent,
    triggerSpecificEvent
  } = useGameStore();

  const handleOptionSelect = (index: number) => {
    if (!currentEvent) return;
    const option = currentEvent.options[index];
    handleEventOption(option.effect, option.message);
  };

  const handleInteraction = (npcId: string, type: 'talk' | 'gift' | 'event', eventId?: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    if (type === 'event' && eventId) {
      triggerSpecificEvent(eventId);
      return;
    }

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
                <div key={npc.id} className="p-4 space-y-3 rounded-lg border transition-colors cursor-pointer bg-card hover:border-primary/50" onClick={() => navigate(`/npcs/${npc.id}`)}>
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
                      
                      {npc.identityCode && (
                        <div className="mt-1 font-mono text-xs text-muted-foreground/70">
                          编号: {npc.identityCode}
                        </div>
                      )}
                      
                      {relation >= 80 && npc.dailyLife && (
                          <div className="p-2 mt-2 text-xs rounded bg-secondary/50 text-muted-foreground">
                              <strong>县居日常:</strong> {npc.dailyLife}
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

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleInteraction(npc.id, 'talk')}
                      className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded transition-colors bg-secondary hover:bg-secondary/80 min-w-[80px]"
                    >
                      <MessageCircle size={16} />
                      <span>闲聊</span>
                    </button>
                    <button 
                      onClick={() => handleInteraction(npc.id, 'gift')}
                      className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded transition-colors bg-secondary hover:bg-secondary/80 min-w-[80px]"
                    >
                      <Gift size={16} />
                      <span>送礼</span>
                    </button>
                    
                    {npc.interactionEventIds?.map(eventId => {
                      const event = npcEvents.find(e => e.id === eventId);
                      if (!event) return null;
                      return (
                        <button
                          key={eventId}
                          onClick={() => handleInteraction(npc.id, 'event', eventId)}
                          className="flex flex-1 gap-2 justify-center items-center py-2 text-sm font-medium rounded transition-colors bg-primary/10 text-primary hover:bg-primary/20 min-w-[80px]"
                          title={event.description}
                        >
                          <Sparkles size={16} />
                          <span>{event.title}</span>
                        </button>
                      );
                    })}
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
      
      {currentEvent && (
        <EventModal event={currentEvent} onOptionSelect={handleOptionSelect} />
      )}
    </div>
  );
};
