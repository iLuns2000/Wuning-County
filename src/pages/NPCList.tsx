/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-31 16:59:51
 * @FilePath: \textgame\src\pages\NPCList.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, MessageCircle, Sparkles, Search } from 'lucide-react';
import { npcs } from '@/data/npcs';
import { npcEvents } from '@/data/events';
import { useGameStore } from '@/store/gameStore';
import { LogPanel } from '@/components/LogPanel';
import { EventModal } from '@/components/EventModal';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

type SortType = 'default' | 'relation_desc' | 'relation_asc' | 'id_asc' | 'id_desc';

export const NPCList: React.FC = () => {
  const navigate = useNavigate();
  const vibrate = useGameVibrate();
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

  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<SortType>('default');

  const filteredAndSortedNPCs = useMemo(() => {
    let result = [...npcs];

    // Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(npc => 
        npc.name.toLowerCase().includes(lowerTerm) ||
        npc.title.toLowerCase().includes(lowerTerm) ||
        npc.description.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    result.sort((a, b) => {
      const relationA = npcRelations[a.id] || 0;
      const relationB = npcRelations[b.id] || 0;

      switch (sortType) {
        case 'relation_desc':
          return relationB - relationA;
        case 'relation_asc':
          return relationA - relationB;
        case 'id_asc':
          return a.id.localeCompare(b.id);
        case 'id_desc':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    return result;
  }, [searchTerm, sortType, npcRelations]);

  const handleOptionSelect = (index: number) => {
    if (!currentEvent) return;
    const option = currentEvent.options[index];
    handleEventOption(option.effect, option.message);
  };

  const handleInteraction = (npcId: string, type: 'talk' | 'gift' | 'event', eventId?: string) => {
    // 统一添加轻微震动反馈
    vibrate(VIBRATION_PATTERNS.LIGHT);

    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;

    if (type === 'event' && eventId) {
      const result = interactWithNPC(npcId, 'action');
      if (result.success) {
        triggerSpecificEvent(eventId);
      } else {
        addLog(result.message);
      }
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
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">拜访 NPC</h1>
            </div>
          </header>

          <div className="flex flex-col gap-2 px-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="搜索 NPC 姓名、称号、描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-9 w-full text-sm rounded-md border-none outline-none bg-secondary/50 focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
               <select 
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="px-3 py-1.5 text-sm bg-secondary/50 rounded-md border-none outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full"
               >
                 <option value="default">默认排序</option>
                 <option value="relation_desc">好感度 (从高到低)</option>
                 <option value="relation_asc">好感度 (从低到高)</option>
                 <option value="id_asc">ID (A→Z)</option>
                 <option value="id_desc">ID (Z→A)</option>
               </select>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 space-y-3 min-h-0">
            {filteredAndSortedNPCs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    未找到匹配的 NPC
                </div>
            ) : (
                filteredAndSortedNPCs.map(npc => {
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
            })
          )}
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
