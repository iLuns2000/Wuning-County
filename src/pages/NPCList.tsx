/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-11
 * @FilePath: \textgame\src\pages\NPCList.tsx
 * @Description: NPC列表页 - 古风UI优化版
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, MessageCircle, Sparkles, Search, SortAsc, X } from 'lucide-react';
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

const sortLabels: Record<SortType, string> = {
  default: '默认排序',
  relation_desc: '好感度 ↓',
  relation_asc: '好感度 ↑',
  id_asc: '姓名 A→Z',
  id_desc: '姓名 Z→A',
};

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      addLog(`你更新了个人资料，改名为"${trimmedName}"。`);
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

    if (option.effect) {
      let healthCost = 0;
      let moneyCost = 0;

      if (option.effect.health && option.effect.health < 0) healthCost += -option.effect.health;
      if (option.effect.money && option.effect.money < 0) moneyCost += -option.effect.money;

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

      if (playerStats.money < 50) {
        incrementGiftFailure(npcId);
        const currentCount = (giftFailureCounts[npcId] || 0) + 1;

        if (currentCount % 5 === 0) {
          handleEventOption(
            { relationChange: { [npcId]: -10 } },
            `你多次试图"空手套白狼"，${npc.name} 觉得你毫无诚意，对你的好感度下降了！`
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

  // 好感度进度环SVG
  const RelationRing: React.FC<{ value: number; max?: number }> = ({ value, max = 100 }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const strokeDashoffset = circumference * (1 - progress);
    
    // 颜色根据好感度变化
    const getColor = () => {
      if (value >= 80) return '#10b981'; // 绿色 - 生死之交
      if (value >= 50) return '#3b82f6'; // 蓝色 - 挚友
      if (value >= 30) return '#8b5cf6'; // 紫色 - 认识
      return '#6b7280'; // 灰色 - 陌生人
    };

    return (
      <div className="relative w-9 h-9">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          {/* 背景环 */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/10"
          />
          {/* 进度环 */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <span 
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: getColor() }}
        >
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">

        {/* Left: NPC List */}
        <div className="flex overflow-hidden flex-col gap-4 w-full max-w-md h-full md:max-w-none">
          {/* 头部 */}
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button
              onClick={() => navigate('/game')}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display">拜访 NPC</h1>
            </div>
          </header>

          {/* 搜索和筛选区域 - 古风样式 */}
          <div className="flex flex-col gap-2 px-1">
            {/* 搜索框 - 古风样式 */}
            <div className={`
              relative transition-all duration-300
              ${isSearchFocused ? 'scale-105' : ''}
            `}>
              <Search 
                className={`
                  absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
                  ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}
                `} 
                size={16} 
              />
              <input
                type="text"
                placeholder="搜索 NPC 姓名、称号、描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`
                  py-2.5 pr-10 pl-10 w-full text-sm rounded-xl
                  bg-secondary/50 border 
                  transition-all duration-300
                  placeholder:text-muted-foreground/60
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                  ${isSearchFocused 
                    ? 'border-primary/50 bg-secondary/70 shadow-lg shadow-primary/10' 
                    : 'border-white/5 hover:border-white/10'
                  }
                `}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
                  title="清空搜索"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* 排序选择器 - 古风样式 */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="
                  w-full py-2 pl-9 pr-8 text-sm 
                  bg-secondary/50 rounded-xl border border-white/5
                  outline-none cursor-pointer
                  transition-all duration-300
                  hover:border-primary/30
                  focus:border-primary/50 focus:ring-2 focus:ring-primary/20
                  appearance-none
                "
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {/* 自定义下拉箭头 */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* NPC 列表 */}
          <div className="overflow-y-auto flex-1 pr-2 space-y-3 min-h-0">
            {filteredAndSortedNPCs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <span className="text-3xl mb-2 block">🔍</span>
                <span>未找到匹配的 NPC</span>
              </div>
            ) : (
              filteredAndSortedNPCs.map(npc => {
                const relation = npcRelations[npc.id] || 0;
                const isJiYiOu = npc.id === 'ji_yi_ou';
                const isGiftDisabled = !isJiYiOu && playerStats.money < 50;

                return (
                  <div 
                    key={npc.id} 
                    className="p-4 space-y-3 rounded-xl border transition-all duration-300 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="flex gap-2 items-center text-lg font-bold">
                          {npc.name}
                          {relation >= 40 && (
                            <span className="px-2 py-0.5 text-xs font-normal rounded-full text-muted-foreground bg-secondary">
                              {npc.title}
                            </span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{npc.description}</p>

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
                      
                      {/* 好感度进度环 */}
                      <div className="shrink-0">
                        <RelationRing value={relation} />
                      </div>
                    </div>

                    {/* 交互按钮 */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                      {/* 详情按钮 */}
                      <button
                        onClick={() => navigate(`/npcs/${npc.id}`)}
                        className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded-lg transition-colors bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground min-w-[80px]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>详情</span>
                      </button>
                      <button
                        onClick={() => handleInteraction(npc.id, 'talk')}
                        className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded-lg transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 min-w-[80px]"
                      >
                        <MessageCircle size={14} />
                        <span>闲聊</span>
                      </button>
                      <button
                        onClick={() => handleInteraction(npc.id, 'gift')}
                        disabled={isGiftDisabled}
                        className={`
                          flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded-lg transition-colors min-w-[80px]
                          ${!isGiftDisabled
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-secondary/50 cursor-not-allowed opacity-60'
                          }
                        `}
                        title={isJiYiOu ? '带着美食拜访季一藕' : isGiftDisabled ? '金钱不足 (需50文)' : ''}
                      >
                        <Gift size={14} />
                        <span>送礼</span>
                      </button>

                      {npc.interactionEventIds?.map(eventId => {
                        const event = npcEvents.find(e => e.id === eventId);
                        if (!event) return null;

                        if (event.triggerCondition?.custom) {
                          const state = useGameStore.getState();
                          if (!event.triggerCondition.custom(state)) return null;
                        }

                        return (
                          <button
                            key={eventId}
                            onClick={() => handleInteraction(npc.id, 'event', eventId)}
                            className="flex flex-1 gap-2 justify-center items-center py-2 text-sm font-medium rounded-lg transition-colors bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 min-w-[80px]"
                            title={event.description}
                          >
                            <Sparkles size={14} />
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