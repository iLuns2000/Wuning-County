import React, { useState } from 'react';
import { X, Bird, Dog, Volume2, MessageCircle, Hand, Cookie } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { 
  BIRD_VALID_PHRASES, 
  DOG_BARK_ABILITY_REQUIREMENT,
  getDefaultClinicAnimalState
} from '@/data/clinicAnimalRules';
import {
  feedBird,
  teaseBird,
  teachBirdPhrase,
  interactDog,
  practiceDogBark,
  playBirdPhrase,
  canEnterClinic,
  canInteractAnimals,
  canTeachBird,
  getClinicAnimalSummary,
  ClinicAnimalActionResult
} from '@/services/clinicAnimalInteractionEngine';

interface ClinicAnimalModalProps {
  onClose: () => void;
}

type TabType = 'bird' | 'dog';

export const ClinicAnimalModal: React.FC<ClinicAnimalModalProps> = ({ onClose }) => {
  const vibrate = useGameVibrate();
  const [activeTab, setActiveTab] = useState<TabType>('bird');
  const [teachPhrase, setTeachPhrase] = useState('');
  const [showPhraseInput, setShowPhraseInput] = useState(false);

  const { day, addLog, playerStats, handleEventOption } = useGameStore();
  
  // 直接从 store 获取状态并调用引擎
  const getState = useGameStore.getState as () => any;
  const setState = (fn: (state: any) => any) => (useGameStore.setState as any)(fn);
  
  // 处理引擎结果并更新 store
  const processResult = (result: ClinicAnimalActionResult) => {
    if (result.success && result.effect) {
      // 应用效果（金钱、经验等）
      handleEventOption(result.effect, '');
    }
    // 更新动物状态
    if (result.statePatch) {
      setState((prevState: any) => ({
        clinicAnimals: {
          ...getDefaultClinicAnimalState(),
          ...(prevState.clinicAnimals || {}),
          ...result.statePatch
        }
      }));
    }
    // 解锁称号
    if (result.unlockedTitle) {
      const titleId = result.unlockedTitle === '咕咕嘎' ? 'title_gugu_ga' : 
                     result.unlockedTitle === '汪汪汪，谁家的小狗' ? 'title_wang_wang_wang' :
                     result.unlockedTitle === '一意孤行' ? 'title_yi_yi_gu_xing' : null;
      if (titleId) {
        setState((prevState: any) => {
          if (!prevState.achievements.includes(titleId)) {
            return {
              achievements: [...prevState.achievements, titleId],
              latestUnlockedAchievementId: titleId
            };
          }
          return {};
        });
      }
    }
  };
  
  const state = getState();
  
  const status = getClinicAnimalSummary(state);
  const clinicCheck = canEnterClinic(state);
  const animalCheck = canInteractAnimals(state);
  const teachCheck = canTeachBird(state);

  const handleClose = () => {
    setShowPhraseInput(false);
    setTeachPhrase('');
    onClose();
  };

  // 小啾互动
  const handleFeedNut = () => {
    const result = feedBird(state, 'nut');
    addLog(result.message || result.success ? '你给小啾喂了坚果。' : result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  const handleFeedFruit = () => {
    const result = feedBird(state, 'fruit');
    addLog(result.message || result.success ? '你给小啾喂了水果。' : result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  const handleTeaseBird = () => {
    const result = teaseBird(state);
    addLog(result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  const handleTeachPhrase = () => {
    if (!teachPhrase.trim()) return;
    const result = teachBirdPhrase(state, teachPhrase.trim());
    addLog(result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (result.success) {
      setTeachPhrase('');
      setShowPhraseInput(false);
    }
  };

  const handlePlayPhrase = () => {
    const result = playBirdPhrase(state);
    addLog(result.message);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  // 小狗互动
  const handlePetDog = () => {
    const result = interactDog(state, 'pet');
    addLog(result.message || result.success ? '你轻轻抚摸小花的头，它舒服地闭上眼睛。' : result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  const handleFeedDog = () => {
    const result = interactDog(state, 'feed');
    addLog(result.message || result.success ? '你给小花喂了零食，它高兴地摇尾巴。' : result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  const handleBarkLearn = () => {
    // 假设没有患者，实际需要根据医馆状态判断
    const result = practiceDogBark(state, false);
    addLog(result.message);
    processResult(result);
    vibrate(VIBRATION_PATTERNS.MEDIUM);
  };

  // 检查医馆是否可进入
  if (!clinicCheck.allowed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl p-6 animate-in zoom-in-95">
          <div className="text-center space-y-4">
            <div className="text-4xl">🚫</div>
            <h3 className="text-lg font-bold">无法进入医馆</h3>
            <p className="text-muted-foreground">{clinicCheck.reason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h3 className="text-lg font-bold">西林医馆 · 动物互动</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('bird')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'bird' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bird size={16} />
            <span>小啾（鹦鹉）</span>
          </button>
          <button
            onClick={() => setActiveTab('dog')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dog' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Dog size={16} />
            <span>小花（小狗）</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {activeTab === 'bird' ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                <div className="flex justify-between">
                  <span>今日喂食：{status.birdFeedToday} 次</span>
                  <span>已学语录：{status.birdLearnedCount} 句</span>
                </div>
                {status.hasTitle_gugu_ga && (
                  <div className="mt-2 text-amber-400 font-medium">✓ 已获得称号「咕咕嘎」</div>
                )}
              </div>

              {/* Feed Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFeedNut}
                  disabled={!animalCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    animalCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Cookie size={24} className="text-amber-600" />
                  <span className="text-sm font-medium">喂坚果</span>
                  <span className="text-xs text-red-400">-10文</span>
                  <span className="text-xs text-green-500">阅历+10</span>
                </button>
                <button
                  onClick={handleFeedFruit}
                  disabled={!animalCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    animalCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Bird size={24} className="text-green-500" />
                  <span className="text-sm font-medium">喂水果</span>
                  <span className="text-xs text-red-400">-10文</span>
                  <span className="text-xs text-green-500">阅历+15</span>
                </button>
              </div>

              {/* Tease & Teach */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTeaseBird}
                  disabled={!animalCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    animalCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Hand size={24} className="text-purple-500" />
                  <span className="text-sm font-medium">逗鸟</span>
                  <span className="text-xs text-red-400">-5体力</span>
                  <span className="text-xs text-green-500">阅历+5</span>
                </button>
                <button
                  onClick={() => setShowPhraseInput(true)}
                  disabled={!teachCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    teachCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                  title={!teachCheck.allowed ? teachCheck.reason : '教小啾说话'}
                >
                  <MessageCircle size={24} className="text-blue-500" />
                  <span className="text-sm font-medium">教说话</span>
                  <span className="text-xs text-muted-foreground">需喂食2次</span>
                </button>
              </div>

              {/* Play Phrases */}
              {status.birdLearnedCount > 0 && (
                <button
                  onClick={handlePlayPhrase}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <Volume2 size={18} className="text-cyan-500" />
                  <span className="text-sm font-medium">听小啾说话</span>
                </button>
              )}

              {/* Teach Phrase Input */}
              {showPhraseInput && (
                <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                  <div className="text-sm font-medium">教小啾说话</div>
                  <input
                    type="text"
                    value={teachPhrase}
                    onChange={(e) => setTeachPhrase(e.target.value)}
                    placeholder="输入要教的话（如：恭喜发财）"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    maxLength={8}
                  />
                  <div className="text-xs text-muted-foreground">
                    有效短语：{BIRD_VALID_PHRASES.slice(0, 5).join('、')}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPhraseInput(false)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleTeachPhrase}
                      disabled={!teachPhrase.trim()}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      确认教学
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                <div className="flex justify-between">
                  <span>累计学狗叫：{status.dogBarkTotal} 次</span>
                  <span>今日：{status.dogBarkToday}/{status.canBarkToday ? 2 : (status.hasTitle_wang_wang_wang ? 2 : 4)} 次</span>
                </div>
                {status.hasTitle_wang_wang_wang && (
                  <div className="mt-2 text-amber-400 font-medium">✓ 已获得称号「汪汪汪，谁家的小狗」</div>
                )}
              </div>

              {/* Dog Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePetDog}
                  disabled={!animalCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    animalCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Hand size={24} className="text-orange-500" />
                  <span className="text-sm font-medium">抚摸</span>
                  <span className="text-xs text-red-400">-5体力</span>
                  <span className="text-xs text-green-500">阅历+5</span>
                </button>
                <button
                  onClick={handleFeedDog}
                  disabled={!animalCheck.allowed}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                    animalCheck.allowed
                      ? 'border-border hover:bg-secondary/50 cursor-pointer'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Cookie size={24} className="text-amber-600" />
                  <span className="text-sm font-medium">喂零食</span>
                  <span className="text-xs text-red-400">-10文</span>
                  <span className="text-xs text-green-500">阅历+10</span>
                </button>
              </div>

              {/* Bark Learn */}
              <button
                onClick={handleBarkLearn}
                className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <Dog size={24} className="text-yellow-500" />
                <span className="text-sm font-medium">学狗叫</span>
                {status.hasTitle_wang_wang_wang ? (
                  // 称号后
                  <>
                    <span className="text-xs text-muted-foreground">今日剩余 {2 - status.dogBarkToday} 次</span>
                    <span className="text-xs text-amber-400">50%成功率</span>
                    <span className="text-xs text-green-500">成功：声望+30 金钱+50</span>
                  </>
                ) : status.dogBarkTotal < 4 ? (
                  // 前4次
                  <>
                    <span className="text-xs text-muted-foreground">累计 {status.dogBarkTotal}/5 次解锁称号</span>
                    <span className="text-xs text-red-400">-10声望 -10体力</span>
                  </>
                ) : (
                  // 第5次
                  <>
                    <span className="text-xs text-amber-400">解锁称号！</span>
                  </>
                )}
                {playerStats.ability < DOG_BARK_ABILITY_REQUIREMENT && (
                  <span className="text-xs text-red-400">需能力值 ≥{DOG_BARK_ABILITY_REQUIREMENT}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-secondary/20 text-xs text-muted-foreground">
          <span>医馆状态：正常营业</span>
          <span>高概率获得仙鹤草</span>
        </div>
      </div>
    </div>
  );
};
