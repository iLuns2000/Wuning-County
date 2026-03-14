import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { StatsDisplay } from '@/components/StatsDisplay';
import { LogPanel } from '@/components/LogPanel';
import { EventModal } from '@/components/EventModal';
import { useNavigate } from 'react-router-dom';
import { Moon, Briefcase, Coffee, Users, Star, FileText, ScrollText, Scroll, ShoppingBag, Building2, Dices, Landmark, Gem, Heart, Bird, BookOpen, Shield, User } from 'lucide-react';
import { roles } from '@/data/roles';
import { tasks } from '@/data/tasks';
import { PolicyModal } from '@/components/PolicyModal';
import { policies } from '@/data/policies';
import { ProfileModal } from '@/components/ProfileModal';
import { TimeManager } from '@/components/TimeManager';
import { TalentModal } from '@/components/TalentModal';
import { AchievementModal } from '@/components/AchievementModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MarketModal } from '@/components/MarketModal';
import { EstateModal } from '@/components/EstateModal';
import { OfficeModal } from '@/components/OfficeModal';
import { InventoryModal } from '@/components/InventoryModal';
import { ExploreModal } from '@/components/ExploreModal';
import { SnackStreetModal } from '@/components/SnackStreetModal';
import { TreasureModal } from '@/components/TreasureModal';
import { CharityModal } from '@/components/CharityModal';
import { AchievementPopup } from '@/components/AchievementPopup';
import { Settings, Backpack, Compass, Leaf, Utensils, Trees, Shovel, Trophy } from 'lucide-react';
import { achievements as achievementData } from '@/data/achievements';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { LeekGardenModal } from '@/components/LeekGardenModal';
import { PlayStreetModal } from '@/components/PlayStreetModal';
import { WillowGardenModal } from '@/components/WillowGardenModal';
import { RaidAlertOverlay } from '@/components/RaidAlertOverlay';
import { DebuffPanel } from '@/components/DebuffPanel';
import { items } from '@/data/items';
import { Effect, StyleTag } from '@/types/game';
import { ChoiceModal } from '@/components/ChoiceModal';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { getBackgroundImage, BACKGROUND_IMAGES } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const vibrate = useGameVibrate();
  const screenOrientation = useScreenOrientation();
  const { theme } = useTheme();
  
  // 判断是否为浅色模式
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 根据主题和毛玻璃开关决定背景样式
  const getGlassClass = (baseClasses: string = '') => {
    // 如果关闭毛玻璃效果，或者浅色模式，都使用纯色背景
    const shouldUseGlass = glassEffectEnabled && !isLightMode;
    const glassClasses = shouldUseGlass
      ? 'bg-black/30 backdrop-blur-md border-white/10'
      : 'bg-card border-border';
    return `${baseClasses} ${glassClasses}`.trim();
  };
  
  const [showPolicies, setShowPolicies] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showTalents, setShowTalents] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showMarket, setShowMarket] = React.useState(false);
  const [showEstates, setShowEstates] = React.useState(false);
  const [showOffice, setShowOffice] = React.useState(false);
  const [showInventory, setShowInventory] = React.useState(false);
  const [showExplore, setShowExplore] = React.useState(false);
  const [showSnackStreet, setShowSnackStreet] = React.useState(false);
  const [showLeekGarden, setShowLeekGarden] = React.useState(false);
  const [showWillowGarden, setShowWillowGarden] = React.useState(false);
  const [showTreasure, setShowTreasure] = React.useState(false);
  const [showCharity, setShowCharity] = React.useState(false);
  const [showPlayStreet, setShowPlayStreet] = React.useState(false);
  const [isNightWarning, setIsNightWarning] = React.useState(false);
  const [showTeaPopup, setShowTeaPopup] = React.useState(false);
  const [showChoiceModal, setShowChoiceModal] = React.useState(false);
  const [isNight, setIsNight] = useState(false);
  
  // 背景图过渡状态
  const [currentBg, setCurrentBg] = useState<string>('');
  const [nextBg, setNextBg] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [choiceModalData, setChoiceModalData] = React.useState<{
    title: string;
    description: string;
    choices: Array<{
      id: string;
      label: string;
      description: string;
      icon?: React.ReactNode;
      effects: Array<string>;
      onClick: () => void;
    }>;
  } | null>(null);

  const { 
    role, 
    day, 
    weather,
    playerStats,
    playerProfile,
    setPlayerProfile,
    countyStats, 
    logs, 
    currentEvent, 
    nextDay, 
    handleEventOption,
    addLog,
    currentTaskId,
    handleTaskAction,
    dailyCounts,
    incrementDailyCount,
    activePolicyId,
    setPolicy,
    cancelPolicy,
    flags,
    latestUnlockedAchievementId,
    dismissAchievementPopup,
    equippedApparel,
    equippedAccessories,
    processResourceTick,
    dismissEvent,
    fillCave,
    externalThreat,
    maintainCountyDefense,
    isGameOver,
    resetGame,
    isMoGuRenaming,
    setIsMoGuRenaming,
    raidAlert,
    dismissRaidAlert,
    showBackgroundImage,
    glassEffectEnabled,
  } = useGameStore();

  const currentTask = (currentTaskId && tasks) ? tasks.find(t => t.id === currentTaskId) : null;
  const activePolicy = activePolicyId ? policies.find(p => p.id === activePolicyId) : null;
  const latestAchievement = latestUnlockedAchievementId ? achievementData.find(a => a.id === latestUnlockedAchievementId) : null;
  
  const MAX_DAILY_WORK = 3;
  const MAX_DAILY_REST = 1;

  // 判断背景图类型
  const getBackgroundType = (): string => {
    if (!showBackgroundImage) return '';
    
    // 判断是否为雨天（包括大雨、小雨等）
    const isRainy = weather === 'rain_heavy' || weather === 'rain_light';
    
    // 白天且雨天 → 雨天背景
    if (!isNight && isRainy) {
      return BACKGROUND_IMAGES.GAME_RAIN;
    }
    // 夜晚 → 夜晚背景
    if (isNight) {
      return BACKGROUND_IMAGES.GAME_NIGHT;
    }
    // 白天 → 白天背景
    return BACKGROUND_IMAGES.GAME_DAY;
  };

  const backgroundType = getBackgroundType();
  const isVertical = screenOrientation === 'vertical';
  const backgroundImage = backgroundType ? getBackgroundImage(isVertical, backgroundType) : '';

  // 监听背景图变化，触发淡入淡出过渡
  useEffect(() => {
    if (!showBackgroundImage || !backgroundImage) {
      // 如果关闭背景图功能，清空所有背景
      setCurrentBg('');
      setNextBg('');
      setIsTransitioning(false);
      return;
    }

    // 如果当前没有背景，直接设置（初始化）
    if (!currentBg) {
      setCurrentBg(backgroundImage);
      return;
    }

    // 如果背景图发生变化，开始过渡
    if (backgroundImage !== currentBg) {
      // 如果已经在过渡中，先立即完成当前过渡
      if (isTransitioning && nextBg) {
        setCurrentBg(nextBg);
        setNextBg('');
        setIsTransitioning(false);
      }

      // 开始新的过渡
      setNextBg(backgroundImage);
      setIsTransitioning(true);
      
      // 1.5秒后完成过渡（与CSS过渡时间一致）
      const timer = setTimeout(() => {
        setCurrentBg(backgroundImage);
        setNextBg('');
        setIsTransitioning(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [backgroundImage, showBackgroundImage, currentBg, isTransitioning, nextBg]);

  // Meiwu Tea Seeking Logic
  const isTeaDay = ((day - 1) % 360 + 1) === 61 && weather === 'sunny';

  // Resource Tick Timer (2 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
        processResourceTick();
    }, 2000);
    return () => clearInterval(timer);
  }, [processResourceTick]);

  useEffect(() => {
    if (isTeaDay && !flags['tea_seeking_popup_shown']) {
      setShowTeaPopup(true);
      handleEventOption({
        flagsSet: { tea_seeking_popup_shown: true }
      });
    }
  }, [isTeaDay, flags, handleEventOption]);

  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (isNightWarning) {
       addLog('【天色渐晚】太阳即将落山，这一天快要结束了...');
       // Reset warning after a few seconds to avoid spamming (or just let it be handled by log deduplication if any)
       const timer = setTimeout(() => setIsNightWarning(false), 5000);
       return () => clearTimeout(timer);
    }
  }, [isNightWarning]);

  useEffect(() => {
    if (isMoGuRenaming) {
      setShowProfileModal(true);
    }
  }, [isMoGuRenaming]);

  if (!role) return null;


  if (isGameOver) {
    const gameOverBg = getBackgroundImage(
      screenOrientation === 'vertical',
      screenOrientation === 'vertical' 
        ? BACKGROUND_IMAGES.GAME_RUINED_VERTICAL 
        : BACKGROUND_IMAGES.GAME_RUINED
    );
    
    return (
      <div className="relative flex justify-center items-center p-6 min-h-screen overflow-hidden">
        {/* 背景图层 */}
        <div 
          className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${gameOverBg})` }}
        />
        
        {/* 内容区域 */}
        <div className="relative z-10 p-6 space-y-4 w-full max-w-xl text-center rounded-xl border bg-card/95 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-rose-600">县城已毁于战火</h2>
          <p className="text-muted-foreground">山贼与战乱彻底摧毁了无宁县。你可以重新开局，尝试更稳健地维护治安与边防。</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                resetGame();
                navigate('/');
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              重新开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getItemScore = (price?: number) => {
    const base = 10 + Math.floor((price || 0) / 200);
    return Math.min(30, Math.max(8, base));
  };

  const computeStyleScores = (preferred?: StyleTag[]) => {
    const styleScores: Record<StyleTag, number> = { 清雅: 0, 华贵: 0, 英气: 0, 俏皮: 0, 典雅: 0 };
    const equippedIds = [
      ...Object.values(equippedApparel).filter((id): id is string => !!id),
      ...equippedAccessories
    ];
    const equippedItems = equippedIds.map(id => items.find(i => i.id === id)).filter((i): i is typeof items[number] => !!i);
    let totalScore = 0;
    equippedItems.forEach(item => {
      if (!item.style) return;
      const score = getItemScore(item.price);
      styleScores[item.style] += score;
      totalScore += score;
    });
    const matchScore = preferred ? preferred.reduce((sum, style) => sum + (styleScores[style] || 0), 0) : 0;
    const ratio = totalScore > 0 ? matchScore / totalScore : 0;
    let tier: 'none' | 'normal' | 'good' | 'excellent' = 'none';
    let bonusPercent = 0;
    if (matchScore >= 40 && ratio >= 0.7) {
      tier = 'excellent';
      bonusPercent = 20;
    } else if (matchScore >= 25 && ratio >= 0.45) {
      tier = 'good';
      bonusPercent = 12;
    } else if (matchScore >= 15 && ratio >= 0.25) {
      tier = 'normal';
      bonusPercent = 6;
    }
    return { styleScores, totalScore, matchScore, tier, bonusPercent };
  };

  const applyStyleBonus = (effect?: Effect, bonusPercent?: number): Effect | undefined => {
    if (!effect || !bonusPercent) return effect;
    const factor = 1 + bonusPercent / 100;
    const scale = (value?: number) => (value && value > 0 ? Math.floor(value * factor) : value);
    const next: Effect = { ...effect };
    if (effect.playerStats) {
      next.playerStats = {
        money: scale(effect.playerStats.money),
        reputation: scale(effect.playerStats.reputation),
        ability: scale(effect.playerStats.ability),
        health: scale(effect.playerStats.health),
        experience: scale(effect.playerStats.experience)
      };
    }
    if (effect.countyStats) {
      next.countyStats = {
        economy: scale(effect.countyStats.economy),
        order: scale(effect.countyStats.order),
        culture: scale(effect.countyStats.culture),
        livelihood: scale(effect.countyStats.livelihood)
      };
    }
    next.money = scale(effect.money);
    next.reputation = scale(effect.reputation);
    next.ability = scale(effect.ability);
    next.health = scale(effect.health);
    next.experience = scale(effect.experience);
    next.economy = scale(effect.economy);
    next.order = scale(effect.order);
    next.culture = scale(effect.culture);
    next.livelihood = scale(effect.livelihood);
    return next;
  };

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

    const preferred = currentEvent.stylePreference?.preferred;
    const match = computeStyleScores(preferred);
    const boostedEffect = applyStyleBonus(option.effect, match.bonusPercent);
    const baseMessage = option.message || '';
    const message = match.bonusPercent > 0 ? `${baseMessage}${baseMessage ? ' ' : ''}穿搭加成${match.bonusPercent}%` : baseMessage;
    handleEventOption(boostedEffect, message, option.addDebuffIds);
  };

  const handleWork = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (dailyCounts.work >= MAX_DAILY_WORK) {
      addLog('今天的工作已经够多了，要注意劳逸结合。');
      return;
    }

    // Simple work logic based on role
    let msg = '';
    let money = 0;
    let reputation = 0;
    const healthCost = -10;

    if (playerStats.health < 10) {
      addLog('你太累了，需要休息！');
      return;
    }

    if (role === 'magistrate') {
      msg = '你处理了一天的公务，县城治安有所改善。';
      reputation = 5;
    } else if (role === 'merchant') {
      msg = '你用心经营店铺，获得了一些收益。';
      // Passive effect: Merchant gains 20% more money
      money = Math.floor(20 * 1.2);
    } else {
      msg = '你在城中行侠仗义，帮助了几个路人。';
      reputation = 10;
    }
    
    incrementDailyCount('work');
    handleEventOption({ money, reputation, health: healthCost }, msg);
  };

  const handleRest = () => {
     vibrate(VIBRATION_PATTERNS.LIGHT);
     if (dailyCounts.rest >= MAX_DAILY_REST) {
       addLog('你今天已经休息过了，不宜太过懒散。');
       return;
     }

     // Passive effect: Hero recovers more health
     const healAmount = role === 'hero' ? 30 : 20;
     const msg = role === 'hero' 
       ? '你运功调息，体力恢复得很快。' 
       : '你休息了一整天，感觉精力充沛。';
    
    incrementDailyCount('rest');
    handleEventOption({ health: healAmount }, msg);
  };

  const handleSaveProfile = (name: string, avatar: string) => {
    const trimmedName = name.trim();
    const currentName = (playerProfile?.name || '').trim();
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

  const handleSpecialAbility = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 15) {
      addLog('体力不足，无法使用技能！');
      return;
    }

    if (role === 'magistrate') {
      // 巡视乡里: Cost 15 Health, +3 Random County Stat, +5 Rep
      const stats = ['economy', 'order', 'culture', 'livelihood'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      const statName = { economy: '经济', order: '治安', culture: '文化', livelihood: '民生' }[randomStat];
      
      handleEventOption({ 
        health: -15, 
        reputation: 5,
        ability: 2, // Add ability gain
        countyStats: { [randomStat]: 3 }
      }, `你深入乡里巡视，解决了百姓的实际困难，${statName}有所提升，处理政务的能力也得到了锻炼。`);
    } 
    else if (role === 'merchant') {
      // 风险投资: Cost 100 Money + 10 Health
      if (playerStats.money < 100) {
        addLog('资金不足，无法进行投资！');
        return;
      }

      const isSuccess = Math.random() > 0.5;
      if (!isSuccess) {
        handleEventOption({
          money: -100,
          health: -10,
          ability: 1
        }, '市场风云变幻，这次投资血本无归... 但你从中吸取了教训。');
        return;
      }

      // 投资成功后，显示选择弹窗
      setChoiceModalData({
        title: '投资大获成功！',
        description: '你的眼光独到，这次投资获得了丰厚回报。你准备如何处理这笔收益？',
        choices: [
          {
            id: 'profit',
            label: '逐利方案',
            description: '将利润最大化，专注于商业扩张',
            icon: <Briefcase className="w-6 h-6" />,
            effects: ['金钱 +120', '体力 -10', '能力 +2'],
            onClick: () => {
              handleEventOption({
                money: 120,
                health: -10,
                ability: 2
              }, '你的眼光独到，投资大获成功！你选择了将利润最大化，商业头脑更敏锐了。');
              setShowChoiceModal(false);
            }
          },
          {
            id: 'reputation',
            label: '名望方案',
            description: '赞助书院，以财富换文化声誉',
            icon: <BookOpen className="w-6 h-6" />,
            effects: ['金钱 +40', '文化 +2', '声望 +5', '体力 -10', '能力 +2'],
            onClick: () => {
              handleEventOption({
                money: 40,
                health: -10,
                ability: 2,
                culture: 2,
                reputation: 5
              }, '你的眼光独到，投资大获成功！你决定赞助县学书院，虽然利润减少，但赢得了士大夫阶层的赞誉，你的文化声望也随之提升。');
              setShowChoiceModal(false);
            }
          }
        ]
      });
      setShowChoiceModal(true);
    }
    else if (role === 'hero') {
      // 闭关修炼: Cost 30 Health, +5 Ability
      if (playerStats.health < 30) {
        addLog('体力不足，无法闭关！');
        return;
      }

      // 闭关修炼后，显示选择弹窗
      setChoiceModalData({
        title: '闭关修炼完成',
        description: '你闭关修炼，领悟了新的武学要义！接下来你打算如何运用这次修炼的成果？',
        choices: [
          {
            id: 'solo',
            label: '独自精进',
            description: '继续独自钻研武学，追求个人武力的极致',
            icon: <User className="w-6 h-6" />,
            effects: ['体力 -30', '能力 +5'],
            onClick: () => {
              handleEventOption({
                health: -30,
                ability: 5
              }, '你闭关修炼，独自领悟了新的武学要义。');
              setShowChoiceModal(false);
            }
          },
          {
            id: 'teach',
            label: '开馆授徒',
            description: '将武学传授给后辈，传承武学精神',
            icon: <BookOpen className="w-6 h-6" />,
            effects: ['体力 -40', '能力 +3', '文化 +2', '声望 +3'],
            onClick: () => {
              if (playerStats.health < 40) {
                addLog('体力不足，开馆授徒需要额外消耗！');
                setShowChoiceModal(false);
                return;
              }
              handleEventOption({
                health: -40,
                ability: 3,
                culture: 2,
                reputation: 3
              }, '你闭关修炼后，决定开馆授徒，将武学传授给后辈。虽然分散了精力提升自身武学，但你的武学思想和江湖声望都得到了传承和弘扬。');
              setShowChoiceModal(false);
            }
          }
        ]
      });
      setShowChoiceModal(true);
    }
  };

  const currentRoleConfig = roles.find(r => r.id === role);
  const canEditProfileName = isMoGuRenaming || (!Boolean(playerProfile?.nameChangeUsed) && (playerProfile?.name || '').trim() === (currentRoleConfig?.name || '').trim());
  
  const isHeavySnow = weather === 'snow_heavy';

  // 解析最近一条夜袭日志中的损失数值，用于警报显示
  const raidLossInfo = React.useMemo(() => {
    const raidLog = logs.find(l => l.includes('山贼夜袭县境'));
    if (!raidLog) return {};
    const money = raidLog.match(/损失银两 (\d+) 文/)?.[1];
    const order = raidLog.match(/治安-(\d+)/)?.[1];
    const livelihood = raidLog.match(/民生-(\d+)/)?.[1];
    return {
      moneyLoss: money ? Number(money) : undefined,
      orderLoss: order ? Number(order) : undefined,
      livelihoodLoss: livelihood ? Number(livelihood) : undefined,
    };
  }, [raidAlert, logs]);

  return (
    <div className="relative flex justify-center p-4 min-h-screen overflow-hidden">
      {/* 动态背景图层 - 双层交叉淡入淡出 */}
      {showBackgroundImage && (
        <>
          {/* 当前背景层（底层） */}
          {currentBg && (
            <div 
              className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${currentBg})`,
                opacity: isTransitioning ? 0 : 1,
                zIndex: 0,
                transition: 'opacity 1500ms ease-in-out'
              }}
            />
          )}
          
          {/* 新背景层（顶层） */}
          {nextBg && (
            <div 
              className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${nextBg})`,
                opacity: isTransitioning ? 1 : 0,
                zIndex: 1,
                transition: 'opacity 1500ms ease-in-out'
              }}
            />
          )}
        </>
      )}
      
      {/* 内容区域 */}
      <div className="relative z-10 flex justify-center w-full min-h-screen">
        <TimeManager 
          onNightWarning={() => setIsNightWarning(true)} 
          onNightChange={(night) => setIsNight(night)}
        />
        <div 
          className="grid grid-cols-1 gap-6 w-full max-w-7xl md:grid-cols-3 md:h-[calc(100vh-2rem)]"
          style={{
            backgroundColor: isTeaDay ? 'rgba(0,191,255,0.3)' : 'transparent'
          }}
        >
        
        {/* Left Column: Stats - 毛玻璃效果 */}
        <div className={`flex overflow-y-auto flex-col gap-6 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar rounded-xl p-2 ${getGlassClass()}`}>
          <header className="flex justify-between items-center py-2 shrink-0">
            <h1 className="text-xl font-bold">无宁县</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.LIGHT);
                  navigate('/manual');
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
                title="游戏说明"
              >
                <BookOpen size={20} />
              </button>
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.LIGHT);
                  setShowSettings(true);
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
                title="系统设置"
              >
                <Settings size={20} />
              </button>
            </div>
          </header>

          <StatsDisplay 
            playerStats={playerStats} 
            countyStats={countyStats} 
            day={day} 
            weather={weather}
            playerProfile={playerProfile}
            onEditProfile={() => setShowProfileModal(true)}
            onOpenTalents={() => setShowTalents(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenOffice={() => setShowOffice(true)}
            equippedApparel={equippedApparel}
            equippedAccessories={equippedAccessories}
            externalThreat={externalThreat}
          />
          
          <DebuffPanel />
        </div>

        {/* Middle Column: Actions */}
        <div className="flex overflow-y-auto flex-col gap-6 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          {currentTask && (
            <div className="space-y-1">
              <h2 className="ml-1 text-sm font-semibold text-muted-foreground">当前任务</h2>
              <div className={`p-4 space-y-2 rounded-lg border shadow-sm text-card-foreground border-primary/20 ${getGlassClass()}`}>
                <div className="flex gap-2 justify-between items-start">
                  <h3 className="flex gap-2 items-center text-base font-bold shrink-0">
                     <FileText size={18} className="text-primary" />
                     <span>{currentTask.title}</span>
                  </h3>
                  <span className="px-2 py-1 text-xs text-right rounded-full bg-primary/10 text-primary">
                    {currentTask.goalDescription}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{currentTask.description}</p>
                
                {currentTask.specialAction && (
                  <button
                    onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        handleTaskAction();
                    }}
                    disabled={!!currentEvent}
                    className="flex gap-2 justify-center items-center p-2 mt-2 w-full text-sm font-medium rounded border transition-colors bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 disabled:opacity-50"
                  >
                    <span>{currentTask.specialAction.label}</span>
                    <span className="text-xs opacity-70">({currentTask.specialAction.costText})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleWork}
              disabled={!!currentEvent || dailyCounts.work >= MAX_DAILY_WORK || isHeavySnow}
              className={`flex relative gap-2 justify-center items-center p-4 rounded-lg transition-colors disabled:opacity-50 group/btn ${getGlassClass('hover:bg-black/40')}`}
              title={isHeavySnow ? "大雪封山，无法工作" : ""}
            >
              <Briefcase size={20} />
              <span>日常工作 ({dailyCounts.work}/{MAX_DAILY_WORK})</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  大雪停工
                </div>
              )}
            </button>
            <button 
              onClick={handleRest}
              disabled={!!currentEvent || dailyCounts.rest >= MAX_DAILY_REST}
              className={`flex gap-2 justify-center items-center p-4 rounded-lg transition-colors disabled:opacity-50 ${getGlassClass('hover:bg-black/40')}`}
            >
              <Coffee size={20} />
              <span>休息整顿 ({dailyCounts.rest}/{MAX_DAILY_REST})</span>
            </button>
            
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                maintainCountyDefense();
              }}
              disabled={!!currentEvent || !!flags['defense_maintained_daily']}
              className="flex gap-2 justify-center items-center p-4 text-rose-700 bg-rose-50 rounded-lg transition-colors hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 disabled:opacity-50"
            >
              <Shield size={20} />
              <span>巡防维护（每日一次）</span>
            </button>
            
            {role === 'magistrate' && (
               <div className="flex flex-col col-span-2 gap-2">
                 <button 
                   onClick={() => {
                     vibrate(VIBRATION_PATTERNS.LIGHT);
                     setShowPolicies(true);
                   }}
                   disabled={!!currentEvent}
                   className="flex justify-between items-center p-4 w-full rounded-lg border transition-colors bg-card border-primary/20 hover:bg-primary/5 disabled:opacity-50"
                 >
                   <div className="flex gap-2 items-center">
                     <FileText size={20} className="text-primary" />
                     <span className="font-bold">施政方针</span>
                   </div>
                   <div className="text-sm text-muted-foreground">
                     {activePolicy ? (
                       <span className="font-medium text-primary">{activePolicy.name}</span>
                     ) : (
                       <span>暂无政令</span>
                     )}
                   </div>
                 </button>
               </div>
            )}

            <div className="flex flex-col col-span-2 gap-1">
              <button 
                onClick={handleSpecialAbility}
                disabled={!!currentEvent}
                className="flex flex-col gap-1 justify-center items-center p-3 w-full rounded-lg border transition-colors bg-primary/10 border-primary/20 hover:bg-primary/20 disabled:opacity-50 group"
              >
                <div className="flex gap-2 items-center font-bold text-primary">
                  <Star size={18} />
                  <span>{currentRoleConfig?.specialAbility?.name || '专属技能'}</span>
                </div>
                <span className="text-xs transition-colors text-muted-foreground group-hover:text-primary/80">
                  {currentRoleConfig?.specialAbility?.costText}
                </span>
              </button>
              <p className="px-4 text-xs text-center whitespace-pre-line text-muted-foreground">
                {currentRoleConfig?.specialAbility?.description}
              </p>
            </div>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/npcs');
              }}
              disabled={!!currentEvent || isHeavySnow}
              className="flex relative gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50 group/btn"
              title={isHeavySnow ? "大雪封山，无法出行" : ""}
            >
              <Users size={20} />
              <span>拜访 NPC</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  大雪封路
                </div>
              )}
            </button>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/tasks');
              }}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <ScrollText size={20} />
              <span>任务记录</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowSnackStreet(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-orange-600 bg-orange-100 rounded-lg transition-transform dark:bg-orange-950/30 dark:text-orange-400 group-hover:scale-110">
                <Utensils size={18} />
              </div>
              <span className="text-sm font-medium">小吃街</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowMarket(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-amber-600 bg-amber-100 rounded-lg transition-transform dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110">
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-medium">西市集</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowPlayStreet(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-pink-600 bg-pink-100 rounded-lg transition-transform dark:bg-pink-950/30 dark:text-pink-400 group-hover:scale-110">
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-medium">游乐街</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowLeekGarden(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-emerald-600 bg-emerald-100 rounded-lg transition-transform dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110">
                <Leaf size={18} />
              </div>
              <span className="text-sm font-medium">韭菜园</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowWillowGarden(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-green-600 bg-green-100 rounded-lg transition-transform dark:bg-green-950/30 dark:text-green-400 group-hover:scale-110">
                <Trees size={18} />
              </div>
              <span className="text-sm font-medium">柳园</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowEstates(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-indigo-600 bg-indigo-100 rounded-lg transition-transform dark:bg-indigo-950/30 dark:text-indigo-400 group-hover:scale-110">
                <Building2 size={18} />
              </div>
              <span className="text-sm font-medium">产业置办</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/leaderboard');
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-amber-600 bg-amber-100 rounded-lg transition-transform dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110">
                <Trophy size={18} />
              </div>
              <span className="text-sm font-medium">财富榜</span>
            </button>

            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowTreasure(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-purple-600 bg-purple-100 rounded-lg transition-transform dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110">
                <Gem size={18} />
              </div>
              <span className="text-sm font-medium">珍宝阁</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowCharity(true);
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-rose-600 bg-rose-100 rounded-lg transition-transform dark:bg-rose-950/30 dark:text-rose-400 group-hover:scale-110">
                <Heart size={18} />
              </div>
              <span className="text-sm font-medium">善行义举</span>
            </button>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/facilities');
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-cyan-600 bg-cyan-100 rounded-lg transition-transform dark:bg-cyan-950/30 dark:text-cyan-400 group-hover:scale-110">
                <Dices size={18} />
              </div>
              <span className="text-sm font-medium">游乐坊</span>
            </button>

            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/pigeon-race');
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-sky-600 bg-sky-100 rounded-lg transition-transform dark:bg-sky-950/30 dark:text-sky-400 group-hover:scale-110">
                <Bird size={18} />
              </div>
              <span className="text-sm font-medium">赛鸽场</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/buildings');
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 rounded-lg transition-transform bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:scale-110">
                <Landmark size={18} />
              </div>
              <span className="text-sm font-medium">建筑阁</span>
            </button>
            
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowExplore(true);
              }}
              disabled={!!currentEvent || isHeavySnow || (dailyCounts.explore || 0) >= 2}
              className={`flex relative gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 group/btn ${getGlassClass()}`}
              title={isHeavySnow ? "大雪封山，无法探险" : ""}
            >
              <div className="p-2 text-teal-600 bg-teal-100 rounded-lg transition-transform dark:bg-teal-950/30 dark:text-teal-400 group-hover:scale-110">
                <Compass size={18} />
              </div>
              <span className="text-sm font-medium">外出探险</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  无法探险
                </div>
              )}
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                fillCave();
              }}
              disabled={!!currentEvent || dailyCounts.caveFilled}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-amber-600 bg-amber-100 rounded-lg transition-transform dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110">
                <Shovel size={18} />
              </div>
              <span className="text-sm font-medium">填洞 (100文)</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/collection');
              }}
              disabled={!!currentEvent}
              className={`flex gap-3 items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 text-yellow-600 bg-yellow-100 rounded-lg transition-transform dark:bg-yellow-950/30 dark:text-yellow-400 group-hover:scale-110">
                <Scroll size={18} />
              </div>
              <span className="text-sm font-medium">藏珍匣</span>
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                setShowInventory(true);
              }}
              disabled={!!currentEvent}
              className={`flex col-span-2 gap-3 justify-center items-center p-3 rounded-xl border shadow-sm transition-all group hover:shadow hover:border-primary/30 hover:bg-accent/50 active:scale-95 disabled:opacity-50 ${getGlassClass()}`}
            >
              <div className="p-2 rounded-lg transition-transform bg-primary/10 text-primary group-hover:scale-110">
                <Backpack size={18} />
              </div>
              <span className="text-sm font-medium">行囊</span>
            </button>
          </div>

          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.MEDIUM);
              nextDay();
            }}
            disabled={!!currentEvent}
            className="flex gap-2 justify-center items-center p-4 w-full text-lg font-bold rounded-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Moon size={24} />
            <span>结束这一天</span>
          </button>
        </div>

        {/* Right Column: Logs */}
        <div className="mx-auto w-full max-w-md h-96 md:h-[768px] md:max-w-none">
          <LogPanel logs={logs} />
        </div>

      </div>
      </div>

      {currentEvent && (
        <EventModal
          event={currentEvent}
          playerStats={playerStats}
          onOptionSelect={handleOptionSelect}
          onClose={() => dismissEvent()}
          styleMatch={(() => {
            const preferred = currentEvent.stylePreference?.preferred || [];
            const match = computeStyleScores(preferred);
            return {
              preferred,
              totalScore: match.totalScore,
              matchScore: match.matchScore,
              tier: match.tier,
              bonusPercent: match.bonusPercent
            };
          })()}
        />
      )}

      {showPolicies && role === 'magistrate' && (
        <PolicyModal 
          activePolicyId={activePolicyId} 
          onSelect={setPolicy}
          onCancel={cancelPolicy}
          onClose={() => setShowPolicies(false)}
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

      <TalentModal isOpen={showTalents} onClose={() => setShowTalents(false)} />
      <AchievementModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
      {showSnackStreet && <SnackStreetModal onClose={() => setShowSnackStreet(false)} />}
      {showEstates && <EstateModal onClose={() => setShowEstates(false)} />}
      {showOffice && <OfficeModal onClose={() => setShowOffice(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showExplore && <ExploreModal onClose={() => setShowExplore(false)} />}
      {showLeekGarden && <LeekGardenModal onClose={() => setShowLeekGarden(false)} />}
      {showWillowGarden && <WillowGardenModal onClose={() => setShowWillowGarden(false)} />}
      {showPlayStreet && <PlayStreetModal onClose={() => setShowPlayStreet(false)} />}
      {showTreasure && <TreasureModal onClose={() => setShowTreasure(false)} />}
      {showCharity && <CharityModal onClose={() => setShowCharity(false)} />}

      {showChoiceModal && choiceModalData && (
        <ChoiceModal
          isOpen={showChoiceModal}
          onClose={() => setShowChoiceModal(false)}
          title={choiceModalData.title}
          description={choiceModalData.description}
          choices={choiceModalData.choices}
        />
      )}

      {showTeaPopup && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
          <div className="p-6 max-w-sm text-center rounded-lg shadow-xl duration-300 bg-card border-primary/20 animate-in fade-in zoom-in">
             <div className="flex justify-center mb-4 text-primary">
                <ScrollText size={48} />
             </div>
             <h3 className="mb-2 text-xl font-bold">梅坞寻茶</h3>
             <p className="mb-4 text-muted-foreground">
               恭喜你今天是三月三，天水蓝，阳光照暖了青杉
             </p>
             <div className="p-2 mb-4 text-sm font-medium rounded bg-secondary/50 text-primary">
                获得成就《梅坞寻茶》
             </div>
             <button 
               onClick={() => setShowTeaPopup(false)}
               className="px-4 py-2 w-full font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
             >
               收下这份美好
             </button>
          </div>
        </div>
      )}

      {latestAchievement && (
        <AchievementPopup 
          achievement={latestAchievement} 
          onClose={dismissAchievementPopup} 
        />
      )}

      {raidAlert && (
        <RaidAlertOverlay
          moneyLoss={raidLossInfo.moneyLoss}
          orderLoss={raidLossInfo.orderLoss}
          livelihoodLoss={raidLossInfo.livelihoodLoss}
          onDismiss={dismissRaidAlert}
        />
      )}
    </div>
  );
};

