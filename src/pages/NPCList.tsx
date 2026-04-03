/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:41:56
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-29 10:18:38
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
import { simulateJiYiOuArcheryDuel, incrementArcheryDuelCount, simulateXuXiaoxiWudaoDuel, simulateXuXiaoxiChessDuel } from '@/services/npcDuelEngine';
import { resolveHunt } from '@/services/huntResolutionEngine';
import { ClinicAnimalModal } from '@/components/ClinicAnimalModal';

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
    giftItemToNpc,
    currentEvent,
    triggerSpecificEvent,
    dismissEvent,
    isMoGuRenaming,
    setIsMoGuRenaming,
    playerProfile,
    setPlayerProfile,
    role,
    flags
  } = useGameStore();

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('npcSearchTerm') || '';
  });
  const [sortType, setSortType] = useState<SortType>(() => {
    return (sessionStorage.getItem('npcSortType') as SortType) || 'default';
  });
  const [giftNpcId, setGiftNpcId] = useState<string | null>(null);
  const [giftNpcName, setGiftNpcName] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showClinicAnimalModal, setShowClinicAnimalModal] = useState(false);

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
      alert('名称修改请在npc列表找墨骨进行修改');
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
    const eventId = currentEvent.id;

    // 季一藕射箭切磋特殊处理
    if (eventId === 'ji_yi_ou_archery_duel' && option.label === '接受挑战') {
      handleJiYiOuArcheryDuel();
      return;
    }

    // 季一藕狩猎特殊处理
    if (eventId === 'ji_yi_ou_hunt' && option.label === '欣然前往') {
      handleJiYiOuHunt();
      return;
    }

    // 关山箭馆野猎
    if (eventId === 'guanshan_hunt' && option.label === '一同前往') {
      const s = useGameStore.getState();
      if (s.playerStats.health < 10) {
        addLog('体力不足，不妨歇息后再与馆主出猎。');
        vibrate(VIBRATION_PATTERNS.ERROR);
        return;
      }
      const hasArchery =
        s.achievements.includes('guanshan_hit_5') || s.achievements.includes('guanshan_hit_10');
      if (hasArchery) {
        if (s.playerStats.money < 800) {
          addLog('银两不足（需800文），只得作罢。');
          vibrate(VIBRATION_PATTERNS.ERROR);
          return;
        }
        handleEventOption(
          { money: -800, health: 10, reputation: 5, relationChange: { guanshan: 10 } },
          '关山朗声大笑：「好兄弟，一起冲！」你冲锋在前，与众兄弟大丰收，满载而归。'
        );
      } else {
        triggerSpecificEvent('guanshan_hunt_novice');
      }
      return;
    }

    if (eventId === 'guanshan_hunt_novice') {
      if (option.label === '小子初来乍到，自当听从馆主安排') {
        const s = useGameStore.getState();
        if (s.playerStats.money < 2000) {
          addLog('银两不足（需2000文），无法跟队出装。');
          vibrate(VIBRATION_PATTERNS.ERROR);
          return;
        }
        handleEventOption(
          {
            money: -2000,
            health: 3,
            reputation: 5,
            relationChange: { guanshan: 5 },
            itemsAdd: ['wild_hunt_meat_haul']
          },
          '你小心跟随，与众兄弟大丰收，满载而归，分得鲜肉三五斤。'
        );
        return;
      }
      if (option.label === '我自有万夫不当之勇，区区虫豸何足惧哉？') {
        const s = useGameStore.getState();
        if (s.playerStats.money < 2000) {
          addLog('银两不足（尚需赔付伤药杂项）。');
          vibrate(VIBRATION_PATTERNS.ERROR);
          return;
        }
        if (s.playerStats.health < 20) {
          addLog('体力过低，只怕撑不住这一趟惊险。');
          vibrate(VIBRATION_PATTERNS.ERROR);
          return;
        }
        handleEventOption(
          { money: -2000, health: -20, reputation: -5, relationChange: { guanshan: -5 } },
          '你逞强冲锋在前，不慎脚下打滑，掉到了野猪窝里，狼狈不堪……'
        );
        return;
      }
    }

    // 关山围炉夜话
    if (eventId === 'guanshan_night_fire' && option.label === '痛饮三碗！') {
      const s = useGameStore.getState();
      const hasArchery =
        s.achievements.includes('guanshan_hit_5') || s.achievements.includes('guanshan_hit_10');
      if (hasArchery) {
        handleEventOption(
          {
            experience: 5,
            itemsAdd: ['jingshanwei_hundred_token'],
            flagsSet: { guanshan_night_decline_streak: 0 }
          },
          '说到兴浓处，关山拍案：「当年便是如此这般！」他解下旧令塞入你掌心：「这件东西你且收好，将来遇险也许能救你一命。」'
        );
      } else {
        handleEventOption(
          { experience: 5, flagsSet: { guanshan_night_decline_streak: 0 } },
          '关山拍膝长叹：「当年便是如此这般……」酒过三巡，你只觉胸中所学见闻又广了几分。'
        );
      }
      return;
    }

    if (eventId === 'guanshan_night_fire' && option.label === '今晚不便，改日再叙') {
      const s = useGameStore.getState();
      const streak = (s.flags['guanshan_night_decline_streak'] || 0) + 1;
      const banned = streak >= 2;
      handleEventOption(
        {
          relationChange: { guanshan: -5 },
          flagsSet: {
            guanshan_night_decline_streak: streak,
            ...(banned ? { guanshan_night_fire_banned: true } : {})
          }
        },
        banned
          ? '关山嘿然一笑：「嘿！这小子～」他摇摇头——从此不再邀你围炉夜话。'
          : '关山嘿然道：「嘿！这小子～」'
      );
      return;
    }

    // 泠音乐坊：点歌 / 包场（支持半价券，一次抵扣一张）
    if (eventId === 'lingyin_enter' && (option.label === '点一首歌' || option.label === '我要包场！')) {
      const s = useGameStore.getState();
      const isFullHouse = option.label === '我要包场！';
      const baseCost = isFullHouse ? 5000 : 10;
      const hasVoucher = (s.inventory['lingyin_half_price_voucher'] || 0) > 0;
      const cost = hasVoucher ? Math.floor(baseCost / 2) : baseCost;
      if (s.playerStats.money < cost) {
        addLog(`银两不足（需 ${cost} 文）${hasVoucher ? '（已计半价券）' : ''}。`);
        vibrate(VIBRATION_PATTERNS.ERROR);
        return;
      }
      const rel = isFullHouse ? 30 : 5;
      const heal = isFullHouse ? 999 : 10;
      const baseMsg = isFullHouse
        ? '泠音眼睛倏地亮了：「终于有大冤种——咳，终于有知音了！」当晚乐坊只为你一人亮着灯。'
        : '泠音挽袖调弦：「客官要点首什么歌？」';
      const voucherNote = hasVoucher
        ? ' 你掏出泠音给的半价券，结算时只收了一半价钱。'
        : '';
      handleEventOption(
        {
          money: -cost,
          health: heal,
          relationChange: { ling_yin: rel },
          ...(hasVoucher ? { itemsRemove: ['lingyin_half_price_voucher'] } : {})
        },
        baseMsg + voucherNote
      );
      return;
    }

    if (eventId === 'lingyin_help_speaker' && option.label === '我来帮你') {
      if (playerStats.health < 20) {
        addLog('体力不足，折腾音箱只怕要先累趴下。');
        vibrate(VIBRATION_PATTERNS.ERROR);
        return;
      }
    }

    // 诩小溪比武挑战特殊处理
    if (eventId === 'xu_xiaoxi_wudao' && option.label === '挑战') {
      handleXuXiaoxiWudao();
      return;
    }

    // 诩小溪下棋挑战特殊处理
    if (eventId === 'xu_xiaoxi_chess' && option.label === '挑战') {
      handleXuXiaoxiChess();
      return;
    }

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
    // 使用通用赠礼函数
    const result = giftItemToNpc('ji_yi_ou', itemId);
    if (!result.success) {
      if (result.message) addLog(result.message);
      return;
    }

    resetGiftFailure('ji_yi_ou');
    setGiftNpcId(null);
    setGiftNpcName(null);
  };

  // 季一藕射箭切磋处理函数
  const handleJiYiOuArcheryDuel = () => {
    // 检查体力
    if (playerStats.health < 10) {
      addLog('体力不足，无法进行射箭切磋！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }
    // 检查银两
    if (playerStats.money < 10) {
      addLog('银两不足，输了可要赔钱的！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }

    // 计算切磋结果并获取新的计数
    const { newCount, huntUnlocked } = incrementArcheryDuelCount({ playerStats, flags } as any);

    // 计算切磋结果
    const outcome = simulateJiYiOuArcheryDuel({ playerStats, flags } as any);
    
    // 构建flagsSet
    const flagsSet: Record<string, any> = {
      'ji_yi_ou_archery_duel_count': newCount
    };
    if (huntUnlocked) {
      flagsSet['ji_yi_ou_hunt_unlocked'] = true;
    }

    // 应用效果
    handleEventOption(
      {
        money: outcome.effect.money,
        experience: outcome.effect.experience,
        accuracy: outcome.effect.accuracy,
        health: -10, // 每次切磋消耗10体力
        flagsSet
      },
      outcome.logMessage
    );

    // 检查是否解锁狩猎
    if (huntUnlocked) {
      addLog('【系统】你与季一藕的射箭切磋已达10次，解锁了新功能：狩猎邀请！');
    }

    // 关闭事件弹窗
    dismissEvent();
  };

  // 季一藕狩猎处理函数
  const handleJiYiOuHunt = () => {
    // 检查体力
    if (playerStats.health < 20) {
      addLog('狩猎需要不少体力，你还是先休息一下吧！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }

    // 解析狩猎结果
    const result = resolveHunt({ playerStats, flags } as any);
    
    // 应用效果
    handleEventOption(
      result.effect,
      result.logMessage
    );

    // 如果获得成就，直接添加到成就列表
    if (result.achievementId) {
      const currentAchievements = useGameStore.getState().achievements;
      if (!currentAchievements.includes(result.achievementId)) {
        // 直接更新成就列表
        useGameStore.setState(state => ({
          achievements: [...state.achievements, result.achievementId!],
          latestUnlockedAchievementId: result.achievementId
        }));
      }
    }

    // 关闭事件弹窗
    dismissEvent();
  };

  // 诩小溪比武挑战处理函数
  const handleXuXiaoxiWudao = () => {
    // 检查体力
    if (playerStats.health < 5) {
      addLog('体力不足，无法进行比武切磋！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }
    // 检查银两
    if (playerStats.money < 10) {
      addLog('银两不足，输了可要赔钱的！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }

    const outcome = simulateXuXiaoxiWudaoDuel({ playerStats, flags } as any);
    
    const relationChange = outcome.playerWon ? 5 : 2;
    const effect = { 
      money: outcome.effect.money || 0, 
      health: outcome.effect.health || 0,
      relationChange: { xu_xiaoxi: relationChange }
    };
    
    const displayMessage = outcome.playerWon ? outcome.winMessage : outcome.loseMessage;
    handleEventOption(effect, displayMessage || outcome.logMessage);
    dismissEvent();
  };

  // 诩小溪下棋挑战处理函数
  const handleXuXiaoxiChess = () => {
    // 检查体力
    if (playerStats.health < 5) {
      addLog('体力不足，无法进行下棋切磋！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }
    // 检查银两
    if (playerStats.money < 10) {
      addLog('银两不足，输了可要赔钱的！');
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }

    const outcome = simulateXuXiaoxiChessDuel({ playerStats, flags } as any);
    
    const relationChange = outcome.playerWon ? 5 : 2;
    const effect = { 
      money: outcome.effect.money || 0, 
      health: outcome.effect.health || 0,
      relationChange: { xu_xiaoxi: relationChange }
    };
    
    const displayMessage = outcome.playerWon ? outcome.winMessage : outcome.loseMessage;
    handleEventOption(effect, displayMessage || outcome.logMessage);
    dismissEvent();
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
        setGiftNpcId(npcId);
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
          className="flex absolute inset-0 justify-center items-center text-xs font-bold"
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
              className="p-2 rounded-full transition-colors hover:bg-secondary"
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
              ${isSearchFocused ? 'scale-105' : ''}`}>
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
                  className="absolute right-3 top-1/2 p-1 rounded-full transition-colors -translate-y-1/2 hover:bg-secondary"
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
                className="py-2 pr-8 pl-9 w-full text-sm rounded-xl border transition-all duration-300 appearance-none cursor-pointer outline-none bg-secondary/50 border-white/5 hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
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
                <span className="block mb-2 text-3xl">🔍</span>
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
                    <div className="flex gap-3 justify-between items-start">
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
                            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                            : 'opacity-60 cursor-not-allowed bg-secondary/50'
                          }
                        `}
                        title={isJiYiOu ? '带着美食拜访季一藕' : isGiftDisabled ? '金钱不足 (需50文)' : ''}
                      >
                        <Gift size={14} />
                        <span>送礼</span>
                      </button>

                      {/* 季一藕专属：医馆动物互动 */}
                      {npc.id === 'ji_yi_ou' && (
                        <button
                          onClick={() => {
                            setShowClinicAnimalModal(true);
                            vibrate(VIBRATION_PATTERNS.MEDIUM);
                          }}
                          className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded-lg transition-colors bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 min-w-[80px]"
                          title="西林医馆 - 与小啾、互动"
                        >
                          <span className="text-base">🏥</span>
                          <span>医馆</span>
                        </button>
                      )}

                      {/* 鲨鱼剃须刀专属：NPC入住申请 */}
                      {npc.id === 'shayu_tixudao' && (
                        <button
                          onClick={() => {
                            window.open('https://f.wps.cn/g/JZcuQ1nM/', '_blank');
                            vibrate(VIBRATION_PATTERNS.MEDIUM);
                          }}
                          className="flex flex-1 gap-2 justify-center items-center py-2 text-sm rounded-lg transition-colors bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 min-w-[80px]"
                          title="NPC入住申请"
                        >
                          <span className="text-base">📝</span>
                          <span>入住申请</span>
                        </button>
                      )}

                      {npc.interactionEventIds?.map(eventId => {
                        const event = npcEvents.find(e => e.id === eventId);
                        if (!event) return null;

                        const state = useGameStore.getState();

                        // 检查custom条件
                        if (event.triggerCondition?.custom) {
                          if (!event.triggerCondition.custom(state)) return null;
                        }

                        // 检查requiredItems条件
                        if (event.triggerCondition?.requiredItems) {
                          for (const [itemId, minCount] of Object.entries(event.triggerCondition.requiredItems)) {
                            if ((state.inventory[itemId] || 0) < minCount) return null;
                          }
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

      {giftNpcId && giftNpcName && (
        <NPCGiftModal
          npcId={giftNpcId}
          npcName={giftNpcName}
          onClose={() => { setGiftNpcId(null); setGiftNpcName(null); }}
          onConfirm={handleJiYiOuGiftConfirm}
        />
      )}

      {showClinicAnimalModal && (
        <ClinicAnimalModal onClose={() => setShowClinicAnimalModal(false)} />
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