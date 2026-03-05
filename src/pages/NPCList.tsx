/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-01 18:58:37
 * @FilePath: \textgame\src\pages\NPCList.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, MessageCircle, Sparkles, Search } from 'lucide-react';
import { npcs } from '@/data/npcs';
import { npcEvents } from '@/data/events';
import { useGameStore } from '@/store/gameStore';
import { LogPanel } from '@/components/LogPanel';
import { EventModal } from '@/components/EventModal';
import { NPCGiftModal } from '@/components/NPCGiftModal';
import { ProfileModal } from '@/components/ProfileModal';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { roles } from '@/data/roles';

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
    giftFoodToJiYiOu,
    currentEvent,
    triggerSpecificEvent,
    dismissEvent,
    isMoGuRenaming,
    setIsMoGuRenaming,
    playerProfile,
    setPlayerProfile,
    role
  } = useGameStore();

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('npcSearchTerm') || '';
  });
  const [sortType, setSortType] = useState<SortType>(() => {
    return (sessionStorage.getItem('npcSortType') as SortType) || 'default';
  });
  const [giftNpcName, setGiftNpcName] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 当搜索词变化时，保存到sessionStorage
  useEffect(() => {
    sessionStorage.setItem('npcSearchTerm', searchTerm);
  }, [searchTerm]);

  // 当排序类型变化时，保存到sessionStorage
  useEffect(() => {
    sessionStorage.setItem('npcSortType', sortType);
  }, [sortType]);

  useEffect(() => {
    if (isMoGuRenaming) {
      setShowProfileModal(true);
    }
  }, [isMoGuRenaming]);

  const handleSaveProfile = (name: string, avatar: string) => {
    const trimmedName = name.trim();
    const currentName = (playerProfile?.name || '').trim();
    const currentRoleConfig = roles.find(r => r.id === role);
    const defaultName = (currentRoleConfig?.name || '').trim();
    const hasUsedFreeNameChange = Boolean(playerProfile?.nameChangeUsed) || (!!defaultName && currentName !== defaultName);

    if (!trimmedName) {
      return;
    }

    if (trimmedName !== currentName && hasUsedFreeNameChange && !isMoGuRenaming) {
      setPlayerProfile({ avatar });
      addLog('【个人资料】名称修改请找墨骨进行修改。');
      alert('名称修改请找墨骨进行修改');
      return;
    }

    const nextProfile =
      trimmedName !== currentName
        ? { name: trimmedName, avatar, nameChangeUsed: true }
        : { avatar };

    setPlayerProfile(nextProfile);
    if (isMoGuRenaming) {
      setIsMoGuRenaming(false);
    }
    if (trimmedName !== currentName) {
      addLog(`你更新了个人资料，改名为“${trimmedName}”。`);
    } else {
      addLog('你更新了个人资料。');
    }
  };

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const currentRoleConfig = roles.find(r => r.id === role);
  const canEditProfileName = isMoGuRenaming || (!Boolean(playerProfile?.nameChangeUsed) && (playerProfile?.name || '').trim() === (currentRoleConfig?.name || '').trim());

  const filteredAndSortedNPCs = useMemo(() => {
    const trimmedTerm = deferredSearchTerm.trim();
    const lowerTerm = trimmedTerm.toLowerCase();
    const source = npcs;
    let result = trimmedTerm
      ? source.filter((npc) => {
          const name = npc.name ?? '';
          const title = npc.title ?? '';
          const description = npc.description ?? '';
          return (
            name.toLowerCase().includes(lowerTerm) ||
            title.toLowerCase().includes(lowerTerm) ||
            description.toLowerCase().includes(lowerTerm)
          );
        })
      : source;

    if (sortType === 'default') return result;

    const sorted = [...result].sort((a, b) => {
      const relationA = npcRelations[a.id] ?? 0;
      const relationB = npcRelations[b.id] ?? 0;

      switch (sortType) {
        case 'relation_desc':
          return relationB - relationA || a.id.localeCompare(b.id);
        case 'relation_asc':
          return relationA - relationB || a.id.localeCompare(b.id);
        case 'id_asc':
          return a.id.localeCompare(b.id);
        case 'id_desc':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    return sorted;
  }, [deferredSearchTerm, sortType, npcRelations]);

  const handleOptionSelect = (index: number) => {
    if (!currentEvent) return;
    const option = currentEvent.options[index];

    // Check for insufficient resources (health/money)
    if (option.effect) {
      let healthCost = 0;
      let moneyCost = 0;

      // Check flat costs
      if (option.effect.health && option.effect.health < 0) healthCost += -option.effect.health;
      if (option.effect.money && option.effect.money < 0) moneyCost += -option.effect.money;

      // Check nested playerStats costs
      if (option.effect.playerStats) {
        if (option.effect.playerStats.health && option.effect.playerStats.health < 0) healthCost += -option.effect.playerStats.health;
        if (option.effect.playerStats.money && option.effect.playerStats.money < 0) moneyCost += -option.effect.playerStats.money;
      }

      if (healthCost > 0 && playerStats.health < healthCost) {
        addLog('体力不足，无法进行此操作！');
        vibrate(VIBRATION_PATTERNS.ERROR);
        return;
      }
      if (moneyCost > 0 && playerStats.money < moneyCost) {
        addLog('银两不足，无法进行此操作！');
        vibrate(VIBRATION_PATTERNS.ERROR);
        return;
      }
    }

    handleEventOption(option.effect, option.message);
  };

  const handleJiYiOuGiftConfirm = (itemId: string) => {
    const result = giftFoodToJiYiOu(itemId);
    if (!result.success) {
      if (result.message) addLog(result.message);
      return;
    }

    resetGiftFailure('ji_yi_ou');
    setGiftNpcName(null);
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
      if (npcId === 'ji_yi_ou') {
        setGiftNpcName(npc.name);
        return;
      }

      // Generic gift logic for other NPCs
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
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                className="py-2 pr-10 pl-9 w-full text-sm rounded-md border-none outline-none bg-secondary/50 focus:ring-1 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transition-colors -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="清空搜索"
                >
                  ×
                </button>
              )}
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
                const isJiYiOu = npc.id === 'ji_yi_ou';
                const isGiftDisabled = !isJiYiOu && playerStats.money < 50;

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
                        disabled={isGiftDisabled}
                        className={`flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded transition-colors min-w-[80px] ${
                          !isGiftDisabled
                            ? 'bg-secondary hover:bg-secondary/80'
                            : 'bg-secondary/50 cursor-not-allowed opacity-60'
                        }`}
                        title={isJiYiOu ? '带着美食拜访季一藕' : isGiftDisabled ? '金钱不足 (需50文)' : ''}
                      >
                        <Gift size={16} />
                        <span>送礼</span>
                      </button>

                      {npc.interactionEventIds?.map(eventId => {
                        const event = npcEvents.find(e => e.id === eventId);
                        if (!event) return null;

                        // Check trigger conditions if they exist
                        if (event.triggerCondition?.custom) {
                          const state = useGameStore.getState();
                          if (!event.triggerCondition.custom(state)) return null;
                        }

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
        <EventModal
          event={currentEvent}
          playerStats={playerStats}
          onOptionSelect={handleOptionSelect}
          onClose={() => dismissEvent()}
        />
      )}

      {giftNpcName && (
        <NPCGiftModal
          npcName={giftNpcName}
          onClose={() => setGiftNpcName(null)}
          onConfirm={handleJiYiOuGiftConfirm}
        />
      )}

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          if (isMoGuRenaming) setIsMoGuRenaming(false);
        }}
        initialName={playerProfile?.name || ''}
        initialAvatar={playerProfile?.avatar || ''}
        canEditName={canEditProfileName}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
